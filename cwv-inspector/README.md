# CWV Inspector

A command-line tool designed to inspect React, Next.js, Vite, and other web projects to automatically detect Core Web Vitals (CWV) optimization opportunities, highlight potential performance issues in specific files, and output a premium PDF & HTML report.

## Features

- **Static Code Scan**: Crawls and parses code files (`.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`) looking for patterns causing **LCP**, **CLS**, and **INP** bottlenecks.
- **Dependency Audit**: Inspects `package.json` to identify heavy npm libraries (like lodash, moment) and recommends modern alternatives.
- **AST Parsing**: Inspects React components using Babel parser to find nested contexts, un-optimized images, missing lazy imports, and inline handler allocation loops.
- **Optional Lighthouse Audit**: Performs a headless Chrome performance scan when provided a URL.
- **Premium Reports**: Generates highly styled, responsive HTML and print-ready PDF reports.

## Structure

```
cwv-inspector/
├── package.json         # Dependency configuration
├── audit.js             # Entrypoint CLI
├── config.js            # General settings and rule weights
├── analyzers/           # CWV performance rules & lighthouse audits
└── scanners/            # Filesystem crawling & React AST parsing
```

## Setup

1. Make sure you have Node.js installed.
2. In the `cwv-inspector/` directory, install dependencies:
   ```bash
   npm install
   ```

## Usage

Run a static code scan of any project directory:
```bash
node audit.js /path/to/your/project
```

Run a static code scan **plus** a live Lighthouse runtime audit:
```bash
node audit.js /path/to/your/project --url https://your-site-url.com
```

The tool will generate a dashboard report in the targeted project directory under the `reports/` folder.
