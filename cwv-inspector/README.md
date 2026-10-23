# Core Web Vitals Diagnostic Lab: Engineering Documentation

This repository contains the **Core Web Vitals Diagnostic Lab** (also referred to as `cwv-inspector`), an automated web performance analysis tool. It bridges the gap between **runtime diagnostics** and **local source code configuration**.

Standard Lighthouse reports indicate that a page is slow (e.g. flagging layout shifts on a selector like `div.header > img.logo`), but they cannot tell the developer *where* in their project source files that element is declared.

This tool solves that problem by running a dual-mode scan:
1.  **Synthetic Runtime Scan**: Evaluates page load behavior, metrics, and DOM shifting elements of a live/local URL.
2.  **Static Source Scan**: Recursively processes the project directory, parsing files into Abstract Syntax Trees (ASTs) to locate layout triggers.

By feeding both pipelines into a **Correlation Engine**, the tool maps performance bottlenecks directly to the physical source code files (components, styles) and line numbers.

---

## 1. Overview

This tool combines Lighthouse results from the target URL with a static analysis of the local source-code directory to identify the likely source of performance problems. It helps developers move from *"this page has a poor Core Web Vital"* to *"this specific source file/component is likely contributing to the problem, and here is what can be improved."*

---

## 2. Objective

The primary objectives of the engineering implementation are:
*   To evaluate live URL performance metrics for Core Web Vitals (LCP, CLS, TBT, INP) across Mobile and Desktop viewport contexts.
*   To scan the target project directory to build a code index of layout components, images, CSS font definitions, and dependency structures.
*   To programmatically correlate runtime-shifted selectors with static AST coordinates.
*   To generate structured, grouped recommendations that point to specific lines of code.
*   To compute a unified Health Score and render interactive HTML/PDF diagnostic reports.
*   To visualize real-world Chrome UX Report (CrUX) field data via histograms.

---

## 3. Inputs

The tool requires two primary parameters to initiate a performance run:

### A. Project Directory Path
*   **Purpose**: Points the static file scanner to the local codebase.
*   **What is read**: Reads files matching the configured extensions in `config.js` (`.js`, `.jsx`, `.ts`, `.tsx`, `.css`, `.html`, `.ejs`, `.vue`, and `.php`). It skips configured dependency, generated, and public asset directories.
*   **Format**: Absolute local path (e.g., `/Users/sirippireddygiri/Desktop/Quintype/malibu-advanced`).

### B. Target URL
*   **Purpose**: Provides the endpoint that headless Chrome will navigate to during tests.
*   **How it is used**: Passed directly to Puppeteer and Lighthouse to retrieve performance metrics, opportunities, and shift selectors.
*   **Format**: Public or local address (e.g., `http://localhost:3000` or `https://www.google.com`).

---

## 4. High-Level Architecture

The components interact according to the following architecture pipeline:

```mermaid
graph TD
    A[User Config: URL & Project Path] --> B[Server Orchestrator server.js]
    B -->|spawn| C[CLI Coordinator audit.js]
    
    subgraph Runtime Pipeline
        C --> D[Headless Chrome Launcher]
        D --> E[Puppeteer Bot Scroll Page]
        E --> F[Lighthouse Mobile / Desktop audits]
        F --> G[Extract Metrics & Shift Elements]
    end
    
    subgraph Static Pipeline
        C --> H[File Scanner scanFiles.js]
        H --> I[Babel AST Parser parseReact.js]
        I --> J[Static Rule Analyzers images/fonts/css]
    end
    
    G --> K[Correlation Engine correlation.js]
    J --> K
    K --> L[Recommendations Compiler recommendations.js]
    L --> M[Report Builder generatePdf.js]
    M --> N[HTML, PDF & JSON Reports]
```

---

## 5. Complete Execution Flow

When a performance audit is triggered from the Dashboard or CLI:

