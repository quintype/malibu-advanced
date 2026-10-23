export const config = {
  // Directories to ignore during scanning
  excludeDirs: [
    'node_modules',
    'reports',
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
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.ejs', '.vue', '.php'],

  // Thresholds for warning levels
  thresholds: {
    lcp: 2500, // ms
    cls: 0.1,  // raw score
    inp: 200,  // ms
    tbt: 200,  // ms (lab responsiveness proxy)
    clsNeedsImprovement: 0.25,
    lcpNeedsImprovement: 4000,
    inpNeedsImprovement: 500,
    tbtNeedsImprovement: 600
  },
};
