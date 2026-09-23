import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * Computes metric rendering properties.
 */
function computeMetricDetails(data, type) {
  let statusClass = 'warning', statusLabel = 'Static Only', valueDisplay = 'N/A', textClass = 'warning-text', subdesc = 'No runtime measured.', percent = 0;

  if (data) {
    if (type === 'lcp') {
      const lcpSec = data.lcp.value / 1000;
      valueDisplay = `${lcpSec.toFixed(2)}s`;
      if (lcpSec <= 2.5) {
        statusClass = 'good'; statusLabel = 'Good'; textClass = 'good-text'; subdesc = 'Excellent rendering speed.';
        percent = (lcpSec / 2.5) * 33;
      } else if (lcpSec <= 4.0) {
        statusClass = 'warning'; statusLabel = 'Needs Work'; textClass = 'warning-text'; subdesc = 'Needs work (over 2.5s).';
        percent = 33 + ((lcpSec - 2.5) / 1.5) * 33;
      } else {
        statusClass = 'poor'; statusLabel = 'Poor'; textClass = 'danger-text'; subdesc = `${(lcpSec - 2.5).toFixed(1)}s over the 2.5s limit.`;
        percent = Math.min(100, 66 + ((lcpSec - 4.0) / 4.0) * 34);
      }
    } else if (type === 'cls') {
      const clsVal = data.cls.value;
      valueDisplay = clsVal.toFixed(3);
      if (clsVal <= 0.1) {
        statusClass = 'good'; statusLabel = 'Good'; textClass = 'good-text'; subdesc = 'No layout shift detected.';
        percent = (clsVal / 0.1) * 33;
      } else if (clsVal <= 0.25) {
        statusClass = 'warning'; statusLabel = 'Needs Work'; textClass = 'warning-text'; subdesc = 'Some layout shifts present.';
        percent = 33 + ((clsVal - 0.1) / 0.15) * 33;
      } else {
        statusClass = 'poor'; statusLabel = 'Poor'; textClass = 'danger-text'; subdesc = 'Poor layout stability.';
        percent = Math.min(100, 66 + ((clsVal - 0.25) / 0.5) * 34);
      }
    } else if (type === 'tbt') {
      const tbtVal = Math.round(data.tbt.value);
      valueDisplay = `${tbtVal}ms`;
      if (tbtVal <= 200) {
        statusClass = 'good'; statusLabel = 'Good'; textClass = 'good-text'; subdesc = 'Main thread is responsive.';
        percent = (tbtVal / 200) * 33;
      } else if (tbtVal <= 600) {
        statusClass = 'warning'; statusLabel = 'Needs Work'; textClass = 'warning-text'; subdesc = 'Some input blocking present.';
        percent = 33 + ((tbtVal - 200) / 400) * 33;
      } else {
        statusClass = 'poor'; statusLabel = 'Poor'; textClass = 'danger-text'; subdesc = `${(tbtVal - 200)}ms over the 200ms limit.`;
        percent = Math.min(100, 66 + ((tbtVal - 600) / 1000) * 34);
      }
    } else if (type === 'inp') {
      const inpVal = Math.round(data.inp.value);
      valueDisplay = `${inpVal}ms`;
      if (inpVal <= 200) {
        statusClass = 'good'; statusLabel = 'Good'; textClass = 'good-text'; subdesc = 'Excellent input responsiveness.';
        percent = (inpVal / 200) * 33;
      } else if (inpVal <= 500) {
        statusClass = 'warning'; statusLabel = 'Needs Work'; textClass = 'warning-text'; subdesc = 'Needs work (over 200ms).';
        percent = 33 + ((inpVal - 200) / 300) * 33;
      } else {
        statusClass = 'poor'; statusLabel = 'Poor'; textClass = 'danger-text'; subdesc = `${(inpVal - 200)}ms over the 200ms limit.`;
        percent = Math.min(100, 66 + ((inpVal - 500) / 1000) * 34);
      }
    }
  }

  return { statusClass, statusLabel, valueDisplay, textClass, subdesc, percent };
}

/**
 * Generates dynamic status badge HTML for metrics detail table.
 */
function getStatusBadgeHtml(mDetail) {
  if (mDetail.valueDisplay === 'N/A' || mDetail.statusLabel === 'Static Only') {
    return `<span class="status-indicator-dot" style="background-color: var(--text-secondary);"></span>N/A`;
  }
  if (mDetail.statusLabel === 'Good') {
    return `<span class="status-indicator-dot dot-green"></span>PASS`;
  } else if (mDetail.statusLabel === 'Needs Work') {
    return `<span class="status-indicator-dot dot-warning"></span>WARN`;
  } else {
    return `<span class="status-indicator-dot dot-danger"></span>FAIL`;
  }
}

/**
 * Helper to dynamically load and customize SVG icons from the icons/ folder.
 */
