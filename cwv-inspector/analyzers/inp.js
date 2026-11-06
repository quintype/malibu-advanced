import path from 'path';
import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';

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

        // Scope check to the handler function if defined, or inline handler
        let searchScope = '';
        if (handlerFunction && ast.functions[handlerFunction]) {
          const funcStartLine = Math.max(0, ast.functions[handlerFunction] - 1);
          searchScope = lines.slice(funcStartLine, funcStartLine + 35).join('\n');
        } else if (attr.value === 'inline-handler' && attr.loc) {
          const attrStart = Math.max(0, (attr.loc.start?.line || 1) - 1);
          searchScope = lines.slice(attrStart, attrStart + 10).join('\n');
        }

        // If handler is an external prop, reference, or simple inline toggle, do not blindly run whole-file regex matches
        if (!searchScope) return;

        // Check if handler triggers synchronous fetch without transition/pending wrappers
        const isAsyncCall = searchScope.includes('fetch(') || searchScope.includes('axios(') || searchScope.includes('XMLHttpRequest');
        const hasTransition = searchScope.includes('startTransition') || searchScope.includes('useTransition') || content.includes('startTransition');

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
            whyExplanation: `Event handler "${handlerName}" at line ${targetLine} initiates a network call without startTransition(). React holds the current UI unpainted while processing, creating a laggy interaction delay (INP).`,
            codeContext: extractCodeContext(file.content, targetLine),
            fixCode: {
              before: `const ${handlerFunction || 'onAction'} = async () => {\n  const res = await fetch(...);\n  setData(res);\n};`,
              after: `const [isPending, startTransition] = useTransition();\nconst ${handlerFunction || 'onAction'} = () => {\n  startTransition(async () => {\n    const res = await fetch(...);\n    setData(res);\n  });\n};`,
              description: 'Use startTransition so the browser can immediately acknowledge the user tap/click before network resolution.'
            },
            handler: handlerName,
            handlerFunction,
            operation: 'fetch'
          });
        }

        // Check for long JS operations inside the handler
        const hasHeavyOps = searchScope.includes('.map(') && searchScope.includes('.filter(') && (searchScope.includes('JSON.parse') || searchScope.includes('JSON.stringify'));
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
            whyExplanation: `At line ${targetLine}, event handler "${handlerName}" performs intensive array transformations or JSON parsing synchronously. This blocks the main thread for >50ms, stalling input responsiveness.`,
            codeContext: extractCodeContext(file.content, targetLine),
            fixCode: {
              before: `const ${handlerFunction || 'handleInput'} = () => {\n  const parsed = JSON.parse(...);\n  const filtered = items.filter(...).map(...);\n};`,
              after: `const ${handlerFunction || 'handleInput'} = () => {\n  requestIdleCallback(() => {\n    const filtered = items.filter(...).map(...);\n    setData(filtered);\n  });\n};`,
              description: 'Offload heavy computations to a Web Worker or yield with requestIdleCallback.'
            },
            handler: handlerName,
            handlerFunction,
            operation: 'computation'
          });
        }

        // Check for async/await handlers and promise chains
        const isPromiseChain = (searchScope.includes('.then(') || searchScope.includes('.catch(') || searchScope.includes('await ')) && isAsyncCall;
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
            whyExplanation: `Promise chaining in "${handlerName}" at line ${targetLine} triggers consecutive un-batched state changes, delaying the presentation of the next visual frame.`,
            codeContext: extractCodeContext(file.content, targetLine),
            fixCode: {
              before: `fetch(...).then(r => r.json()).then(data => setData(data));`,
              after: `fetch(...).then(r => r.json()).then(data => {\n  startTransition(() => setData(data));\n});`,
              description: 'Wrap state setters in startTransition inside promise resolutions.'
            },
            handler: handlerName,
            handlerFunction,
            operation: 'async'
          });
        }

        // Check for React State Updates causing Render loops
        const hasStateUpdate = /set[A-Z][a-zA-Z]*\(/.test(searchScope);
        if (hasStateUpdate && searchScope.includes('.map(')) {
          recommendations.push({
            type: 'code',
            file: file.filePath,
            line: targetLine,
            cwv: 'inp',
            severity: 'medium',
            message: `React state update triggering component render inside handler "${handlerName}".`,
            impact: 'Updating state values directly in event loops causes heavy subtree re-renders, stalling visual paint presentation.',
            suggestion: 'Use React.memo(), useTransition(), or dynamic virtualization to optimize re-render cycles.',
            whyExplanation: `Updating state inside "${handlerName}" at line ${targetLine} with full array mapping forces an entire subtree re-render. Without memoization or virtualization, this locks the main thread.`,
            codeContext: extractCodeContext(file.content, targetLine),
            fixCode: {
              before: `setItems(prev => prev.map(item => item.id === id ? updated : item));`,
              after: `startTransition(() => {\n  setItems(prev => prev.map(item => item.id === id ? updated : item));\n});`,
              description: 'Wrap the state update in startTransition or memoize item components with React.memo.'
            },
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
                whyExplanation: `Line ${lineNum} writes to DOM styles or classes, immediately followed by a layout metric read (line ${nextIdx + 1}). This invalidates layout geometry and forces synchronous reflow, delaying screen paint.`,
                codeContext: extractCodeContext(file.content, lineNum),
                fixCode: {
                  before: `element.style.width = '100px';\nconst h = element.offsetHeight; // Forced layout!`,
                  after: `// Read geometry first:\nconst h = element.offsetHeight;\n// Then schedule DOM writes on next frame:\nrequestAnimationFrame(() => {\n  element.style.width = '100px';\n});`,
                  description: 'Batch DOM reads before writes, or wrap DOM style changes in requestAnimationFrame().'
                },
                operation: 'reflow'
              });
              break;
            }
          }
        }
      }
    });

    // 3. React-Specific render loop issues (only for large page/list containers, never presentation cards or molecules)
    const isComponent = path.basename(file.filePath).match(/^[A-Z]/);
    const isCardOrMolecule = file.filePath.toLowerCase().includes('card') || file.filePath.toLowerCase().includes('molecule') || file.filePath.toLowerCase().includes('atom');
    if (isComponent && !isCardOrMolecule) {
      const hasLargeList = content.includes('.map(') && content.includes('return') && !content.includes('memo(');
      if (hasLargeList) {
        const mapIdx = content.indexOf('.map(');
        const { line: mapLine } = getLineAndColumn(content, mapIdx >= 0 ? mapIdx : 0);
        const lineNum = mapLine || 1;

        recommendations.push({
          type: 'code',
          file: file.filePath,
          line: lineNum,
          cwv: 'inp',
          severity: 'low',
          message: 'Large un-memoized list layout render.',
          impact: 'Rendering multiple elements dynamically without component memoization forces a complete subtree recalculation during interaction updates.',
          suggestion: 'Wrap the component in React.memo() or use useMemo() to memoize list item computations.',
          whyExplanation: `At line ${lineNum}, an un-memoized component maps over a collection. Every parent re-render or interaction forces all child elements to re-evaluate and re-render.`,
          codeContext: extractCodeContext(file.content, lineNum),
          fixCode: {
            before: `export const List = ({ items }) => (\n  <div>{items.map(item => <Item key={item.id} {...item} />)}</div>\n);`,
            after: `export const Item = React.memo(function Item({ ...props }) { ... });\n// Or memoize list calculation:\nconst listMarkup = useMemo(() => items.map(item => <Item key={item.id} {...item} />), [items]);`,
            description: 'Wrap list item components in React.memo or memoize collection mapping with useMemo.'
          },
          operation: 'react-memo'
        });
      }
    }
  }

  return recommendations;
}
