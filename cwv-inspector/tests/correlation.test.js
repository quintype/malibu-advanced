import { correlateCls } from '../analyzers/correlation.js';
import { compileRecommendations } from '../analyzers/recommendations.js';
import assert from 'assert';

console.log('🧪 Starting Core Web Vitals Correlation Engine Unit Tests...\n');

// Mock AST Elements
const mockAstElements = [
  {
    tagName: 'img',
    id: 'header-logo',
    className: 'logo main-logo',
    src: '/images/logo.png',
    filePath: 'src/components/Header.jsx',
    line: 12,
    column: 4,
    attributes: [
      { name: 'src', value: '/images/logo.png' },
      { name: 'id', value: 'header-logo' },
      { name: 'className', value: 'logo main-logo' }
    ]
  },
  {
    tagName: 'img',
    id: null,
    className: 'hero-image',
    src: '/images/banner.jpg',
    filePath: 'src/components/Hero.jsx',
    line: 25,
    column: 6,
    attributes: [
      { name: 'src', value: '/images/banner.jpg' },
      { name: 'className', value: 'hero-image' }
    ]
  },
  {
    tagName: 'div',
    id: 'ad-slot-1',
    className: 'ad-banner',
    src: null,
    filePath: 'src/components/Sidebar.jsx',
    line: 45,
    column: 2,
    attributes: [
      { name: 'id', value: 'ad-slot-1' },
      { name: 'className', value: 'ad-banner' }
    ]
  },
  // Ambiguous elements (same tag & class)
  {
    tagName: 'img',
    id: null,
    className: 'thumbnail',
    src: '/images/thumb1.png',
    filePath: 'src/components/List.jsx',
    line: 15,
    column: 8,
    attributes: [{ name: 'className', value: 'thumbnail' }]
  },
  {
    tagName: 'img',
    id: null,
    className: 'thumbnail',
    src: '/images/thumb2.png',
    filePath: 'src/components/List.jsx',
    line: 22,
    column: 8,
    attributes: [{ name: 'className', value: 'thumbnail' }]
  }
];

// Mock Static Issues
const mockStaticIssues = [
  {
    type: 'code',
    cwv: 'cls',
    severity: 'medium',
    file: 'src/components/Hero.jsx',
    line: 25,
    message: 'Image tag is missing explicit width or height attributes.',
    impact: 'Causes content layout shifts.',
    suggestion: 'Provide width and height attributes.'
  },
  {
    type: 'code',
    cwv: 'lcp',
    severity: 'low',
    file: 'src/components/Header.jsx',
    line: 12,
    message: 'Image missing alt tag.',
    impact: 'Fails accessibility checks.',
    suggestion: 'Add an alt attribute.'
  }
];

// Test Cases
try {
  // Test 1: Exact tag + class match (High Confidence)
  const run1 = correlateCls(
    [{ selector: 'img.hero-image', score: 0.12, device: 'Mobile', snippet: '<img class="hero-image" src="/images/banner.jpg" />' }],
    mockAstElements
  );
  assert.strictEqual(run1[0].confidence, 'HIGH');
  assert.strictEqual(run1[0].source.filePath, 'src/components/Hero.jsx');
  assert.strictEqual(run1[0].source.line, 25);
  console.log('✓ Test 1: Exact tag + class match passed.');

  // Test 2: Tag + ID match (High Confidence)
  const run2 = correlateCls(
    [{ selector: 'img#header-logo', score: 0.05, device: 'Desktop', snippet: '<img id="header-logo" />' }],
    mockAstElements
  );
  assert.strictEqual(run2[0].confidence, 'HIGH');
  assert.strictEqual(run2[0].source.filePath, 'src/components/Header.jsx');
  console.log('✓ Test 2: Tag + ID match passed.');

  // Test 3: Tag + src match disambiguation (High Confidence)
  const run3 = correlateCls(
    [{ selector: 'img.thumbnail', score: 0.08, device: 'Mobile', snippet: '<img class="thumbnail" src="/images/thumb2.png" />' }],
    mockAstElements
  );
  assert.strictEqual(run3[0].confidence, 'HIGH');
  assert.strictEqual(run3[0].source.line, 22); // uniquely matched thumb2.png src
  console.log('✓ Test 3: Tag + src disambiguation match passed.');

  // Test 4: Multiple ambiguous matches (Unresolved)
  const run4 = correlateCls(
    [{ selector: 'img.thumbnail', score: 0.04, device: 'Mobile', snippet: '<img class="thumbnail" />' }],
    mockAstElements
  );
  assert.strictEqual(run4[0].confidence, 'UNRESOLVED');
  assert.strictEqual(run4[0].source, null);
  console.log('✓ Test 4: Multiple ambiguous matches unresolved passed.');

  // Test 5: No match (Unresolved)
  const run5 = correlateCls(
    [{ selector: 'span.missing-selector', score: 0.01, device: 'Mobile' }],
    mockAstElements
  );
  assert.strictEqual(run5[0].confidence, 'UNRESOLVED');
  assert.strictEqual(run5[0].source, null);
  console.log('✓ Test 5: No match passed.');

  // Test 6: compileRecommendations integration & deduplication
  const mockLhData = {
    mobile: {
      opportunities: [],
      clsElements: [
        { selector: 'img.hero-image', score: 0.15, snippet: '<img class="hero-image" />' }
      ]
    }
  };
  const result = compileRecommendations(mockStaticIssues, mockLhData, mockAstElements);
  
  // Verify deduplication: mockStaticIssues[0] (Hero.jsx:25 missing dimensions) should be merged
  // into the correlated issue, meaning total issues count is 2 (the correlated one + the header alt tag lcp one)
  assert.strictEqual(result.summary.total, 2);
  const correlated = result.issues.find(i => i.type === 'correlated');
  assert.ok(correlated);
  assert.strictEqual(correlated.file, 'src/components/Hero.jsx');
  assert.strictEqual(correlated.line, 25);
  assert.strictEqual(correlated.staticRule, 'Image tag is missing explicit width or height attributes.');
  console.log('✓ Test 6: Deduplication and compiler grouping passed.');

  // Test 7: Score deduction evaluation
  // Deductions: 1 High severity correlated issue (5 pt) + 1 Low severity static issue (0.5 pt) = 5.5 pt.
  // Rounded score: 100 - 5.5 = 94.5 rounded to 94.
  assert.strictEqual(result.healthScore, 95);
  console.log('✓ Test 7: Mathematical Score deductions passed.');

  console.log('\n🎉 All 7 Core Web Vitals Correlation Engine tests passed successfully!');
} catch (err) {
  console.error('\n❌ Test execution failed:');
  console.error(err);
  process.exit(1);
}