function getIconSvg(name, size = 24, strokeWidth = 2) {
  try {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const iconPath = path.join(currentDir, 'icons', `${name}.svg`);
    if (fs.existsSync(iconPath)) {
      let svg = fs.readFileSync(iconPath, 'utf8');
      return svg
        .replace(/width="24"/g, `width="${size}"`)
        .replace(/height="24"/g, `height="${size}"`)
        .replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`);
    }
  } catch (err) {
    // fallback
  }
  return '';
}

/**
 * Generates dynamic metric card status badge HTML (PASS/WARN/FAIL).
 */
function getMetricBadgeHtml(mDetail) {
  if (mDetail.valueDisplay === 'N/A' || mDetail.statusLabel === 'Static Only') {
    return `<span class="metric-warning-badge">N/A</span>`;
  }
  if (mDetail.statusLabel === 'Good') {
    return `<span class="metric-pass-badge">${getIconSvg('passed', 12, 3)} PASS</span>`;
  } else if (mDetail.statusLabel === 'Needs Work') {
    return `<span class="metric-warning-badge">${getIconSvg('warning', 12, 3)} WARN</span>`;
  } else {
    return `<span class="metric-poor-badge">${getIconSvg('failed', 12, 3)} FAIL</span>`;
  }
}

/**
 * Escapes special HTML characters to prevent breaking the generated report structure.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}



/**
 * Helper to build Metrics Grid HTML.
 */
function buildMetricGridHtml(lcp, cls, tbt, isLocal = false) {
  return `
      <div class="metrics-grid ${isLocal ? 'local-data-view hidden-view' : 'api-data-view'}">
        <!-- LCP Card -->
        <div class="metric-card">
          <div class="metric-header-layout">
            <div class="metric-icon-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="metric-title-group">
              <span class="metric-fullname">Largest Contentful Paint (LCP)</span>
              <span class="metric-desc-text">Measures loading performance.</span>
            </div>
          </div>
          <div class="metric-value ${lcp.textClass}">${lcp.valueDisplay}</div>
          <div class="metric-range-bar">
            <div class="range-indicator" style="left: ${lcp.percent}%;"></div>
            <div class="range-segments">
              <span class="seg good"></span><span class="seg warning"></span><span class="seg poor"></span>
            </div>
          </div>
          <div class="metric-bottom-bar">
            ${getMetricBadgeHtml(lcp)}
            <span class="threshold-lbl">Good &le; 2.5s</span>
          </div>
        </div>

        <!-- CLS Card -->
        <div class="metric-card">
          <div class="metric-header-layout">
            <div class="metric-icon-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="9" y1="12" x2="21" y2="12"></line>
              </svg>
            </div>
            <div class="metric-title-group">
              <span class="metric-fullname">Cumulative Layout Shift (CLS)</span>
              <span class="metric-desc-text">Measures visual stability.</span>
            </div>
          </div>
          <div class="metric-value ${cls.textClass}">${cls.valueDisplay}</div>
          <div class="metric-range-bar">
            <div class="range-indicator" style="left: ${cls.percent}%;"></div>
            <div class="range-segments">
              <span class="seg good"></span><span class="seg warning"></span><span class="seg poor"></span>
            </div>
          </div>
          <div class="metric-bottom-bar">
            ${getMetricBadgeHtml(cls)}
            <span class="threshold-lbl">Good &le; 0.1</span>
          </div>
        </div>

        <!-- TBT/INP Card -->
        <div class="metric-card">
          <div class="metric-header-layout">
            <div class="metric-icon-circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="metric-title-group">
              <span class="metric-fullname">Total Blocking Time (TBT)</span>
              <span class="metric-desc-text">Measures responsiveness.</span>
            </div>
          </div>
          <div class="metric-value ${tbt.textClass}">${tbt.valueDisplay}</div>
          <div class="metric-range-bar">
            <div class="range-indicator" style="left: ${tbt.percent}%;"></div>
            <div class="range-segments">
              <span class="seg good"></span><span class="seg warning"></span><span class="seg poor"></span>
            </div>
          </div>
          <div class="metric-bottom-bar">
            ${getMetricBadgeHtml(tbt)}
            <span class="threshold-lbl">Good &le; 200ms</span>
          </div>
        </div>
      </div>
  `;
}

/**
 * Injects findings into the HTML template and renders it as HTML and PDF.
 * 
 * @param {object} compiledResult Compiled results from recommendations.js.
 * @param {object} options Options containing target project name, url, etc.
 * @returns {Promise<{pdfPath: string, htmlPath: string}>}
 */
export async function generateReport(compiledResult, options) {
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const templatePath = path.join(currentDir, 'template.html');
  const cssPath = path.join(currentDir, 'style.css');

  let templateHtml = fs.readFileSync(templatePath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  // Inject CSS directly
  templateHtml = templateHtml.replace('/* CSS_CONTENT_PLACEHOLDER */', cssContent);

  const hasLighthouse = options.lighthouseData && !options.lighthouseData.error && options.lighthouseData.mobile;
  const localMobileData = hasLighthouse ? options.lighthouseData.mobile : null;
  const localDesktopData = hasLighthouse ? options.lighthouseData.desktop : null;

  const hasPsi = options.psiData && options.psiData.mobile;
  const mobileData = hasPsi ? options.psiData.mobile : localMobileData;
  const desktopData = hasPsi ? options.psiData.desktop : localDesktopData;

  // Determine scores for API and Local
  const getScoreData = (score) => {
    let cls = 'good', textCls = 'good-text', status = 'Passed';
    if (score < 50) {
      cls = 'poor'; textCls = 'danger-text'; status = 'Failed';
    } else if (score < 90) {
      cls = 'needs-improvement'; textCls = 'warning-text'; status = 'Needs Improvement';
    }
    return { score, cls, textCls, status };
  };

  const mobileApiScore = getScoreData(mobileData ? Math.round(mobileData.performanceScore) : compiledResult.healthScore);
  const desktopApiScore = getScoreData(desktopData ? Math.round(desktopData.performanceScore) : compiledResult.healthScore);
  const mobileLocScore = getScoreData(localMobileData ? Math.round(localMobileData.performanceScore) : mobileApiScore.score);
  const desktopLocScore = getScoreData(localDesktopData ? Math.round(localDesktopData.performanceScore) : desktopApiScore.score);

  // Calculate metrics details for lab data table (using Local Lighthouse data)
  const localMLcp = computeMetricDetails(localMobileData, 'lcp');
  const localMCls = computeMetricDetails(localMobileData, 'cls');
  const localMTbt = computeMetricDetails(localMobileData, 'tbt');
  const localMInp = computeMetricDetails(localMobileData, 'inp');

  const localDLcp = computeMetricDetails(localDesktopData, 'lcp');
  const localDCls = computeMetricDetails(localDesktopData, 'cls');
  const localDTbt = computeMetricDetails(localDesktopData, 'tbt');
  const localDInp = computeMetricDetails(localDesktopData, 'inp');

  // Parse optional CrUX Field Data
  let mobileCruxLcp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let mobileCruxCls = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let mobileCruxTbt = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let mobileCruxInp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };

  let desktopCruxLcp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let desktopCruxCls = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let desktopCruxTbt = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let desktopCruxInp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };

  const parsePsiFieldData = (fieldData) => {
    let res = { lcp: null, cls: null, tbt: null, inp: null };
    if (fieldData && fieldData.metrics) {
      const getVal = (key) => fieldData.metrics[key]?.percentile !== undefined ? fieldData.metrics[key].percentile : null;
      
      const lcpVal = getVal('LARGEST_CONTENTFUL_PAINT_MS');
      const clsVal = getVal('CUMULATIVE_LAYOUT_SHIFT_SCORE');
      const fidVal = getVal('FIRST_INPUT_DELAY_MS');
      const inpVal = getVal('INTERACTION_TO_NEXT_PAINT');

      if (lcpVal !== null) res.lcp = computeMetricDetails({ lcp: { value: lcpVal } }, 'lcp');
      if (clsVal !== null) res.cls = computeMetricDetails({ cls: { value: clsVal / 100 } }, 'cls'); // PSI CLS is * 100
      if (fidVal !== null) res.tbt = computeMetricDetails({ tbt: { value: fidVal } }, 'tbt');
      else if (inpVal !== null) res.tbt = computeMetricDetails({ tbt: { value: inpVal } }, 'tbt');
      if (inpVal !== null) res.inp = computeMetricDetails({ inp: { value: inpVal } }, 'inp');
    }
    return res;
  };

  if (options.psiData) {
    if (options.psiData.mobileField) {
      const mField = parsePsiFieldData(options.psiData.mobileField);
      if (mField.lcp) mobileCruxLcp = mField.lcp;
      if (mField.cls) mobileCruxCls = mField.cls;
      if (mField.tbt) mobileCruxTbt = mField.tbt;
      if (mField.inp) mobileCruxInp = mField.inp;
    }
    if (options.psiData.desktopField) {
      const dField = parsePsiFieldData(options.psiData.desktopField);
      if (dField.lcp) desktopCruxLcp = dField.lcp;
      if (dField.cls) desktopCruxCls = dField.cls;
      if (dField.tbt) desktopCruxTbt = dField.tbt;
      if (dField.inp) desktopCruxInp = dField.inp;
    }
  } else if (options.cruxData) {
    const parseCruxMetric = (metricName) => {
      const metrics = options.cruxData?.record?.metrics;
      if (!metrics || !metrics[metricName]) return null;
      const val = parseFloat(metrics[metricName].percentiles?.p75);
      return isNaN(val) ? null : val;
    };

    const cruxLcpVal = parseCruxMetric('largest_contentful_paint');
    const cruxClsVal = parseCruxMetric('cumulative_layout_shift');
    const cruxFidVal = parseCruxMetric('first_input_delay') || parseCruxMetric('interaction_to_next_paint');
    const cruxInpVal = parseCruxMetric('interaction_to_next_paint');

    if (cruxLcpVal !== null) {
      mobileCruxLcp = desktopCruxLcp = computeMetricDetails({ lcp: { value: cruxLcpVal } }, 'lcp');
    }
    if (cruxClsVal !== null) {
      mobileCruxCls = desktopCruxCls = computeMetricDetails({ cls: { value: cruxClsVal } }, 'cls');
    }
    if (cruxFidVal !== null) {
      mobileCruxTbt = desktopCruxTbt = computeMetricDetails({ tbt: { value: cruxFidVal } }, 'tbt');
    }
    if (cruxInpVal !== null) {
      mobileCruxInp = desktopCruxInp = computeMetricDetails({ inp: { value: cruxInpVal } }, 'inp');
    }
  }

  // Set overview metrics to use CrUX field data directly
  const mLcp = mobileCruxLcp;
  const mCls = mobileCruxCls;
  const mTbt = mobileCruxTbt;
  const mInp = mobileCruxInp;

  const dLcp = desktopCruxLcp;
  const dCls = desktopCruxCls;
  const dTbt = desktopCruxTbt;
  const dInp = desktopCruxInp;

  // Assessment Banner
  let assessmentBannerHtml = '';
  if (hasLighthouse) {
    const mobilePassed = mobileData && (mobileData.lcp.value / 1000 <= 2.5 && mobileData.cls.value <= 0.1 && mobileData.tbt.value <= 200);
    const desktopPassed = desktopData && (desktopData.lcp.value / 1000 <= 2.5 && desktopData.cls.value <= 0.1 && desktopData.tbt.value <= 200);

     if (mobilePassed && desktopPassed) {
      assessmentBannerHtml = `
        <div class="assessment-banner passed">
          <div style="display: flex; align-items: center; justify-content: center; height: 32px;">${getIconSvg('passed', 32, 2.5)}</div>
          <div>
            <div class="assessment-title">Core Web Vitals Assessment: Passed</div>
            <div class="assessment-desc">All parameters on both Mobile and Desktop meet Google's recommended performance standards.</div>
          </div>
        </div>
      `;
    } else {
      let failDetails = [];
      if (!mobilePassed) failDetails.push('Mobile');
      if (!desktopPassed) failDetails.push('Desktop');
      assessmentBannerHtml = `
        <div class="assessment-banner failed">
          <div style="display: flex; align-items: center; justify-content: center; height: 32px;">${getIconSvg('failed', 32, 2.5)}</div>
          <div>
            <div class="assessment-title">Core Web Vitals Assessment: Failed</div>
            <div class="assessment-desc">One or more parameters outside the Good range on: <strong>${failDetails.join(', ')}</strong>.</div>
          </div>
        </div>
      `;
    }
  }



  // Top Recommendations "Fix These First"
  const topIssues = compiledResult.issues.slice(0, 3);
  let topRecsHtml = '';
  if (topIssues.length === 0) {
    topRecsHtml = `
      <div class="fix-card" style="grid-column: span 3; text-align: center; color: var(--text-secondary); opacity: 0.7; padding: 24px;">
        No urgent recommendations needed. All checked rules pass!
      </div>
    `;
  } else {
    topRecsHtml = topIssues.map((issue, idx) => {
      let subtitle = 'Static scan opportunity';
      if (issue.occurrences && issue.occurrences.length > 1) {
        subtitle = `${issue.occurrences.length} files affected`;
      } else if (issue.file !== 'Runtime Audit (Lighthouse Mobile)' && issue.file !== 'Runtime Audit (Lighthouse Desktop)') {
        subtitle = `${path.basename(issue.file)}`;
      } else {
        subtitle = issue.file.replace('Runtime Audit (', '').replace(')', '');
      }
      return `
        <div class="fix-card">
          <div>
            <div class="fix-card-num">0${idx + 1}</div>
            <div class="fix-card-title">${escapeHtml(issue.message)}</div>
          </div>
          <div class="fix-card-savings">${escapeHtml(subtitle)}</div>
        </div>
      `;
    }).join('\n');
  }

  // Accordion Issues
  let accordionsHtml = '';
  if (compiledResult.issues.length === 0) {
    accordionsHtml = `
      <div style="text-align: center; padding: 48px; color: var(--text-muted); background-color: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
        No issues detected! Your codebase matches the best-practice rules.
      </div>
    `;
  } else {
    accordionsHtml = compiledResult.issues.map((issue, index) => {
      const idxStr = (index + 1).toString().padStart(2, '0');
      const severityClass = issue.severity.toLowerCase();
      const categoryClass = issue.cwv.toLowerCase();
      const isLighthouse = issue.file.includes('Runtime Audit (Lighthouse');
      
      let affectedSummary = '';
      let filesListHtml = '';

      if (issue.occurrences && issue.occurrences.length > 1) {
        affectedSummary = `${issue.occurrences.length} files`;
        const fileRows = issue.occurrences.map(o => {
          const lineStr = o.line && o.line !== '-' ? `:${o.line}` : '';
          return `
            <div class="file-row">
              <span class="file-path">${escapeHtml(o.file)}</span>
              <span class="file-line">${escapeHtml(lineStr)}</span>
            </div>
          `;
        }).join('\n');

        filesListHtml = `
          <div class="details-files">
            <div class="details-files-title">Affected Files:</div>
            <div class="files-list">
              ${fileRows}
            </div>
          </div>
        `;
      } else {
        affectedSummary = isLighthouse ? 'Runtime Audit' : path.basename(issue.file);
        const lineStr = issue.line && issue.line !== '-' ? `:${issue.line}` : '';
        if (!isLighthouse) {
          filesListHtml = `
            <div class="details-files">
              <div class="details-files-title">Affected File:</div>
              <div class="files-list">
                <div class="file-row">
                  <span class="file-path">${escapeHtml(issue.file)}</span>
                  <span class="file-line">${escapeHtml(lineStr)}</span>
                </div>
              </div>
            </div>
          `;
        }
      }

      let correlationBadge = '';
      let correlationDetailsHtml = '';

      if (issue.cwv === 'inp' && issue.confidence) {
        const confidenceClass = String(issue.confidence).toLowerCase();
        correlationBadge = `<span class="card-badge corr-badge ${confidenceClass}">${escapeHtml(issue.confidence)} Correlation</span>`;
        correlationDetailsHtml = `
          <div class="correlation-info" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <div style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">INP Correlation Evidence</div>
            ${issue.selector ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>DOM Selector:</strong> <code style="background-color: var(--bg-body); padding: 2px 6px; border-radius: 4px; color: #f43f5e;">${escapeHtml(issue.selector)}</code>
            </div>` : ''}
            ${issue.device ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Tested Device:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.device)}</span>
            </div>` : ''}
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Confidence Evidence:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.evidence ? issue.evidence.join('; ') : 'None')}</span>
            </div>
            ${issue.inpPhase ? `
            <div style="font-size: 0.82rem; margin-top: 6px; color: #6366f1; font-weight: 600;">
              ✓ Matched INP Details: ${escapeHtml(issue.inpPhase)}
            </div>` : ''}
          </div>
        `;
      } else if (issue.type === 'correlated') {
        const confidenceClass = String(issue.confidence).toLowerCase();
        correlationBadge = `<span class="card-badge corr-badge ${confidenceClass}">${escapeHtml(issue.confidence)} Correlation</span>`;
        correlationDetailsHtml = `
          <div class="correlation-info" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <div style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">CLS Correlation Evidence</div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>DOM Selector:</strong> <code style="background-color: var(--bg-body); padding: 2px 6px; border-radius: 4px; color: #f43f5e;">${escapeHtml(issue.selector)}</code>
            </div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Tested Device:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.device)}</span>
            </div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Confidence Evidence:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.evidence ? issue.evidence.join('; ') : 'None')}</span>
            </div>
            ${issue.snippet ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>HTML Snippet:</strong> <code style="background-color: var(--bg-body); padding: 4px 8px; border-radius: 4px; color: #f59e0b; display: block; margin-top: 4px; white-space: pre-wrap; font-family: monospace; font-size: 0.78rem;">${escapeHtml(issue.snippet)}</code>
            </div>` : ''}
            ${issue.staticRule ? `
            <div style="font-size: 0.82rem; margin-top: 6px; color: #10b981; font-weight: 600;">
              ✓ Combined static rule: "${escapeHtml(issue.staticRule)}"
            </div>` : ''}
          </div>
        `;
      } else if (issue.type === 'lighthouse-unresolved') {
        const isAmbiguous = issue.confidence === 'AMBIGUOUS';
        const badgeClass = isAmbiguous ? 'ambiguous' : 'unresolved';
        const badgeLabel = isAmbiguous ? 'Ambiguous Correlation' : 'Unresolved Correlation';
        correlationBadge = `<span class="card-badge corr-badge ${badgeClass}">${badgeLabel}</span>`;
        
        let ambiguousHtml = '';
        if (isAmbiguous && issue.ambiguousSources && issue.ambiguousSources.length > 0) {
          ambiguousHtml = `
            <div style="font-size: 0.82rem; margin-bottom: 4px; margin-top: 6px;">
              <strong>Ambiguous Matches:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0;">
                ${issue.ambiguousSources.map(s => `<li><code>${escapeHtml(path.basename(s.filePath))}:${s.line}</code></li>`).join('')}
              </ul>
            </div>`;
        }

        correlationDetailsHtml = `
          <div class="correlation-info" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <div style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">CLS Correlation Info</div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>DOM Selector:</strong> <code style="background-color: var(--bg-body); padding: 2px 6px; border-radius: 4px; color: #f43f5e;">${escapeHtml(issue.selector)}</code>
            </div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Tested Device:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.device)}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              Lighthouse flagged this element as layout-shifting, but ${isAmbiguous ? 'multiple source elements match this selector.' : 'it could not be uniquely matched to a single source code element.'}
            </div>
            ${ambiguousHtml}
          </div>
        `;
      } else if (issue.type === 'observer-fallback-correlated' || issue.type === 'observer-fallback-unresolved') {
        const isCorrelated = issue.type === 'observer-fallback-correlated';
        const isAmbiguous = issue.confidence === 'AMBIGUOUS';
        
        let confidenceClass = 'unresolved';
        let badgeLabel = 'Unresolved Correlation';
        
        if (isCorrelated) {
          confidenceClass = String(issue.confidence).toLowerCase();
          badgeLabel = `${escapeHtml(issue.confidence)} Correlation`;
        } else if (isAmbiguous) {
          confidenceClass = 'ambiguous';
          badgeLabel = 'Ambiguous Correlation';
        }
        
        let ambiguousHtml = '';
        if (isAmbiguous && issue.ambiguousSources && issue.ambiguousSources.length > 0) {
          ambiguousHtml = `
            <div style="font-size: 0.82rem; margin-bottom: 4px; margin-top: 6px;">
              <strong>Ambiguous Matches:</strong>
              <ul style="margin: 4px 0 0 16px; padding: 0;">
                ${issue.ambiguousSources.map(s => `<li><code>${escapeHtml(path.basename(s.filePath))}:${s.line}</code></li>`).join('')}
              </ul>
            </div>`;
        }

        correlationBadge = `<span class="card-badge corr-badge ${confidenceClass}">${badgeLabel}</span>`;
        correlationDetailsHtml = `
          <div class="correlation-info" style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
            <div style="font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;">Observer Fallback Details</div>
            <div style="font-size: 0.82rem; margin-bottom: 4px; color: #8b5cf6;">
              <em>This data was captured by an unthrottled diagnostic observer because Lighthouse failed to attribute nodes.</em>
            </div>
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>DOM Selector:</strong> <code style="background-color: var(--bg-body); padding: 2px 6px; border-radius: 4px; color: #f43f5e;">${escapeHtml(issue.selector)}</code>
            </div>
            ${issue.snippet ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>HTML Snippet:</strong> <code style="background-color: var(--bg-body); padding: 4px 8px; border-radius: 4px; color: #f59e0b; display: block; margin-top: 4px; white-space: pre-wrap; font-family: monospace; font-size: 0.78rem;">${escapeHtml(issue.snippet)}</code>
            </div>` : ''}
            ${issue.previousRect && issue.currentRect ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px;">
              <strong>Bounding Box (Before -> After):</strong>
              <div style="background-color: var(--bg-body); padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 0.78rem; margin-top: 4px;">
                X: ${issue.previousRect.x.toFixed(1)} -> ${issue.currentRect.x.toFixed(1)}<br>
                Y: ${issue.previousRect.y.toFixed(1)} -> ${issue.currentRect.y.toFixed(1)}<br>
                Width: ${issue.previousRect.width.toFixed(1)} -> ${issue.currentRect.width.toFixed(1)}<br>
                Height: ${issue.previousRect.height.toFixed(1)} -> ${issue.currentRect.height.toFixed(1)}
              </div>
            </div>` : ''}
            ${isCorrelated ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px; margin-top: 6px;">
              <strong>Confidence Evidence:</strong> <span style="color: var(--text-secondary);">${escapeHtml(issue.evidence ? issue.evidence.join('; ') : 'None')}</span>
            </div>` : ''}
            ${isAmbiguous ? ambiguousHtml : ''}
            ${!isCorrelated && !isAmbiguous ? `
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 6px;">
              This diagnostic element could not be uniquely matched to a single source code element.
            </div>` : ''}
          </div>
        `;
      }

      return `
        <div class="issue-card" data-severity="${escapeHtml(issue.severity)}" data-category="${escapeHtml(issue.cwv)}">
          <div class="issue-card-header" onclick="toggleAccordion(this)">
            <div class="issue-card-left">
              <span class="issue-idx">#${idxStr}</span>
              <div class="issue-badges">
                <span class="card-badge ${severityClass}">${escapeHtml(issue.severity)}</span>
                <span class="card-badge cat">${escapeHtml(issue.cwv)}</span>
                ${correlationBadge}
              </div>
              <span class="issue-title-text">${escapeHtml(issue.message)}</span>
            </div>
            <div class="issue-card-right">
              <span class="affected-summary">${escapeHtml(affectedSummary)}</span>
              <span class="accordion-arrow">▼</span>
            </div>
          </div>
          <div class="issue-card-details">
            <div class="details-desc">${escapeHtml(issue.impact)}</div>
            <div class="details-fix">
              <div class="details-fix-title">Recommendation</div>
              <div class="details-fix-text">${escapeHtml(issue.suggestion)}</div>
            </div>
            ${filesListHtml}
            ${correlationDetailsHtml}
          </div>
        </div>
      `;
    }).join('\n');
  }

  // Replace all general placeholders
  const projectName = options.clientName || path.basename(options.projectPath);
  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let cruxHistogramsHtml = '';
  if (options.cruxHistoryData && options.cruxHistoryData.record) {
    const historyRecord = options.cruxHistoryData.record;
    const historyJson = JSON.stringify(historyRecord);
    
    cruxHistogramsHtml += `
      <div class="crux-raw-section" style="margin-top: 24px;">
        <div class="crux-raw-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            CrUX Historical Trend (Past 6 Months)
          </h3>
          <p>LCP (ms) and CLS scores over the previous 25 collection periods.</p>
        </div>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="cruxHistoryChart"></canvas>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          const initChart = () => {
            if (typeof Chart === 'undefined') {
              setTimeout(initChart, 50);
              return;
            }
            const historyData = ${historyJson};
            if (!historyData.collectionPeriods || !historyData.metrics) return;
            
            let labels = [];
            let lcpData = [];
            let clsData = [];
            
            const lcpRaw = historyData.metrics.largest_contentful_paint?.percentilesTimeseries?.p75s || [];
            const clsRaw = historyData.metrics.cumulative_layout_shift?.percentilesTimeseries?.p75s || [];
            
            historyData.collectionPeriods.forEach((p, idx) => {
              const lcpVal = lcpRaw[idx];
              const clsVal = clsRaw[idx];
              
              if ((lcpVal !== null && lcpVal !== undefined && lcpVal !== 'NaN') || 
                  (clsVal !== null && clsVal !== undefined && clsVal !== 'NaN')) {
                labels.push(p.lastDate.year + '-' + String(p.lastDate.month).padStart(2, '0') + '-' + String(p.lastDate.day).padStart(2, '0'));
                lcpData.push(lcpVal);
                clsData.push(clsVal);
              }
            });
            
            const ctx = document.getElementById('cruxHistoryChart').getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: labels,
                datasets: [
                  {
                    label: 'LCP p75 (ms)',
                    data: lcpData,
                    borderColor: '#4F46E5', // Indigo
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    yAxisID: 'yLcp',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#4F46E5'
                  },
                  {
                    label: 'CLS p75',
                    data: clsData,
                    borderColor: '#F59E0B', // Amber
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    yAxisID: 'yCls',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 3,
                    pointBackgroundColor: '#F59E0B'
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable for PDF rendering
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  x: {
                    grid: { display: false }
                  },
                  yLcp: {
                    type: 'linear',
                    position: 'left',
                    title: { display: true, text: 'LCP (ms)' },
                    grid: { color: 'rgba(0,0,0,0.05)' }
                  },
                  yCls: {
                    type: 'linear',
                    position: 'right',
                    title: { display: true, text: 'CLS Score' },
                    grid: { display: false }
                  }
                }
              }
            });
          };
          initChart();
        </script>
      </div>
    `;
  }

  templateHtml = templateHtml
    .replace(/{{CRUX_HISTOGRAMS_SECTION}}/g, cruxHistogramsHtml)
    .replace(/{{CLIENT_NAME}}/g, options.clientName || 'Default Project')
    .replace(/{{PROJECT_PATH}}/g, projectName)
    .replace(/{{AUDIT_DATE}}/g, formattedDate)
    .replace(/{{AUDIT_URL}}/g, options.url || 'No URL specified (Static scan only)')
    .replace(/{{SUMMARY_HIGH}}/g, compiledResult.summary.high)
    .replace(/{{SUMMARY_MEDIUM}}/g, compiledResult.summary.medium)
    .replace(/{{SUMMARY_LOW}}/g, compiledResult.summary.low)
    
     // MOBILE values
    .replace(/{{MOBILE_MAIN_SCORE}}/g, mobileApiScore.score)
    .replace(/{{MOBILE_SCORE_CLASS}}/g, mobileApiScore.cls)
    .replace(/{{MOBILE_SCORE_TEXT_CLASS}}/g, mobileApiScore.textCls)
    .replace(/{{MOBILE_SCORE_STATUS}}/g, mobileApiScore.status)

    .replace(/{{MOBILE_API_SCORE}}/g, mobileApiScore.score)
    .replace(/{{MOBILE_API_CLASS}}/g, mobileApiScore.cls)
    .replace(/{{MOBILE_API_TEXT_CLASS}}/g, mobileApiScore.textCls)
    .replace(/{{MOBILE_API_STATUS}}/g, mobileApiScore.status)

    .replace(/{{MOBILE_LOCAL_SCORE}}/g, mobileLocScore.score)
    .replace(/{{MOBILE_LOCAL_CLASS}}/g, mobileLocScore.cls)
    .replace(/{{MOBILE_LOCAL_TEXT_CLASS}}/g, mobileLocScore.textCls)
    .replace(/{{MOBILE_LOCAL_STATUS}}/g, mobileLocScore.status)
    .replace(/{{MOBILE_LCP_STATUS_CLASS}}/g, mLcp.statusClass)
    .replace(/{{MOBILE_LCP_STATUS_LABEL}}/g, mLcp.statusLabel)
    .replace(/{{MOBILE_LCP_VALUE_DISPLAY}}/g, mLcp.valueDisplay)
    .replace(/{{MOBILE_LCP_TEXT_CLASS}}/g, mLcp.textClass)
    .replace(/{{MOBILE_LCP_SUBDESC}}/g, mLcp.subdesc)
    .replace(/{{MOBILE_LCP_PERCENT}}/g, mLcp.percent)
    .replace(/{{MOBILE_CLS_STATUS_CLASS}}/g, mCls.statusClass)
    .replace(/{{MOBILE_CLS_STATUS_LABEL}}/g, mCls.statusLabel)
    .replace(/{{MOBILE_CLS_VALUE_DISPLAY}}/g, mCls.valueDisplay)
    .replace(/{{MOBILE_CLS_TEXT_CLASS}}/g, mCls.textClass)
    .replace(/{{MOBILE_CLS_SUBDESC}}/g, mCls.subdesc)
    .replace(/{{MOBILE_CLS_PERCENT}}/g, mCls.percent)
    .replace(/{{MOBILE_TBT_STATUS_CLASS}}/g, mTbt.statusClass)
    .replace(/{{MOBILE_TBT_STATUS_LABEL}}/g, mTbt.statusLabel)
    .replace(/{{MOBILE_TBT_VALUE_DISPLAY}}/g, mTbt.valueDisplay)
    .replace(/{{MOBILE_TBT_TEXT_CLASS}}/g, mTbt.textClass)
    .replace(/{{MOBILE_TBT_SUBDESC}}/g, mTbt.subdesc)
    .replace(/{{MOBILE_TBT_PERCENT}}/g, mTbt.percent)

     // Table values and statuses
    .replace(/{{MOBILE_LCP_FIELD_VALUE}}/g, mobileCruxLcp.valueDisplay)
    .replace(/{{MOBILE_LCP_FIELD_STATUS}}/g, getStatusBadgeHtml(mobileCruxLcp))
    .replace(/{{MOBILE_LCP_LAB_VALUE}}/g, localMLcp.valueDisplay)
    .replace(/{{MOBILE_LCP_LAB_STATUS}}/g, getStatusBadgeHtml(localMLcp))

    .replace(/{{MOBILE_CLS_FIELD_VALUE}}/g, mobileCruxCls.valueDisplay)
    .replace(/{{MOBILE_CLS_FIELD_STATUS}}/g, getStatusBadgeHtml(mobileCruxCls))
    .replace(/{{MOBILE_CLS_LAB_VALUE}}/g, localMCls.valueDisplay)
    .replace(/{{MOBILE_CLS_LAB_STATUS}}/g, getStatusBadgeHtml(localMCls))

    .replace(/{{MOBILE_TBT_FIELD_VALUE}}/g, mobileCruxTbt.valueDisplay)
    .replace(/{{MOBILE_TBT_FIELD_STATUS}}/g, getStatusBadgeHtml(mobileCruxTbt))
    .replace(/{{MOBILE_TBT_LAB_VALUE}}/g, localMTbt.valueDisplay)
    .replace(/{{MOBILE_TBT_LAB_STATUS}}/g, getStatusBadgeHtml(localMTbt))

    .replace(/{{MOBILE_INP_FIELD_VALUE}}/g, mobileCruxInp.valueDisplay)
    .replace(/{{MOBILE_INP_FIELD_STATUS}}/g, getStatusBadgeHtml(mobileCruxInp))
    .replace(/{{MOBILE_INP_LAB_VALUE}}/g, localMInp.valueDisplay)
    .replace(/{{MOBILE_INP_LAB_STATUS}}/g, getStatusBadgeHtml(localMInp))

    // Desktop Table values and statuses
    .replace(/{{DESKTOP_LCP_FIELD_VALUE}}/g, desktopCruxLcp.valueDisplay)
    .replace(/{{DESKTOP_LCP_FIELD_STATUS}}/g, getStatusBadgeHtml(desktopCruxLcp))
    .replace(/{{DESKTOP_LCP_LAB_VALUE}}/g, localDLcp.valueDisplay)
    .replace(/{{DESKTOP_LCP_LAB_STATUS}}/g, getStatusBadgeHtml(localDLcp))

    .replace(/{{DESKTOP_CLS_FIELD_VALUE}}/g, desktopCruxCls.valueDisplay)
    .replace(/{{DESKTOP_CLS_FIELD_STATUS}}/g, getStatusBadgeHtml(desktopCruxCls))
    .replace(/{{DESKTOP_CLS_LAB_VALUE}}/g, localDCls.valueDisplay)
    .replace(/{{DESKTOP_CLS_LAB_STATUS}}/g, getStatusBadgeHtml(localDCls))

    .replace(/{{DESKTOP_TBT_FIELD_VALUE}}/g, desktopCruxTbt.valueDisplay)
    .replace(/{{DESKTOP_TBT_FIELD_STATUS}}/g, getStatusBadgeHtml(desktopCruxTbt))
    .replace(/{{DESKTOP_TBT_LAB_VALUE}}/g, localDTbt.valueDisplay)
    .replace(/{{DESKTOP_TBT_LAB_STATUS}}/g, getStatusBadgeHtml(localDTbt))

    .replace(/{{DESKTOP_INP_FIELD_VALUE}}/g, desktopCruxInp.valueDisplay)
    .replace(/{{DESKTOP_INP_FIELD_STATUS}}/g, getStatusBadgeHtml(desktopCruxInp))
    .replace(/{{DESKTOP_INP_LAB_VALUE}}/g, localDInp.valueDisplay)
    .replace(/{{DESKTOP_INP_LAB_STATUS}}/g, getStatusBadgeHtml(localDInp))

    // Card status badges
    .replace(/{{MOBILE_LCP_STATUS_BADGE}}/g, getMetricBadgeHtml(mLcp))
    .replace(/{{MOBILE_CLS_STATUS_BADGE}}/g, getMetricBadgeHtml(mCls))
    .replace(/{{MOBILE_TBT_STATUS_BADGE}}/g, getMetricBadgeHtml(mTbt))

    // DESKTOP values
    .replace(/{{DESKTOP_MAIN_SCORE}}/g, desktopApiScore.score)
    .replace(/{{DESKTOP_SCORE_CLASS}}/g, desktopApiScore.cls)
    .replace(/{{DESKTOP_SCORE_TEXT_CLASS}}/g, desktopApiScore.textCls)
    .replace(/{{DESKTOP_SCORE_STATUS}}/g, desktopApiScore.status)

    .replace(/{{DESKTOP_API_SCORE}}/g, desktopApiScore.score)
    .replace(/{{DESKTOP_API_CLASS}}/g, desktopApiScore.cls)
    .replace(/{{DESKTOP_API_TEXT_CLASS}}/g, desktopApiScore.textCls)
    .replace(/{{DESKTOP_API_STATUS}}/g, desktopApiScore.status)

    .replace(/{{DESKTOP_LOCAL_SCORE}}/g, desktopLocScore.score)
    .replace(/{{DESKTOP_LOCAL_CLASS}}/g, desktopLocScore.cls)
    .replace(/{{DESKTOP_LOCAL_TEXT_CLASS}}/g, desktopLocScore.textCls)
    .replace(/{{DESKTOP_LOCAL_STATUS}}/g, desktopLocScore.status)
    .replace(/{{DESKTOP_LCP_STATUS_CLASS}}/g, dLcp.statusClass)
    .replace(/{{DESKTOP_LCP_STATUS_LABEL}}/g, dLcp.statusLabel)
    .replace(/{{DESKTOP_LCP_VALUE_DISPLAY}}/g, dLcp.valueDisplay)
    .replace(/{{DESKTOP_LCP_TEXT_CLASS}}/g, dLcp.textClass)
    .replace(/{{DESKTOP_LCP_SUBDESC}}/g, dLcp.subdesc)
    .replace(/{{DESKTOP_LCP_PERCENT}}/g, dLcp.percent)
    .replace(/{{DESKTOP_CLS_STATUS_CLASS}}/g, dCls.statusClass)
    .replace(/{{DESKTOP_CLS_STATUS_LABEL}}/g, dCls.statusLabel)
    .replace(/{{DESKTOP_CLS_VALUE_DISPLAY}}/g, dCls.valueDisplay)
    .replace(/{{DESKTOP_CLS_TEXT_CLASS}}/g, dCls.textClass)
    .replace(/{{DESKTOP_CLS_SUBDESC}}/g, dCls.subdesc)
    .replace(/{{DESKTOP_CLS_PERCENT}}/g, dCls.percent)
    .replace(/{{DESKTOP_TBT_STATUS_CLASS}}/g, dTbt.statusClass)
    .replace(/{{DESKTOP_TBT_STATUS_LABEL}}/g, dTbt.statusLabel)
    .replace(/{{DESKTOP_TBT_VALUE_DISPLAY}}/g, dTbt.valueDisplay)
    .replace(/{{DESKTOP_TBT_TEXT_CLASS}}/g, dTbt.textClass)
    .replace(/{{DESKTOP_TBT_SUBDESC}}/g, dTbt.subdesc)
    .replace(/{{DESKTOP_TBT_PERCENT}}/g, dTbt.percent)

    // Desktop Card status badges
    .replace(/{{DESKTOP_LCP_STATUS_BADGE}}/g, getMetricBadgeHtml(dLcp))
    .replace(/{{DESKTOP_CLS_STATUS_BADGE}}/g, getMetricBadgeHtml(dCls))
    .replace(/{{DESKTOP_TBT_STATUS_BADGE}}/g, getMetricBadgeHtml(dTbt))

    // Sections
    .replace(/<!-- ASSESSMENT_BANNER_SECTION -->/g, assessmentBannerHtml)
    .replace(/<!-- MOBILE_METRICS_GRID -->/g, buildMetricGridHtml(mLcp, mCls, mTbt, false) + buildMetricGridHtml(localMLcp, localMCls, localMTbt, true))
    .replace(/<!-- DESKTOP_METRICS_GRID -->/g, buildMetricGridHtml(dLcp, dCls, dTbt, false) + buildMetricGridHtml(localDLcp, localDCls, localDTbt, true))
    .replace(/{{TOP_RECOMMENDATIONS}}/g, topRecsHtml)
    .replace(/{{ISSUES_ACCORDIONS}}/g, accordionsHtml)
    .replace(/{{SEARCH_ICON}}/g, getIconSvg('search', 16, 2));

  const timestamp = Date.now();
  const outputDir = path.join(options.projectPath, 'reports');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, `report-${timestamp}.html`);
  const pdfPath = path.join(outputDir, `report-${timestamp}.pdf`);

  fs.writeFileSync(htmlPath, templateHtml);
  console.log(`\n📄 HTML report written to: ${htmlPath}`);

  // Render to PDF using Puppeteer
  try {
    console.log('Generating PDF from HTML template...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(templateHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      },
      printBackground: true
    });

    await browser.close();
    console.log(`🏆 PDF report successfully generated: ${pdfPath}`);
  } catch (err) {
    console.warn(`⚠️ Failed to generate PDF report: ${err.message}. HTML report is still available.`);
  }

  return { htmlPath, pdfPath };
}