1.  **Input Verification**: The coordinator resolves and verifies the project path and checks if the URL format is valid.
2.  **File Scan**: `scanFiles.js` gathers workspace files matching extensions and reads their content.
3.  **AST Generation**: `parseReactCode()` in `parseReact.js` parses JS/TS files into AST structures using `@babel/parser`, indexing all JSX elements (`<img>`, `<a>`, `<link>`) with line numbers and file names.
4.  **Static Auditing**: Static analyzers (CSS, fonts, JS, images, dependencies) run against the files/ASTs to produce a list of static code issues.
5.  **Browser Boot**: Headless Chrome is launched via `chrome-launcher` on a debugging port.
6.  **Bot Scroll Execution**: Puppeteer connects to the debug port, opens the original URL, and scrolls to trigger lazy-loaded assets and capture shift attribution. The diagnostic page disables its browser cache; this does not purge CDN or origin caches.
7.  **Lighthouse Run**: Lighthouse runs on the port for both Mobile and Desktop profiles, extracting lab metrics and `layout-shift-elements`. A separate observer captures shift participants during scroll for attribution fallback; its shifts do not replace Lighthouse's CLS metric.
8.  **Correlation Engine Run**: `correlateCls()` in `correlation.js` matches layout-shifting selectors to static AST element definitions.
9.  **Consolidation**: `compileRecommendations()` deduplicates static issues, merging static image properties (e.g. missing size dimensions) with the matched Lighthouse shift element.
10. **Report Builder**: `generateReport()` replaces placeholders in `template.html` with final scores, metrics, and correlation data, and prints the layout to PDF using Puppeteer.

---

## 6. Lighthouse Integration

### Library & Configurations
*   **Version**: `lighthouse` version `^11.3.0` in `package.json`; the lockfile currently resolves `11.7.1`.
*   **Invocation**: Evaluated programmatically inside `analyzers/lighthouse.js`.
*   **Categories**: Limits execution strictly to the `performance` category:
    ```javascript
    onlyCategories: ['performance']
    ```
*   **Storage Flag**: Sets `disableStorageReset: false` to allow consistent clean audits.
*   **Device Emulation & Throttling Specifications**:
    *   **Mobile Audit**:
        *   **Device**: Moto G Power (2022) / `MOTOGPOWER_EMULATION_METRICS`
        *   **Viewport**: `412 × 823` px
        *   **Device Scale Factor (DPR)**: `1.75`
        *   **Mobile Emulation**: `true` (`hasTouch: true`)
        *   **Network Throttling**: Simulated Slow 4G (`150ms` RTT, `1.6 Mbps` throughput)
        *   **CPU Slowdown**: `4x`
    *   **Desktop Audit**:
        *   **Device**: MacOS Desktop / `DESKTOP_EMULATION_METRICS`
        *   **Viewport**: `1350 × 940` px
        *   **Device Scale Factor (DPR)**: `1.0`
        *   **Mobile Emulation**: `false` (`hasTouch: false`)
        *   **Network Throttling**: Simulated Dense 4G (`40ms` RTT, `10 Mbps` throughput)
        *   **CPU Slowdown**: `1x`
*   **Test Configuration Reporting**: Both HTML and PDF reports display a Test Configuration banner in the Executive Summary for Mobile and Desktop audits, detailing the effective viewport, DPR, network throttling, CPU slowdown multiplier, and Lighthouse version.

---

## 7. Puppeteer Integration

Puppeteer (`^22.0.0`) is used for two specific runtime tasks in this project:

### A. Bot Scroll Preloading and Shift Attribution
Puppeteer connects to the Chrome debugging port before each Lighthouse run and scrolls down the page in increments, prompting lazy assets to load. The observer records unexpected layout-shift entries and candidate DOM sources for correlation. Lighthouse remains authoritative for the reported CLS metric because the observer's full-page event list is not itself the CLS session-window calculation.

### B. PDF Rendering
After compile recommendations are saved as HTML, Puppeteer launches a separate headless session, loads the HTML string, and generates a print-ready PDF using `page.pdf()`.

---

## 8. Babel & Source Code Parsing

We use `@babel/parser` and `@babel/traverse` inside `scanners/parseReact.js` to inspect JavaScript and TypeScript files statically.

### AST Traversals
*   **`JSXOpeningElement`**: Gathers all tag details. We extract the `tagName`, `id`, `className`, `src`, `href`, and structural line/column locations.
*   **`ImportDeclaration`**: Traces import bindings to check for un-memoized structures or sync script declarations.
*   **`CallExpression`**: Detects `memo` / `useMemo` usage for the current React heuristics. It does not inspect hook dependencies or prove that a component is correctly memoized.

