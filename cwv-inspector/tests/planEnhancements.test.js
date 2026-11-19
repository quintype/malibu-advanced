import assert from 'assert';
import { followFunctionCalls, getFullFunctionScope, extractFunctionCalls, findAllEventHandlers, detectLayoutThrashingInScope } from '../utils/astTraversal.js';
import { validateImageSizing, validateHandlerDeferral, generateVerificationGuidance } from '../utils/validationHelpers.js';
import { analyzeInp } from '../analyzers/inp.js';
import { analyzeCls } from '../analyzers/cls.js';
import { analyzeLcp } from '../analyzers/lcp.js';
import { parseReactCode } from '../scanners/parseReact.js';

console.log('🧪 Starting CWV Inspector Plans Enhancement Test Suite...\n');

let passCount = 0;
function logPass(title) {
  passCount++;
  console.log(`✓ Test ${passCount}: ${title} passed.`);
}

// ==========================================
// Phase 1: AST Traversal Utilities Tests
// ==========================================

// Test 1: followFunctionCalls traces chain with depth limit and cycle protection
{
  const fileFunctions = {
    handleClick: 10,
    calculateTotals: 25,
    expensiveTransform: 50
  };
  const fileCalls = {
    handleClick: ['calculateTotals'],
    calculateTotals: ['expensiveTransform'],
    expensiveTransform: ['handleClick'] // cycle!
  };

  const res = followFunctionCalls('handleClick', fileFunctions, fileCalls, 2);
  assert.deepStrictEqual(res.chain, ['handleClick', 'calculateTotals', 'expensiveTransform']);
  assert.strictEqual(res.external, false);
  assert.strictEqual(res.finalFunc, 'expensiveTransform');
  logPass('followFunctionCalls traces multi-level calls and terminates on cycles');
}

// Test 2: getFullFunctionScope extracts complete function body
{
  const content = `import React from 'react';\nfunction myHandler() {\n  const x = 1;\n  const y = 2;\n  return x + y;\n}\nexport default myHandler;`;
  const scopeRes = getFullFunctionScope('myHandler', content, { myHandler: 2 });
  assert.ok(scopeRes.scope.includes('return x + y'));
  assert.strictEqual(scopeRes.startLine, 2);
  logPass('getFullFunctionScope extracts full function body without arbitrary truncation');
}

// Test 3: extractFunctionCalls extracts invoked function names
{
  const code = `function submit() { validateInput(); const data = parseJson(); saveRecord(data); }`;
  const calls = extractFunctionCalls(code);
  assert.ok(calls.includes('validateInput'));
  assert.ok(calls.includes('parseJson'));
  assert.ok(calls.includes('saveRecord'));
  assert.ok(!calls.includes('function'));
  logPass('extractFunctionCalls extracts valid function identifiers while ignoring reserved keywords');
}

// Test 4: findAllEventHandlers discovers vanilla and jQuery event listeners
{
  const files = [
    {
      filePath: 'src/main.js',
      relativePath: 'src/main.js',
      ext: '.js',
      content: `document.getElementById('btn').addEventListener('click', () => { doWork(); });\n$('#nav').on('click', handleNav);`
    }
  ];
  const handlers = findAllEventHandlers(files);
  assert.strictEqual(handlers.length, 2);
  assert.strictEqual(handlers[0].event, 'click');
  assert.strictEqual(handlers[1].type, 'jquery-on');
  logPass('findAllEventHandlers detects vanilla addEventListener and jQuery .on listeners');
}

// Test 5: detectLayoutThrashingInScope flags DOM write followed by layout read
{
  const lines = [
    "element.style.width = '200px';",
    "const height = element.offsetHeight;",
    "console.log(height);"
  ];
  const thrash = detectLayoutThrashingInScope(lines, 0);
  assert.ok(thrash);
  assert.strictEqual(thrash.hasThrashing, true);
  assert.strictEqual(thrash.writeLine, 1);
  assert.strictEqual(thrash.readLine, 2);
  logPass('detectLayoutThrashingInScope catches write followed by offsetHeight read');
}

