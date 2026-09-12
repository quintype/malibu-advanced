export const config = {
  // Directories to ignore during scanning
  excludeDirs: [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'out',
    'coverage',
    'public',
    '.cache'
  ],

  // File extensions to inspect
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.html'],

  // Thresholds for warning levels
  thresholds: {
    lcp: 2500, // ms
    cls: 0.1,  // raw score
    inp: 200,  // ms
  },

  // Scoring/weight rules for reports
  rules: {
    imagesMissingAlt: { severity: 'low', cwv: 'accessibility' },
    imagesMissingDimensions: { severity: 'high', cwv: 'cls' },
    imagesNotLazy: { severity: 'medium', cwv: 'lcp' },
    fontsNoDisplaySwap: { severity: 'medium', cwv: 'lcp' },
    cssRenderBlocking: { severity: 'high', cwv: 'lcp' },
    jsSyncScript: { severity: 'high', cwv: 'inp' },
    reactLargeContext: { severity: 'medium', cwv: 'inp' },
    reactMissingMemo: { severity: 'low', cwv: 'inp' },
    bundleNoCodeSplitting: { severity: 'high', cwv: 'lcp' }
  }
};