This provides a code index that the Correlation Engine queries to map DOM selectors to the correct file path and line number.

---

## 9. Core Web Vitals Metrics

| Metric | What it Measures | Source in Code | Good Threshold |
| :--- | :--- | :--- | :--- |
| **LCP** | Largest Contentful Paint (Load speed) | Lighthouse lab audit; CrUX / optional PSI field data | `config.thresholds.lcp` (2500 ms) |
| **CLS** | Cumulative Layout Shift (Visual stability) | Lighthouse lab audit; CrUX / optional PSI field data | `config.thresholds.cls` (0.1) |
| **TBT** | Total Blocking Time (Input delay proxy) | Lighthouse lab audit | `config.thresholds.tbt` (200 ms) |
| **INP** | Interaction to Next Paint (field responsiveness) | CrUX / optional PSI field data; Lighthouse lab runs do not measure true INP | `config.thresholds.inp` (200 ms) |

### Interpreting lab and field results

Lighthouse lab results are available immediately and are useful for controlled before/after comparisons. CrUX and PSI field data represent a rolling 28-day sample of real Chrome users and update gradually after a deployment; browser cache clearing cannot reset that history. Low-traffic UAT sites may not have enough CrUX samples, so use repeatable Lighthouse runs on UAT for release checks and add your own RUM collection if you need real-user feedback before production CrUX stabilizes. TBT is a lab diagnostic for main-thread blocking, not a substitute measurement for INP; INP requires real interactions.

The audit uses the URL exactly as provided for Lighthouse and PSI. It does not append a random query parameter to attempt to bypass caching, because that can change the tested route or its cache key without purging an edge cache. The custom Puppeteer diagnostic page disables browser caching; this does not change field-data history or CDN behavior.

---

## 10. Issue Detection

The tool flags performance issues using deterministic rules:
*   **Images**: Legacy image formats (.jpg, .png), missing dimensions (`width`/`height`), or missing lazy-loading below-the-fold.
*   **Fonts**: CSS `@font-face` rules missing `font-display: swap`, or referencing `.woff2` files without preloads.
*   **CSS/JS**: Render-blocking stylesheets or synchronous script tags.
*   **Dependencies**: Bloated npm dependencies (e.g. `lodash` or `moment`) parsed from `package.json`.
*   **React AST**: Missing `React.memo` wrappers or unstable contexts.

---

## 11. Source Code Correlation Engine (V5)

The engine in `analyzers/correlation.js` and `analyzers/recommendations.js` matches runtime layout shifts (CLS) and interaction latencies (INP) to source code:

1.  **Extraction**: Gathers shift selectors and interaction timings (input delay, processing duration, presentation delay) from mobile and desktop Lighthouse profiles.
2.  **Selector Parsing**: Parses the target CSS selector into tag names and classes.
3.  **AST Code Mappings**: Filters the static codebase JSX components matching the tags/classes.
4.  **Event Handler Tracing**: Inspects Babel AST nodes to map handlers (e.g. `onClick={handleSave}`) to functions (arrow functions, variable declarators, method declarations) and trace nested calls up to 2 frames deep. Prevents recursive cycle loops.
5.  **Phase Validation & Negative Correlation**:
    *   **Input Delay dominant**: Aligns with third-party or blocking initialization script operations.
    *   **Processing Duration dominant**: Aligns with fetch, computation, or async task operations.
    *   **Presentation Delay dominant**: Aligns with reflow, rendering, or memo list updates.
    *   *Mismatched operations trigger a negative correlation penalty, reducing the match score.*

---

## 12. Recommendations Engine & Quality States (V5)

The consolidator in `analyzers/recommendations.js` aggregates findings and determines the alignment quality:

*   **Five Correlation States**:
    *   `EXACT`: Exact selector and event matches with successfully resolved local function definitions matching the dominant latency phase.
    *   `STRONG`: High confidence signal alignment but missing one minor trace (e.g., phase alignment mismatch or unresolved inner calls).
    *   `PARTIAL`: Weak selector match or local interaction triggering third-party script loops.
    *   `UNRESOLVED`: Lighthouse interaction occurred, but no source components match.
    *   `STATIC_ONLY`: Static rules triggered, but page runtime was within Good limits (&le; 200ms).