// ==========================================
// Phase 2: Validation Framework Tests
// ==========================================

// Test 6: validateImageSizing identifies missing and percentage dimensions
{
  const missingTag = { attributes: [{ name: 'src', value: 'hero.jpg' }] };
  const resMissing = validateImageSizing(missingTag, []);
  assert.strictEqual(resMissing.isValid, false);
  assert.strictEqual(resMissing.missingBoth, true);

  const percentTag = { attributes: [{ name: 'src', value: 'hero.jpg' }, { name: 'width', value: '100%' }] };
  const resPercent = validateImageSizing(percentTag, []);
  assert.strictEqual(resPercent.isRelativeWithoutRatio, true);

  const goodTag = { attributes: [{ name: 'src', value: 'hero.jpg' }, { name: 'width', value: '800' }, { name: 'height', value: '450' }] };
  const resGood = validateImageSizing(goodTag, []);
  assert.strictEqual(resGood.isValid, true);
  logPass('validateImageSizing accurately flags missing dimensions vs relative % without ratio');
}

// Test 7: validateHandlerDeferral identifies transition and idle scheduling
{
  assert.strictEqual(validateHandlerDeferral('startTransition(() => { setCount(1); });').usesTransition, true);
  assert.strictEqual(validateHandlerDeferral('requestIdleCallback(() => { log(); });').usesIdleCallback, true);
  assert.strictEqual(validateHandlerDeferral('setCount(c => c + 1);').isDeferred, false);
  logPass('validateHandlerDeferral distinguishes deferred scheduling patterns');
}

// Test 8: generateVerificationGuidance provides actionable test procedures
{
  const inpGuide = generateVerificationGuidance('inp');
  assert.ok(inpGuide.command.includes('npm run audit'));
  assert.ok(inpGuide.expectedChange.includes('200 ms'));

  const clsGuide = generateVerificationGuidance('cls');
  assert.ok(clsGuide.expectedChange.includes('0.10'));

  const lcpGuide = generateVerificationGuidance('lcp');
  assert.ok(lcpGuide.expectedChange.includes('2.5 s'));
  logPass('generateVerificationGuidance produces verification procedures for INP, CLS, and LCP');
}

// ==========================================
// Phase 3: Enhanced INP Detection Tests
// ==========================================

// Test 9: INP analyzer detects crypto operation and DOM query loops
{
  const content = `
    function handleClick() {
      const hash = sha256("input data");
      for (let i = 0; i < 10; i++) {
        document.getElementById('item-' + i);
      }
    }
    export function Button() {
      return <button onClick={handleClick}>Submit</button>;
    }
  `;
  const file = { filePath: 'src/Button.jsx', relativePath: 'src/Button.jsx', ext: '.jsx', content };
  const ast = parseReactCode(content, file.filePath);
  const issues = analyzeInp([file], [{ file, ast }]);

  const cryptoIssue = issues.find(i => i.message.includes('Cryptographic') || i.message.includes('blocks main thread'));
  const domIssue = issues.find(i => i.message.includes('DOM query'));

  assert.ok(cryptoIssue, 'Must flag crypto operation');
  assert.ok(domIssue, 'Must flag DOM query in loop');
  assert.ok(cryptoIssue.howToVerify, 'Must attach howToVerify');
  assert.ok(cryptoIssue.fixCode, 'Must include fixCode');
  logPass('INP analyzer catches crypto operations and DOM query loops with verification guidance');
}

// Test 10: INP analyzer respects React.memo and virtualization
{
  const memoizedContent = `
    const MemoItem = React.memo(({ item }) => <div>{item.title}</div>);
    function handleUpdate() {
      setList(items.map(item => item.id));
    }
    export function List() {
      return <button onClick={handleUpdate}>Update</button>;
    }
  `;
  const file = { filePath: 'src/MemoList.jsx', relativePath: 'src/MemoList.jsx', ext: '.jsx', content: memoizedContent };
  const ast = parseReactCode(memoizedContent, file.filePath);
  const issues = analyzeInp([file], [{ file, ast }]);

  const stateIssue = issues.find(i => i.message.includes('Un-optimized re-render of large list'));
  assert.strictEqual(stateIssue, undefined, 'Must not flag state update when components are memoized');
  logPass('INP analyzer skips un-optimized state update warnings when memoization is present');
}

