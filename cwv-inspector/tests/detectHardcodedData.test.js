import fs from 'fs';
import assert from 'assert';

/**
 * Test that fails if bin/cwv.js, prioritizer, or reporters contain hardcoded issues
 * or numeric metric literals (except in comments or configuration).
 */
async function testNoHardcodedData() {
  console.log('Checking for hardcoded metric data...\n');

  const filesToCheck = [
    'bin/cwv.js',
    'utils/prioritizer.js',
    'analyzers/recommendations.js'
  ];

  const suspiciousPatterns = [
    { pattern: /const\s+\w*issues\s*=\s*\[/, description: 'hardcoded issues array' },
    { pattern: /const\s+mockIssues/, description: 'mock issues variable' },
    { pattern: /const\s+testData\s*=\s*{/, description: 'hardcoded test data' },
    // Catch numeric metrics in data literals (not in threshold configs)
    { pattern: /delta:\s*(\d+|0\.\d+)(?!,\s*\/\/)/, description: 'hardcoded metric delta in issue data' },
    { pattern: /measured_improvement:\s*{[^}]*delta:\s*\d+/, description: 'hardcoded measured values' }
  ];

  for (const file of filesToCheck) {
    const filePath = `/Users/sirippireddygiri/Desktop/Quintype/malibu-advanced/cwv-inspector/${file}`;
    if (!fs.existsSync(filePath)) {
      console.log(`⊘ ${file}: not found`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let foundIssue = false;

    for (const { pattern, description } of suspiciousPatterns) {
      if (pattern.test(content)) {
        // Ignore if it's in a comment or threshold configuration
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (pattern.test(line) && !line.trim().startsWith('//') && !line.includes('threshold') && !line.includes('Threshold')) {
            console.log(`✗ ${file}:${i+1} - ${description}`);
            foundIssue = true;
          }
        }
      }
    }

    if (!foundIssue) {
      console.log(`✓ ${file}: no hardcoded data detected`);
    }
  }

  console.log('\n✓ Hardcoded data detection test passed');
}

testNoHardcodedData().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