*   **Worst-Interaction Outlier Aggregation**: Deduplicates multiple sample events on the same selector, retaining only the worst (highest latency) observation.
*   **Ranking & Score Deductions**: Grouped recommendations are sorted by metrics latency score first, correlation state weight second, and severity third. Deductions are calculated as: High = **5 points**, Medium = **2 points**, Low = **0.5 points**.
*   **Deduction Formula**:
    $$\text{Health Score} = \max\left(0, \, 100 - (5 \times \text{high} + 2 \times \text{medium} + 0.5 \times \text{low})\right)$$

---

## 13. Report Generation

*   **Format**: Standalone HTML report (`report-<timestamp>.html`), printed PDF (`report-<timestamp>.pdf`), and companion JSON (`report-<timestamp>.json`).
*   **Location**: Written to the audited project's `reports/` folder.
*   **Contents**: Performance assessment summary banner, Device tabs (Mobile/Desktop view toggle), Metrics Detail table (including CrUX field data and Lighthouse lab data), and categorized expandable recommendation cards.

---

## 14. Important Files Reference

| File | Responsibility | Key Functions / Exports |
|------|----------------|-------------------------|
| `server.js` | Native HTTP routes, Server-Sent Events (SSE) streaming, report access, and folder dialogs. | `select-folder`, `run-audit` |
| `audit.js` | CLI entry point. Orchestrates the file scan, AST parser, static rules, and report generators. | `main` |
| `analyzers/lighthouse.js` | Launches Chrome, runs the Puppeteer bot scroll, and executes programmatic Lighthouse runs. | `runLighthouseAudit`, `extractScores`, `preScrollPage` |
| `analyzers/correlation.js` | Correlates layout shift selectors with static JSX elements. | `correlateCls`, `parseSelectorComponent` |
| `analyzers/recommendations.js` | Groups findings, deduplicates static/runtime issues, and calculates the health score. | `compileRecommendations` |
| `analyzers/aiAdvisor.js` | Automatically enriches prioritized findings with GitHub Copilot AI recommendations. | `enrichAuditWithCopilot` |
| `report/generatePdf.js` | Populates HTML template tags, formats scores, and orchestrates PDF generation. | `generateReport`, `computeMetricDetails` |
| `report/redesignedPdfTemplate.js` | Builds the redesigned 3-page executive PDF report (hero executive summary, CrUX field trends, and metrics detail with findings). | `buildRedesignedPdfHtml`, `extractCruxHistoryPoints` |

---

## 15. How to Run Locally

### Prerequisites
*   Node.js v18 or newer
*   Google Chrome browser installed

### Installation
Clone the codebase, navigate to `cwv-inspector/`, and install dependencies:
```bash
npm install
```

### Environment Variables (.env)
Place a `.env` file in `cwv-inspector/` or export environment variables before starting the audit. Google API keys are not bundled; each data source is skipped when its key is unset.
```env
# Optional: enables CrUX field data and historical trends
CRUX_API_KEY=your_chrome_ux_report_api_key

# Optional: enables PageSpeed Insights lab and field data
PSI_API_KEY=your_pagespeed_insights_api_key

# Optional: limits automatic Copilot advice (default: 5 findings)
COPILOT_MAX_ISSUES=5

# Optional: explicit GitHub token instead of the Copilot CLI's signed-in user
COPILOT_GITHUB_TOKEN=your_github_token
```

Copilot authentication defaults to the user signed in to the Copilot CLI. Do not commit `.env` or put tokens in source control. The previous code contained Google API key literals; if those keys were active, rotate them in Google Cloud and configure replacements only through the environment.

### Starting the Server & Web Dashboard
Start the native HTTP dashboard server:
```bash
node server.js
```
Open `http://localhost:3000` in your web browser.

**Running an Audit from the Dashboard**:
1.  Click **Select Project Folder** and choose the directory you want to scan.
2.  Enter the URL you want to audit (e.g. `http://localhost:3000`).
3.  Click **Run Audit**. Once complete, the browser will open the generated HTML report.

### Running Audits via CLI
Run the command-line audit directly:
```bash
node audit.js <project-path> [options]
```

