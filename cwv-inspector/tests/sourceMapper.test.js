import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');

async function runTests() {
  console.log('Running Step 2 Source Mapper & Element Resolver Tests...\n');

  // Test 1: External .map resolution
  const externalBundlePath = path.join(demoAppDir, 'dist/bundle.external.js');
  const externalContent = fs.readFileSync(externalBundlePath, 'utf8');
  // In minified bundle, handleSlowButtonClick is at line 1, column 17 (1-based: 18)
  const slowCol = externalContent.indexOf('handleSlowButtonClick') + 1; // 1-based column

  const resExternal = await resolveSourceLocation({
    sourceURL: `file://${externalBundlePath}`,
    line: 1,
    column: slowCol,
    functionName: 'handleSlowButtonClick',
    scriptContent: externalContent,
    workspaceRoot
  });

  console.log('Test 1 (External Map):', resExternal);
  assert.strictEqual(resExternal.resolved, true, 'Must resolve with external map');
  assert.strictEqual(resExternal.confidence, 'high', 'Confidence must be high');
  assert.strictEqual(resExternal.line, 10, 'Must map to line 10 in original app.js');
  console.log('✓ Test 1: External .map resolution passed\n');

  // Test 2: Inline Base64 map resolution
  const inlineBundlePath = path.join(demoAppDir, 'dist/bundle.inline.js');
  const inlineContent = fs.readFileSync(inlineBundlePath, 'utf8');

  const resInline = await resolveSourceLocation({
    sourceURL: `file://${inlineBundlePath}`,
    line: 1,
    column: slowCol,
    functionName: 'handleSlowButtonClick',
    scriptContent: inlineContent,
    workspaceRoot
  });

  console.log('Test 2 (Inline Base64 Map):', resInline);
  assert.strictEqual(resInline.resolved, true, 'Must resolve with inline base64 map');
  assert.strictEqual(resInline.confidence, 'high', 'Confidence must be high');
  assert.strictEqual(resInline.line, 10, 'Must map to line 10 in original app.js');
  console.log('✓ Test 2: Inline Base64 map resolution passed\n');

  // Test 3: No map fallback to function-name matching (confidence "low")
  const nomapBundlePath = path.join(demoAppDir, 'dist/bundle.nomap.js');
  const nomapContent = fs.readFileSync(nomapBundlePath, 'utf8');

  const resNomap = await resolveSourceLocation({
    sourceURL: `file://${nomapBundlePath}`,
    line: 1,
    column: slowCol,
    functionName: 'handleSlowButtonClick',
    scriptContent: nomapContent,
    workspaceRoot: demoAppDir
  });

  console.log('Test 3 (No Map Fallback):', resNomap);
  assert.strictEqual(resNomap.resolved, true, 'Must resolve via function-name matching');
  assert.strictEqual(resNomap.confidence, 'low', 'Confidence must be low when falling back');
  assert.strictEqual(resNomap.method, 'function-name-matching');
  assert.strictEqual(resNomap.line, 10, 'Must locate line 10 of app.js');
  console.log('✓ Test 3: No map fallback passed\n');

  // Test 4: Element Resolver for #slow-click-btn (HTML ID)
  const elBtn = resolveElementSelector({
    selector: '#slow-click-btn',
    workspaceRoot: demoAppDir
  });
  console.log('Test 4 (Element #slow-click-btn):', elBtn);
  assert.strictEqual(elBtn.confidence, 'high');
  assert(elBtn.file.endsWith('.html'));
  assert(elBtn.element.includes('slow-click-btn'));
  console.log('✓ Test 4: Element #slow-click-btn resolved\n');

  // Test 5: Element Resolver for #hero-img (LCP target)
  const elHero = resolveElementSelector({
    selector: '#hero-img',
    workspaceRoot: demoAppDir
  });
  console.log('Test 5 (Element #hero-img):', elHero);
  assert.strictEqual(elHero.confidence, 'high');
  assert(elHero.file.endsWith('.html'));
  assert(elHero.element.includes('hero-img'));
  console.log('✓ Test 5: Element #hero-img resolved\n');

  // Test 6: Element Resolver for .injected-banner (CLS dynamic target)
  const elBanner = resolveElementSelector({
    selector: '.injected-banner',
    workspaceRoot: demoAppDir
  });
  console.log('Test 6 (Element .injected-banner):', elBanner);
  assert(elBanner.confidence === 'high' || elBanner.confidence === 'medium');
  assert(elBanner.file.endsWith('app.js'));
  assert(elBanner.element.includes('injected-banner'));
  console.log('✓ Test 6: Element .injected-banner resolved\n');

  console.log('All Step 2 Source Mapper & Element Resolver Tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
