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
      const tbtVal = data.tbt.value;
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
    }
  }

  return { statusClass, statusLabel, valueDisplay, textClass, subdesc, percent };
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

  let mobileScoreClass = 'good', mobileScoreTextClass = 'good-text', mobileScoreStatus = 'Excellent';
  if (mobileScore < 50) {
    mobileScoreClass = 'poor'; mobileScoreTextClass = 'danger-text'; mobileScoreStatus = 'Poor';
  } else if (mobileScore < 90) {
    mobileScoreClass = 'needs-improvement'; mobileScoreTextClass = 'warning-text'; mobileScoreStatus = 'Needs Improvement';
  }

  let desktopScoreClass = 'good', desktopScoreTextClass = 'good-text', desktopScoreStatus = 'Excellent';
  if (desktopScore < 50) {
    desktopScoreClass = 'poor'; desktopScoreTextClass = 'danger-text'; desktopScoreStatus = 'Poor';
  } else if (desktopScore < 90) {
    desktopScoreClass = 'needs-improvement'; desktopScoreTextClass = 'warning-text'; desktopScoreStatus = 'Needs Improvement';
  }

  // Calculate metrics details
  const mLcp = computeMetricDetails(mobileData, 'lcp');
  const mCls = computeMetricDetails(mobileData, 'cls');
  const mTbt = computeMetricDetails(mobileData, 'tbt');

  const dLcp = computeMetricDetails(desktopData, 'lcp');
  const dCls = computeMetricDetails(desktopData, 'cls');
  const dTbt = computeMetricDetails(desktopData, 'tbt');

  // Assessment Banner
  let assessmentBannerHtml = '';
  if (hasLighthouse) {
    const mobilePassed = mobileData && (mobileData.lcp.value / 1000 <= 2.5 && mobileData.cls.value <= 0.1 && mobileData.tbt.value <= 200);
    const desktopPassed = desktopData && (desktopData.lcp.value / 1000 <= 2.5 && desktopData.cls.value <= 0.1 && desktopData.tbt.value <= 200);

    if (mobilePassed && desktopPassed) {
      assessmentBannerHtml = `
        <div class="assessment-banner passed">
          <div style="font-size: 1.8rem; line-height: 1;">🟢</div>
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
          <div style="font-size: 1.8rem; line-height: 1;">🔴</div>
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
        🎉 No urgent recommendations needed. All checked rules pass!
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
            <div class="fix-card-title">${issue.message}</div>
          </div>
          <div class="fix-card-savings">${subtitle}</div>
        </div>
      `;
    }).join('\n');
  }

  // Accordion Issues
  let accordionsHtml = '';
  if (compiledResult.issues.length === 0) {
    accordionsHtml = `
      <div style="text-align: center; padding: 48px; color: var(--text-muted); background-color: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-color);">
        🎉 No issues detected! Your codebase matches the best-practice rules.
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
              <span class="file-path">${o.file}</span>
              <span class="file-line">${lineStr}</span>
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
                  <span class="file-path">${issue.file}</span>
                  <span class="file-line">${lineStr}</span>
                </div>
              </div>
            </div>
          `;
        }
      }

      return `
        <div class="issue-card" data-severity="${issue.severity}" data-category="${issue.cwv}">
          <div class="issue-card-header" onclick="toggleAccordion(this)">
            <div class="issue-card-left">
              <span class="issue-idx">#${idxStr}</span>
              <div class="issue-badges">
                <span class="card-badge ${severityClass}">${issue.severity}</span>
                <span class="card-badge cat">${issue.cwv}</span>
              </div>
              <span class="issue-title-text">${issue.message}</span>
            </div>
            <div class="issue-card-right">
              <span class="affected-summary">${affectedSummary}</span>
              <span class="accordion-arrow">▼</span>
            </div>
          </div>
          <div class="issue-card-details">
            <div class="details-desc">${issue.impact}</div>
            <div class="details-fix">
              <div class="details-fix-title">Recommendation</div>
              <div class="details-fix-text">${issue.suggestion}</div>
            </div>
            ${filesListHtml}
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

    // Sections
    .replace(/<!-- ASSESSMENT_BANNER_SECTION -->/g, assessmentBannerHtml)
    .replace(/{{TOP_RECOMMENDATIONS}}/g, topRecsHtml)
    .replace(/{{ISSUES_ACCORDIONS}}/g, accordionsHtml);

  const timestamp = Date.now();
  const outputDir = path.join(options.projectPath, 'reports');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const htmlPath = path.join(outputDir, `report-${timestamp}.html`);
  const pdfPath = path.join(outputDir, `report-${timestamp}.pdf`);

  fs.writeFileSync(htmlPath, templateHtml);
  console.log(`\n📄 HTML report written to: ${htmlPath}`);

  const jsonPath = path.join(outputDir, `report-${timestamp}.json`);
  const jsonPayload = {
    projectName,
    clientName: options.clientName || 'Default Project',
    gitBranch: options.gitBranch || 'N/A',
    auditDate: formattedDate,
    auditUrl: options.url || 'No URL specified (Static scan only)',
    healthScore: {
      mobile: mobileScore,
      desktop: desktopScore
    },
    lighthouseData: options.lighthouseData || null,
    summary: compiledResult.summary,
    issues: compiledResult.issues
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2));
  console.log(`📊 JSON data report written to: ${jsonPath}`);

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

  return { htmlPath, pdfPath, jsonPath };
}