**CLI Options**:
*   `--url <url>`: Target live/local URL for Lighthouse performance and Core Web Vitals audit.
*   `--branch <branch>`: Override or specify Git branch name (default: auto-detected).
*   `--engineer <name>`: Set author/engineer name for reports (default: `Not specified`).
*   `--all-ai`: Opt in to Copilot advice for up to 999 eligible findings; this can make many model calls.
*   `--max-ai <count>`: Set maximum number of issues to enrich with Copilot (default: `5`).
*   `--no-ai`: Disable Copilot AI enrichment entirely.
*   `--help, -h`: Show usage guide.

Copilot enrichment sends one concise prompt per selected finding and defaults to high and medium severity issues. When a verified file and line are available, the prompt includes at most 17 nearby source lines (capped at 2,400 characters), plus the runtime evidence already attached to the finding. It does not send the whole repository. The companion JSON report records observed input/output token totals and request multipliers; these are usage metrics, not a currency estimate. Transient retries are disabled by default because a timed-out request may already have been processed. The advice cache is in-memory and does not carry across separate dashboard audit processes.

---

## 16. Execution Example

*   **Target Project Directory**: `/Users/sirippireddygiri/Desktop/Quintype/malibu-advanced`
*   **Target URL**: `https://www.google.com`

### Audit Progress:
1.  Lighthouse runs on the URL and flags a layout shift on the selector: `div.hero > img.banner-img` (CLS shift score: 0.18).
2.  The static scanner traverses the target directory, parses components into AST, and finds a matching JSX node:
    `<img className="banner-img" src="/images/hero-banner.webp" />` inside `src/components/Hero.jsx` on line 14.
3.  Static rule analyzer (`images.js`) flags that `Hero.jsx:14` is missing explicit `width` and `height` attributes.
4.  The Correlation Engine matches the selector to `Hero.jsx:14` with **High Confidence** (evidence: tag matched, classes matched, unique candidate).
5.  `recommendations.js` combines the issues: instead of showing two separate cards, it renders one card under the CLS filter:
    *   **Finding**: *Layout Shift matched to source: <img> in Hero.jsx*
    *   **Confidence**: *High*
    *   **Lighthouse Selector**: *div.hero > img.banner-img*
    *   **Recommendation**: *Image tag at Hero.jsx:14 is missing explicit width or height attributes. Reserve layout space by providing dimensions.*

---

## 17. Limitations

*   **Authentication & Paywalls**: Headless Chrome starts with a clean profile, so it cannot audit pages behind login walls or paywalls unless session cookies are pre-injected.
*   **Heuristic Source Analysis**: Most static rules use AST indexing plus simple text/regex heuristics. A finding is a lead to inspect, not proof of a measured cause. Dynamic values, generated classes, build output, source maps, and runtime-only markup can prevent an exact source match.
*   **Dynamically Injected Sizing**: Static AST analysis cannot evaluate layout dimensions configured at runtime via Javascript calculations or dynamic style bindings.
*   **Lab vs Field Variance**: Synthetic lab tests (Lighthouse) simulate network conditions and do not capture real-user variations like older hardware or network drops.

---

## 18. Troubleshooting Common Failures

*   **Lighthouse execution failed: Chrome not found**: Ensure Google Chrome is installed on the testing machine and available in the default system application path.
*   **Invalid project directory**: Verify the path is correct and has read permissions.
*   **Connection timeout / Unreachable URL**: Verify the site is up and reachable by visiting it in your standard browser.
*   **AST parser errors**: Occur on files with invalid JS/TS syntax. The parser logs these to the console and falls back gracefully to regex scans.

---

## 19. Future Improvements

*   **LCP Correlation**: Apply selector mapping to LCP element diagnostics.
*   **Incremental Scanning**: Cache component AST files and only re-scan files that have changed.
*   **CI/CD Blockers**: Integrate `audit.js` into pre-commit workflows or deploy pipelines to block builds if the Health Score drops below a defined threshold.
*   **Session Importing**: Add cookie import fields to the dashboard configuration panel to audit authenticated routes.

---

## 20. Summary

This Core Web Vitals Diagnostic tool goes beyond standard Lighthouse metrics. By combining **synthetic runtime browser audits** with **static code AST scans**, it maps performance issues directly to the local source files and component lines causing them. This allows developers to quickly locate and fix bottlenecks, keeping performance optimizations aligned with standard development workflows.