// Test 11: INP analyzer detects render-blocking scripts in HTML head
{
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="/scripts/heavy-analytics.js"></script>
      </head>
      <body></body>
    </html>
  `;
  const file = { filePath: 'public/index.html', relativePath: 'public/index.html', ext: '.html', content: htmlContent };
  const issues = analyzeInp([file], []);
  const scriptIssue = issues.find(i => i.message.includes('Render-blocking script'));
  assert.ok(scriptIssue, 'Must flag render-blocking script in head');
  assert.strictEqual(scriptIssue.cwv, 'inp');
  assert.ok(scriptIssue.whyExplanation.includes('blocks HTML parsing'));
  logPass('INP analyzer identifies render-blocking scripts in HTML head');
}

// ==========================================
// Phase 4: Enhanced CLS Detection Tests
// ==========================================

// Test 12: CLS analyzer catches relative percentage width without height/ratio
{
  const jsxContent = `
    export function Banner() {
      return <img src="/banner.jpg" width="100%" alt="Banner" />;
    }
  `;
  const file = { filePath: 'src/Banner.jsx', relativePath: 'src/Banner.jsx', ext: '.jsx', content: jsxContent };
  const ast = parseReactCode(jsxContent, file.filePath);
  const issues = analyzeCls([file], [{ file, ast }]);

  const relativeIssue = issues.find(i => i.message.includes('relative (%)'));
  assert.ok(relativeIssue, 'Must flag percentage width without aspect ratio');
  assert.strictEqual(relativeIssue.severity, 'medium');
  assert.ok(relativeIssue.whyExplanation.includes('aspect-ratio'));
  assert.ok(relativeIssue.howToVerify);
  logPass('CLS analyzer flags relative percentage width lacking aspect-ratio');
}

// Test 13: CLS analyzer catches ternary and negated dynamic async state renders
{
  const asyncTernaryContent = `
    export function StoryFeed() {
      const [isLoading, setIsLoading] = useState(true);
      return (
        <div>
          {isLoading ? null : <StoryCard />}
        </div>
      );
    }
  `;
  const file = { filePath: 'src/Feed.jsx', relativePath: 'src/Feed.jsx', ext: '.jsx', content: asyncTernaryContent };
  const ast = parseReactCode(asyncTernaryContent, file.filePath);
  const issues = analyzeCls([file], [{ file, ast }]);

  const asyncIssue = issues.find(i => i.message.includes('Asynchronous state conditional render'));
  assert.ok(asyncIssue, 'Must flag ternary async render without placeholder');
  assert.ok(asyncIssue.howToVerify);
  logPass('CLS analyzer flags ternary dynamic async renders lacking placeholders');
}

// Test 14: CLS analyzer catches @font-face lacking font-display
{
  const cssContent = `
    @font-face {
      font-family: 'BrandFont';
      src: url('/fonts/brand.woff2') format('woff2');
    }
  `;
  const file = { filePath: 'styles/fonts.css', relativePath: 'styles/fonts.css', ext: '.css', content: cssContent };
  const issues = analyzeCls([file], []);

  const fontIssue = issues.find(i => i.message.includes('font-display'));
  assert.ok(fontIssue, 'Must flag @font-face without font-display');
  assert.strictEqual(fontIssue.cwv, 'cls');
  assert.ok(fontIssue.whyExplanation.includes('FOIT'));
  assert.ok(fontIssue.fixCode.after.includes('font-display: swap'));
  logPass('CLS analyzer flags @font-face declarations missing font-display strategy');
}

// Test 15: CLS analyzer catches IntersectionObserver content injection without reserved container
{
  const jsContent = `
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.innerHTML = '<img src="/lazy.jpg" />';
        }
      });
    });
  `;
  const file = { filePath: 'src/lazyLoader.js', relativePath: 'src/lazyLoader.js', ext: '.js', content: jsContent };
  const issues = analyzeCls([file], []);

  const ioIssue = issues.find(i => i.message.includes('Intersection Observer lazy-loads content'));
  assert.ok(ioIssue, 'Must flag IntersectionObserver content insertion without reserved container');
  assert.strictEqual(ioIssue.cwv, 'cls');
  assert.ok(ioIssue.whyExplanation.includes('container height'));
  logPass('CLS analyzer catches IntersectionObserver content injection lacking reserved space');
}

// ==========================================
// Phase 5: Enhanced LCP Detection Tests
// ==========================================

// Test 16: LCP analyzer catches legacy image formats on hero images and recommends WebP/AVIF
{
  const heroContent = `
    export function HeroBanner() {
      return <img id="hero-lead" src="/assets/hero-lead.jpg" width="1200" height="600" fetchpriority="high" />;
    }
  `;
  const file = { filePath: 'src/HeroBanner.jsx', relativePath: 'src/HeroBanner.jsx', ext: '.jsx', content: heroContent };
  const ast = parseReactCode(heroContent, file.filePath);
  const issues = analyzeLcp([file], [{ file, ast }]);

  const formatIssue = issues.find(i => i.message.includes('legacy format'));
  assert.ok(formatIssue, 'Must recommend WebP/AVIF format for legacy hero images');
  assert.strictEqual(formatIssue.cwv, 'lcp');
  assert.ok(formatIssue.fixCode.after.includes('<picture>'));
  assert.ok(formatIssue.fixCode.after.includes('image/avif'));
  assert.ok(formatIssue.fixCode.after.includes('image/webp'));
  assert.ok(formatIssue.howToVerify);
  logPass('LCP analyzer flags legacy JPG/PNG hero images and provides picture WebP/AVIF fix');
}

// Test 17: LCP analyzer catches hero images lacking responsive sizing
{
  const heroContent = `
    export function HeroBanner() {
      return <img id="hero-lead" src="/assets/hero-lead.webp" width="1200" height="600" fetchpriority="high" />;
    }
  `;
  const file = { filePath: 'src/HeroBanner.jsx', relativePath: 'src/HeroBanner.jsx', ext: '.jsx', content: heroContent };
  const ast = parseReactCode(heroContent, file.filePath);
  const issues = analyzeLcp([file], [{ file, ast }]);

  const responsiveIssue = issues.find(i => i.message.includes('responsive sizing attributes'));
  assert.ok(responsiveIssue, 'Must flag missing srcSet and sizes on hero image');
  assert.strictEqual(responsiveIssue.cwv, 'lcp');
  assert.ok(responsiveIssue.fixCode.after.includes('srcSet'));
  assert.ok(responsiveIssue.fixCode.after.includes('sizes'));
  logPass('LCP analyzer recommends srcSet and sizes on hero images for responsive delivery');
}

// Test 18: LCP analyzer catches LCP asset preceded by >2 render-blocking resources in head
{
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/styles/reset.css">
        <link rel="stylesheet" href="/styles/theme.css">
        <script src="/scripts/vendor.js"></script>
      </head>
      <body>
        <img src="/hero.jpg" alt="Hero">
      </body>
    </html>
  `;
  const file = { filePath: 'public/index.html', relativePath: 'public/index.html', ext: '.html', content: htmlContent };
  const issues = analyzeLcp([file], []);

  const blockingIssue = issues.find(i => i.message.includes('render-blocking resources in <head>'));
  assert.ok(blockingIssue, 'Must flag LCP preceded by >2 blocking resources');
  assert.strictEqual(blockingIssue.severity, 'high');
  assert.strictEqual(blockingIssue.cwv, 'lcp');
  assert.ok(blockingIssue.fixCode.after.includes('rel="preload" as="image"'));
  logPass('LCP analyzer detects LCP image delayed by multiple render-blocking head resources');
}

console.log(`\n🎉 All ${passCount} Plans Enhancement tests passed successfully!`);
