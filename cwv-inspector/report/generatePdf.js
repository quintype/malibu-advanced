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
 * Helper to build Lighthouse Score Slider HTML.
 */
function buildSliderHtml(data, title) {
  if (!data) return '';
  const diffToGoal = 90 - Math.round(data.performanceScore);
  const diffText = diffToGoal > 0 ? `${diffToGoal} points below the 90 target` : 'Meets the 90 target!';

  return `
    <div class="lh-score-section">
      <div class="lh-score-header">
        <div class="lh-score-title-group">
          <h4>${title} Performance Score</h4>
          <div class="val">${Math.round(data.performanceScore)}</div>
        </div>
        <div class="lh-score-target">${diffText}</div>
      </div>
      <div class="slider-track-container">
        <div class="slider-track">
          <div class="slider-track-fill" style="width: ${Math.round(data.performanceScore)}%;"></div>
          <div class="slider-handle" style="left: ${Math.round(data.performanceScore)}%;"></div>
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
  const mobileData = hasLighthouse ? options.lighthouseData.mobile : null;
  const desktopData = hasLighthouse ? options.lighthouseData.desktop : null;

  // Determine scores
  const mobileScore = mobileData ? Math.round(mobileData.performanceScore) : compiledResult.healthScore;
  const desktopScore = desktopData ? Math.round(desktopData.performanceScore) : compiledResult.healthScore;

  const mobilePassed = mobileData && (mobileData.lcp.value / 1000 <= 2.5 && mobileData.cls.value <= 0.1 && mobileData.tbt.value <= 200);
  const desktopPassed = desktopData && (desktopData.lcp.value / 1000 <= 2.5 && desktopData.cls.value <= 0.1 && desktopData.tbt.value <= 200);

  let mobileScoreClass = 'good', mobileScoreTextClass = 'good-text', mobileScoreStatus = 'Passed';
  if (mobileScore < 50) {
    mobileScoreClass = 'poor';
  } else if (mobileScore < 90) {
    mobileScoreClass = 'needs-improvement';
  }
  if (hasLighthouse) {
    if (!mobilePassed) {
      mobileScoreTextClass = 'danger-text';
      mobileScoreStatus = 'Failed';
    }
  } else {
    if (mobileScore < 90) {
      mobileScoreTextClass = 'danger-text';
      mobileScoreStatus = 'Failed';
    }
  }

  let desktopScoreClass = 'good', desktopScoreTextClass = 'good-text', desktopScoreStatus = 'Passed';
  if (desktopScore < 50) {
    desktopScoreClass = 'poor';
  } else if (desktopScore < 90) {
    desktopScoreClass = 'needs-improvement';
  }
  if (hasLighthouse) {
    if (!desktopPassed) {
      desktopScoreTextClass = 'danger-text';
      desktopScoreStatus = 'Failed';
    }
  } else {
    if (desktopScore < 90) {
      desktopScoreTextClass = 'danger-text';
      desktopScoreStatus = 'Failed';
    }
  }

  // Calculate metrics details
  const mLcp = computeMetricDetails(mobileData, 'lcp');
  const mCls = computeMetricDetails(mobileData, 'cls');
  const mTbt = computeMetricDetails(mobileData, 'tbt');
  const mInp = computeMetricDetails(mobileData, 'inp');

  const dLcp = computeMetricDetails(desktopData, 'lcp');
  const dCls = computeMetricDetails(desktopData, 'cls');
  const dTbt = computeMetricDetails(desktopData, 'tbt');
  const dInp = computeMetricDetails(desktopData, 'inp');

  // Parse optional CrUX Field Data
  let cruxLcp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let cruxCls = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let cruxTbt = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };
  let cruxInp = { statusClass: 'warning', statusLabel: 'Static Only', valueDisplay: 'N/A' };

  if (options.cruxData) {
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
      cruxLcp = computeMetricDetails({ lcp: { value: cruxLcpVal } }, 'lcp');
    }
    if (cruxClsVal !== null) {
      cruxCls = computeMetricDetails({ cls: { value: cruxClsVal } }, 'cls');
    }
    if (cruxFidVal !== null) {
      cruxTbt = computeMetricDetails({ tbt: { value: cruxFidVal } }, 'tbt');
    }
    if (cruxInpVal !== null) {
      cruxInp = computeMetricDetails({ inp: { value: cruxInpVal } }, 'inp');
    }
  }

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

  const mobileLhHtml = buildSliderHtml(mobileData, 'Mobile');
  const desktopLhHtml = buildSliderHtml(desktopData, 'Desktop');

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
        correlationBadge = `<span class="card-badge corr-badge unresolved">Unresolved Correlation</span>`;
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
              Lighthouse flagged this element as layout-shifting, but it could not be uniquely matched to a single source code element.
            </div>
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

  templateHtml = templateHtml
    .replace(/{{CLIENT_NAME}}/g, options.clientName || 'Default Project')
    .replace(/{{PROJECT_PATH}}/g, projectName)
    .replace(/{{AUDIT_DATE}}/g, formattedDate)
    .replace(/{{AUDIT_URL}}/g, options.url || 'No URL specified (Static scan only)')
    .replace(/{{SUMMARY_HIGH}}/g, compiledResult.summary.high)
    .replace(/{{SUMMARY_MEDIUM}}/g, compiledResult.summary.medium)
    .replace(/{{SUMMARY_LOW}}/g, compiledResult.summary.low)
    
     // MOBILE values
    .replace(/{{MOBILE_MAIN_SCORE}}/g, mobileScore)
    .replace(/{{MOBILE_SCORE_CLASS}}/g, mobileScoreClass)
    .replace(/{{MOBILE_SCORE_TEXT_CLASS}}/g, mobileScoreTextClass)
    .replace(/{{MOBILE_SCORE_STATUS}}/g, mobileScoreStatus)
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
    .replace(/{{MOBILE_LCP_FIELD_VALUE}}/g, cruxLcp.valueDisplay)
    .replace(/{{MOBILE_LCP_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxLcp))
    .replace(/{{MOBILE_LCP_LAB_VALUE}}/g, mLcp.valueDisplay)
    .replace(/{{MOBILE_LCP_LAB_STATUS}}/g, getStatusBadgeHtml(mLcp))

    .replace(/{{MOBILE_CLS_FIELD_VALUE}}/g, cruxCls.valueDisplay)
    .replace(/{{MOBILE_CLS_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxCls))
    .replace(/{{MOBILE_CLS_LAB_VALUE}}/g, mCls.valueDisplay)
    .replace(/{{MOBILE_CLS_LAB_STATUS}}/g, getStatusBadgeHtml(mCls))

    .replace(/{{MOBILE_TBT_FIELD_VALUE}}/g, cruxTbt.valueDisplay)
    .replace(/{{MOBILE_TBT_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxTbt))
    .replace(/{{MOBILE_TBT_LAB_VALUE}}/g, mTbt.valueDisplay)
    .replace(/{{MOBILE_TBT_LAB_STATUS}}/g, getStatusBadgeHtml(mTbt))

    .replace(/{{MOBILE_INP_FIELD_VALUE}}/g, cruxInp.valueDisplay)
    .replace(/{{MOBILE_INP_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxInp))
    .replace(/{{MOBILE_INP_LAB_VALUE}}/g, mInp.valueDisplay)
    .replace(/{{MOBILE_INP_LAB_STATUS}}/g, getStatusBadgeHtml(mInp))

    // Desktop Table values and statuses
    .replace(/{{DESKTOP_LCP_FIELD_VALUE}}/g, cruxLcp.valueDisplay)
    .replace(/{{DESKTOP_LCP_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxLcp))
    .replace(/{{DESKTOP_LCP_LAB_VALUE}}/g, dLcp.valueDisplay)
    .replace(/{{DESKTOP_LCP_LAB_STATUS}}/g, getStatusBadgeHtml(dLcp))

    .replace(/{{DESKTOP_CLS_FIELD_VALUE}}/g, cruxCls.valueDisplay)
    .replace(/{{DESKTOP_CLS_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxCls))
    .replace(/{{DESKTOP_CLS_LAB_VALUE}}/g, dCls.valueDisplay)
    .replace(/{{DESKTOP_CLS_LAB_STATUS}}/g, getStatusBadgeHtml(dCls))

    .replace(/{{DESKTOP_TBT_FIELD_VALUE}}/g, cruxTbt.valueDisplay)
    .replace(/{{DESKTOP_TBT_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxTbt))
    .replace(/{{DESKTOP_TBT_LAB_VALUE}}/g, dTbt.valueDisplay)
    .replace(/{{DESKTOP_TBT_LAB_STATUS}}/g, getStatusBadgeHtml(dTbt))

    .replace(/{{DESKTOP_INP_FIELD_VALUE}}/g, cruxInp.valueDisplay)
    .replace(/{{DESKTOP_INP_FIELD_STATUS}}/g, getStatusBadgeHtml(cruxInp))
    .replace(/{{DESKTOP_INP_LAB_VALUE}}/g, dInp.valueDisplay)
    .replace(/{{DESKTOP_INP_LAB_STATUS}}/g, getStatusBadgeHtml(dInp))

    // Card status badges
    .replace(/{{MOBILE_LCP_STATUS_BADGE}}/g, getMetricBadgeHtml(mLcp))
    .replace(/{{MOBILE_CLS_STATUS_BADGE}}/g, getMetricBadgeHtml(mCls))
    .replace(/{{MOBILE_TBT_STATUS_BADGE}}/g, getMetricBadgeHtml(mTbt))

    .replace(/<!-- MOBILE_LIGHTHOUSE_SECTION -->/g, mobileLhHtml)

    // DESKTOP values
    .replace(/{{DESKTOP_MAIN_SCORE}}/g, desktopScore)
    .replace(/{{DESKTOP_SCORE_CLASS}}/g, desktopScoreClass)
    .replace(/{{DESKTOP_SCORE_TEXT_CLASS}}/g, desktopScoreTextClass)
    .replace(/{{DESKTOP_SCORE_STATUS}}/g, desktopScoreStatus)
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
    .replace(/<!-- DESKTOP_LIGHTHOUSE_SECTION -->/g, desktopLhHtml)

    // Desktop Card status badges
    .replace(/{{DESKTOP_LCP_STATUS_BADGE}}/g, getMetricBadgeHtml(dLcp))
    .replace(/{{DESKTOP_CLS_STATUS_BADGE}}/g, getMetricBadgeHtml(dCls))
    .replace(/{{DESKTOP_TBT_STATUS_BADGE}}/g, getMetricBadgeHtml(dTbt))

     // Sections
    .replace(/<!-- ASSESSMENT_BANNER_SECTION -->/g, assessmentBannerHtml)
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
