import path from 'path';

/**
 * Analyzes code elements affecting Interaction to Next Paint (INP).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} INP recommendations
 */
export function analyzeInp(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    const content = file.content;
    const lines = content.split('\n');

    // 1. Interaction Event Handler Analysis & Long JS Tasks
    ast.jsxTags.forEach(tag => {
      // Find interaction handlers
      const interactionAttrs = tag.attributes.filter(attr => 
        ['onClick', 'onKeyDown', 'onKeyUp', 'onInput', 'onChange', 'onSubmit', 'pointerdown', 'pointerup'].includes(attr.name)
      );

      interactionAttrs.forEach(attr => {
        const handlerName = attr.name;
        const handlerValue = String(attr.value);

        // Resolve exact handler function definition if available
        let targetLine = attr.loc?.start?.line || tag.line || 1;
        let handlerFunction = null;
        if (ast.functions && ast.functions[handlerValue]) {
          targetLine = ast.functions[handlerValue];
          handlerFunction = handlerValue;
        }

        // Check if handler triggers synchronous fetch without transition/pending wrappers
        const isAsyncCall = content.includes('fetch(') || content.includes('axios(') || content.includes('XMLHttpRequest');
        const hasTransition = content.includes('startTransition') || content.includes('useTransition');

        if (isAsyncCall && !hasTransition) {
          recommendations.push({
            type: 'code',
            file: file.filePath,
            line: targetLine,
            cwv: 'inp',
            severity: 'medium',
            message: `Un-deferred network request inside interactive handler "${handlerName}".`,
            impact: 'Triggering asynchronous network fetches directly inside synchronous event handlers without transition wrappers can block main-thread response states.',
            suggestion: 'Wrap the state updates resulting from this network trigger in startTransition() or immediately toggle a responsive loading/pending UI state.',
            handler: handlerName,
            handlerFunction,
            operation: 'fetch'
          });
        }

        // Check for long JS operations (map/filter/JSON.parse) inside the file containing the handler
        const hasHeavyOps = content.includes('.map(') && content.includes('.filter(') && (content.includes('JSON.parse') || content.includes('JSON.stringify'));
        if (hasHeavyOps) {
          recommendations.push({
            type: 'code',
            file: file.filePath,
            line: targetLine,
            cwv: 'inp',
            severity: 'medium',
            message: `Potential heavy JavaScript task in handler context for "${handlerName}".`,
            impact: 'Performing synchronous collections filtering/mapping or JSON serialization blocks the main thread from completing interaction paint states.',
            suggestion: 'Consider offloading heavy calculations to a Web Worker, debouncing, or breaking up the task using requestIdleCallback().',
            handler: handlerName,
            handlerFunction,
            operation: 'computation'
          });
        }
        // Check for async/await handlers and promise chains
        const isPromiseChain = content.includes('.then(') || content.includes('.catch(') || content.includes('await ');
        if (isPromiseChain) {
          recommendations.push({
            type: 'code',
            file: file.filePath,
            line: targetLine,
            cwv: 'inp',
            severity: 'medium',
            message: `Async operations / Promise chains detected inside handler "${handlerName}".`,
            impact: 'Awaiting network requests or processing responses inside interaction threads can trigger hydration lags or blocking rendering states.',
            suggestion: 'Defer post-fetch calculations using requestIdleCallback() or wrap state changes in startTransition().',
            handler: handlerName,
            handlerFunction,
            operation: 'async'
          });
        }

        // Check for React State Updates causing Render loops
        const hasStateUpdate = /set[A-Z][a-zA-Z]*\(/.test(content);
        if (hasStateUpdate && content.includes('.map(')) {
          recommendations.push({
            type: 'code',
            file: file.filePath,
            line: targetLine,
            cwv: 'inp',
            severity: 'medium',
            message: `React state update triggering component render inside handler "${handlerName}".`,
            impact: 'Updating state values directly in event loops causes heavy subtree re-renders, stalling visual paint presentation.',
            suggestion: 'Use React.memo(), useTransition(), or dynamic virtualization to optimize re-render cycles.',
            handler: handlerName,
            handlerFunction,
            operation: 'react-rendering'
          });
        }
      });
    });

    // 2. Forced Synchronous Layout Detection (Reflow/Thrashing)
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const isWrite = /style\.[a-zA-Z]+\s*=|classList\.(add|remove|toggle)/i.test(lineText);
      if (isWrite) {
        // Look ahead 5 lines for a read
        for (let offset = 1; offset <= 5; offset++) {
          const nextIdx = idx + offset;
          if (nextIdx < lines.length) {
            const nextLine = lines[nextIdx];
            const isRead = /offset(Width|Height)|client(Width|Height)|scroll(Width|Height)|getBoundingClientRect|getComputedStyle/i.test(nextLine);
            if (isRead) {
              recommendations.push({
                type: 'code',
                file: file.filePath,
                line: lineNum,
                cwv: 'inp',
                severity: 'medium',
                message: 'Potential Forced Synchronous Layout (Layout Thrashing) detected.',
                impact: 'Alternating DOM writes and reads forces the browser to calculate layout recalculations synchronously, stalling frame presentation.',
                suggestion: 'Batch DOM reads together first, then perform all DOM writes. Use requestAnimationFrame() to defer write operations.',
                operation: 'reflow'
              });
              break;
            }
          }
        }
      }
    });

    // 3. React-Specific render loop issues
    const isComponent = path.basename(file.filePath).match(/^[A-Z]/);
    if (isComponent) {
      const hasLargeList = content.includes('.map(') && content.includes('return') && !content.includes('memo(');
      if (hasLargeList) {
        recommendations.push({
          type: 'code',
          file: file.filePath,
          line: 1,
          cwv: 'inp',
          severity: 'low',
          message: 'Large un-memoized list layout render.',
          impact: 'Rendering multiple elements dynamically without component memoization forces a complete subtree recalculation during interaction updates.',
          suggestion: 'Wrap the component in React.memo() or use useMemo() to memoize list item computations.',
          operation: 'react-memo'
        });
      }
    }
  }

  // 4. Third-Party Script integrations
  files.forEach(f => {
    if (f.ext === '.html' || f.relativePath.endsWith('Document.js') || f.relativePath.endsWith('Document.tsx')) {
      const matches = f.content.match(/<script[^>]+src=["']([^"']+)["']/g) || [];
      matches.forEach(scriptTag => {
        const isThirdParty = !scriptTag.includes('localhost') && !scriptTag.includes('src="/') && !scriptTag.includes('src="./');
        const hasDeferOrAsync = scriptTag.includes('defer') || scriptTag.includes('async');
        
        if (isThirdParty && !hasDeferOrAsync) {
          recommendations.push({
            type: 'code',
            file: f.filePath,
            line: 1,
            cwv: 'inp',
            severity: 'low',
            message: `Synchronous Third-Party Script: "${scriptTag}"`,
            impact: 'Synchronous third-party scripts block document parsing and execution, adding latency before interaction handlers can respond.',
            suggestion: 'Add "defer" or "async" attribute to the script, or load it dynamically after user interaction.',
            operation: 'third-party'
          });
        }
      });
    }
  });

  return recommendations;
}
