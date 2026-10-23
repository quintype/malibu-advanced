import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { ReadableStream as WebReadableStream } from 'stream/web';

if (typeof globalThis.ReadableStream === 'undefined' && WebReadableStream) {
  globalThis.ReadableStream = WebReadableStream;
}

import puppeteer from 'puppeteer';
import { buildRedesignedPdfHtml, extractCruxHistoryPoints } from './redesignedPdfTemplate.js';

/**
 * Computes metric rendering properties.
 */
function computeMetricDetails(data, type) {
  let statusClass = 'warning', statusLabel = 'Static Only', valueDisplay = 'N/A', textClass = 'warning-text', subdesc = 'No runtime measured.', percent = 0;

  if (data) {
    if (type === 'lcp' && data.lcp && data.lcp.value !== undefined && data.lcp.value !== null && !isNaN(data.lcp.value)) {
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
    } else if (type === 'cls' && data.cls && data.cls.value !== undefined && data.cls.value !== null && !isNaN(data.cls.value)) {
      const clsVal = Number(data.cls.value);
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
    } else if (type === 'tbt' && data.tbt && data.tbt.value !== undefined && data.tbt.value !== null && !isNaN(data.tbt.value)) {
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
      if (data.inp && data.inp.value !== undefined && data.inp.value !== null && !isNaN(data.inp.value)) {
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
      } else {
        // Lab data doesn't measure INP; defaults to 0ms PASS in lab
        valueDisplay = '0ms';
        statusClass = 'good';
        statusLabel = 'Good';
        textClass = 'good-text';
        subdesc = 'Lab simulation does not measure runtime INP.';
        percent = 0;
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
  if (str === null || str === undefined) return '';
  if (typeof str === 'object') {
    try {
      return JSON.stringify(str);
    } catch (e) {
      return '';
    }
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}



/**
 * Helper to build Metrics Grid HTML.
 */
function buildMetricGridHtml(lcp, cls, tbt, isLocal = false, branchName = '') {
  return `
      <div class="metrics-grid ${isLocal ? 'local-data-view' : 'api-data-view hidden-view'}">
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
              <span class="metric-fullname">Cumulative Layout Shift (CLS)${isLocal && branchName ? ` <span class="branch-tag" style="margin-left: 6px; font-size: 0.65rem; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; font-family: monospace;">branch: ${escapeHtml(branchName)}</span>` : ''}</span>
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
export async function generateReport(compiledResult, options = {}) {
  options = { projectPath: process.cwd(), ...options };
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
  const emulationConfig = hasLighthouse ? options.lighthouseData.emulationConfig : null;

  // Build Test Configuration Info Bar HTML for each device
  function buildEmulationConfigBar(config) {
    if (!config) return '';
    const isMobile = config.formFactor === 'mobile';
    const deviceIcon = isMobile
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
    return `
      <div class="emulation-config-bar" style="margin: 8px 0 12px 0; padding: 10px 16px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 10px; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 0.72rem; color: #475569;">
        <span style="display: inline-flex; align-items: center; gap: 5px; font-weight: 700; color: #0f172a; font-size: 0.73rem;">
          ${deviceIcon}
          Test Configuration
        </span>
        <span style="color: #cbd5e1;">|</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 5px; font-weight: 700; font-family: monospace; font-size: 0.7rem;">${config.viewport}</span>
          <span style="color: #94a3b8;">@</span>
          <span style="background: #f0fdf4; color: #166534; padding: 2px 6px; border-radius: 5px; font-weight: 700; font-family: monospace; font-size: 0.7rem;">${config.deviceScaleFactor}x DPR</span>
        </span>
        <span style="color: #cbd5e1;">|</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="font-weight: 600; color: #64748b;">Network:</span>
          <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 5px; font-weight: 600; font-family: monospace; font-size: 0.7rem;">${config.throttlingProfile}</span>
        </span>
        <span style="color: #cbd5e1;">|</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="font-weight: 600; color: #64748b;">CPU:</span>
          <span style="background: ${isMobile ? '#fce7f3' : '#f0fdf4'}; color: ${isMobile ? '#9d174d' : '#166534'}; padding: 2px 6px; border-radius: 5px; font-weight: 700; font-family: monospace; font-size: 0.7rem;">${config.cpuSlowdown}</span>
        </span>
        <span style="color: #cbd5e1;">|</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="font-weight: 600; color: #64748b;">Device:</span>
          <span style="font-weight: 600; color: #334155;">${config.deviceName}</span>
        </span>
        <span style="color: #cbd5e1;">|</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;">
          <span style="background: #ede9fe; color: #5b21b6; padding: 2px 8px; border-radius: 5px; font-weight: 700; font-family: monospace; font-size: 0.7rem;">Lighthouse v${emulationConfig.lighthouseVersion}</span>
          <span style="color: #94a3b8; font-size: 0.65rem; font-style: italic;">(${config.configSource.includes('Default') ? 'Default Config' : 'Custom'})</span>
        </span>
      </div>`;
  }

  const mobileConfigBarHtml = buildEmulationConfigBar(emulationConfig?.mobile);
  const desktopConfigBarHtml = buildEmulationConfigBar(emulationConfig?.desktop);

  const hasPsi = options.psiData && options.psiData.mobile;
  const mobileData = hasPsi ? options.psiData.mobile : localMobileData;
  const desktopData = hasPsi ? options.psiData.desktop : localDesktopData;

  // Determine scores for API and Local
  const getScoreData = (score) => {
    let cls = 'good', textCls = 'good-text', status = 'Passed';
    let desc = 'Your website is performing exceptionally well across Core Web Vitals and key performance metrics. This delivers a fast, stable, and responsive experience for users, which helps improve engagement and supports better search visibility.';
    if (score < 50) {
      cls = 'poor'; textCls = 'danger-text'; status = 'Failed';
      desc = 'Critical performance bottlenecks and visual layout instability were detected across Core Web Vitals. Significant layout shifts or blocking scripts impact real-user experience and Google ranking metrics.';
    } else if (score < 90) {
      cls = 'needs-improvement'; textCls = 'warning-text'; status = 'Needs Improvement';
      desc = 'Your website demonstrates moderate performance across Core Web Vitals, but notable layout stability or responsiveness bottlenecks require optimization to prevent user experience degradation.';
    }
    return { score, cls, textCls, status, desc };
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
    const mobilePassed = mobileData && (
      (mobileData.lcp?.value !== undefined && mobileData.lcp?.value !== null ? mobileData.lcp.value / 1000 <= 2.5 : true) &&
      (mobileData.cls?.value !== undefined && mobileData.cls?.value !== null ? mobileData.cls.value <= 0.1 : true) &&
      (mobileData.tbt?.value !== undefined && mobileData.tbt?.value !== null ? mobileData.tbt.value <= 200 : true)
    );
    const desktopPassed = desktopData && (
      (desktopData.lcp?.value !== undefined && desktopData.lcp?.value !== null ? desktopData.lcp.value / 1000 <= 2.5 : true) &&
      (desktopData.cls?.value !== undefined && desktopData.cls?.value !== null ? desktopData.cls.value <= 0.1 : true) &&
      (desktopData.tbt?.value !== undefined && desktopData.tbt?.value !== null ? desktopData.tbt.value <= 200 : true)
    );

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

  /**
   * Helper to render the automatic AI Solution section or its state in each issue card
   */
  function renderAiSectionHtml(issue, index) {
    if (issue.aiAdvice && typeof issue.aiAdvice === 'object') {
      const adv = issue.aiAdvice;
      const confClass = String(adv.confidence || 'medium').toLowerCase();

      let whyItHelpsHtml = '';
      if (adv.whyItHelps) {
        whyItHelpsHtml = `
          <div class="ai-field-block ai-why-callout">
            <div class="ai-field-label">Why This Solution Improves CWV</div>
            <div class="ai-field-value">${escapeHtml(adv.whyItHelps)}</div>
          </div>
        `;
      }

      let affectedFilesHtml = '';
      if (Array.isArray(adv.affectedFiles) && adv.affectedFiles.length > 0) {
        const fileRows = adv.affectedFiles.map(af => {
          if (typeof af === 'string') {
            return `<code>${escapeHtml(af)}</code>`;
          }
          if (af && typeof af === 'object') {
            const filePath = af.file || af.filePath || af.path || '';
            const lineStr = (af.line !== undefined && af.line !== null && af.line !== '-') ? `:${escapeHtml(af.line)}` : '';
            return `<code>${escapeHtml(filePath)}${lineStr}</code>`;
          }
          return `<code>${escapeHtml(af)}</code>`;
        }).join(', ');
        affectedFilesHtml = `
          <div class="ai-field-block">
            <div class="ai-field-label">Affected Source Locations</div>
            <div class="ai-field-value">${fileRows}</div>
          </div>
        `;
      }

      let proposedChangesHtml = '';
      if (adv.proposedChanges) {
        proposedChangesHtml = `
          <div class="ai-field-block">
            <div class="ai-field-label">Proposed Code Adjustments (Read-Only Preview)</div>
            <div class="ai-code-block">${escapeHtml(adv.proposedChanges)}</div>
          </div>
        `;
      }

      const recsList = Array.isArray(adv.recommendations) ? adv.recommendations : [String(adv.recommendations || '')];
      const limitationsList = Array.isArray(adv.limitations) ? adv.limitations : [String(adv.limitations || '')];

      return `
        <div class="ai-advisor-container" id="ai-advisor-container-${index}">
          <div class="ai-solution-card">
            <div class="ai-card-top">
              <div class="ai-badge-group">
                <span class="ai-source-badge">✨ Copilot AI Solution</span>
                <span class="ai-conf-badge ${escapeHtml(confClass)}">${escapeHtml(adv.confidence || 'MEDIUM')} Confidence</span>
              </div>
              ${adv.confidenceReason ? `<div class="ai-conf-reason">${escapeHtml(adv.confidenceReason)}</div>` : ''}
            </div>

            <div class="ai-field-block">
              <div class="ai-field-label">Diagnosis & UX Impact</div>
              <div class="ai-field-value">${escapeHtml(adv.explanation)}</div>
            </div>

            <div class="ai-field-block">
              <div class="ai-field-label">Likely Root Cause</div>
              <div class="ai-field-value">${escapeHtml(adv.rootCause)}</div>
            </div>

            <div class="ai-field-block">
              <div class="ai-field-label">Recommended Action Steps</div>
              <ul class="ai-list">
                ${recsList.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </div>

            ${whyItHelpsHtml}
            ${adv.verificationProcedure ? `
            <div class="ai-field-block">
              <div class="ai-field-label">Verification Procedure</div>
              <div class="ai-field-value">${escapeHtml(adv.verificationProcedure)}</div>
            </div>` : ''}
            ${Array.isArray(adv.alternativeHypotheses) && adv.alternativeHypotheses.length > 0 ? `
            <div class="ai-field-block">
              <div class="ai-field-label">Alternative Hypotheses</div>
              <ul class="ai-list" style="font-size: 0.82rem;">
                ${adv.alternativeHypotheses.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            </div>` : ''}
            ${affectedFilesHtml}
            ${proposedChangesHtml}

            <div class="ai-field-block" style="margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
              <div class="ai-field-label" style="color: var(--text-muted);">Limitations & Hypotheses</div>
              <ul class="ai-list" style="color: var(--text-muted); font-size: 0.78rem;">
                ${limitationsList.map(l => `<li>${escapeHtml(l)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (issue.aiStatus === 'omitted_limit') {
      return `
        <div class="ai-advisor-container ai-limit-container" id="ai-advisor-container-${index}">
          <div class="ai-limit-bar">
            <span>Deterministic recommendation active. Copilot advice auto-generated for top priority findings.</span>
            <button class="ai-retry-btn" type="button" onclick="retryAiAdvice(event, ${index})">Analyze with Copilot</button>
          </div>
          <div id="ai-advice-result-${index}" class="ai-advice-result-wrapper" style="display: none;"></div>
        </div>
      `;
    }

    if (issue.aiStatus === 'error') {
      const errorTag = issue.aiErrorDetails?.type ? `[${escapeHtml(issue.aiErrorDetails.type)}] ` : '';
      return `
        <div class="ai-advisor-container ai-error-container" id="ai-advisor-container-${index}">
          <div class="ai-error-box" style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: #ef4444;">
              ⚠️ Copilot analysis encountered an issue: ${errorTag}${escapeHtml(issue.aiError || 'Service temporarily unavailable')}
            </span>
            <button class="ai-retry-btn" type="button" onclick="retryAiAdvice(event, ${index})">Retry</button>
          </div>
          <div id="ai-advice-result-${index}" class="ai-advice-result-wrapper" style="display: none;"></div>
        </div>
      `;
    }

    // Default / Pending auto-enrichment state on page load
    return `
      <div class="ai-advisor-container" id="ai-advisor-container-${index}">
        <div id="ai-pending-${index}" class="ai-loading-box">
          <div class="ai-spinner"></div>
          <div>
            <strong>✨ Copilot AI Advisor analyzing finding...</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Synthesizing deterministic evidence, call chains, and layout metrics</div>
          </div>
        </div>
        <div id="ai-advice-result-${index}" class="ai-advice-result-wrapper" style="display: none;"></div>
      </div>
    `;
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

      let deviceVal = issue.device;
      if (!deviceVal && issue.file) {
        if (issue.file.includes('Mobile')) deviceVal = 'Mobile';
        else if (issue.file.includes('Desktop')) deviceVal = 'Desktop';
      }

      let deviceAttr = 'all';
      let deviceBadge = '';
      if (deviceVal) {
        const dLower = String(deviceVal).toLowerCase();
        if (dLower.includes('mobile')) {
          deviceAttr = 'mobile';
          deviceBadge = `<span class="card-badge device-badge mobile">MOBILE</span>`;
        } else if (dLower.includes('desktop')) {
          deviceAttr = 'desktop';
          deviceBadge = `<span class="card-badge device-badge desktop">DESKTOP</span>`;
        } else if (dLower.includes('diagnostic') || dLower.includes('observer')) {
          deviceAttr = 'diagnostic';
          deviceBadge = `<span class="card-badge device-badge diagnostic">DIAGNOSTIC</span>`;
        } else {
          deviceAttr = dLower;
          deviceBadge = `<span class="card-badge device-badge">${escapeHtml(String(deviceVal).toUpperCase())}</span>`;
        }
      }
      
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
        affectedSummary = isLighthouse ? (deviceVal ? `Runtime Audit (${deviceVal})` : 'Runtime Audit') : path.basename(issue.file);
        const lineStr = (issue.line !== null && issue.line !== undefined && issue.line !== '-') ? `:${issue.line}` : '';
        if (!isLighthouse) {
          filesListHtml = `
            <div class="details-files">
              <div class="details-files-title">Affected File:</div>
              <div class="files-list">
                <div class="file-row">
                  <span class="file-path">${escapeHtml(issue.file)}</span>
                  <span class="file-line">${escapeHtml(lineStr)}</span>
                </div>
                ${(issue.isParentContainer && issue.containerLine) ? `
                <div class="parent-container-context" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  Candidate Parent Container: <code>&lt;${escapeHtml(issue.containerTag || 'container')}${issue.containerId ? '#' + escapeHtml(issue.containerId) : ''}&gt;</code> at line ${issue.containerLine}${issue.containerColumn ? ':' + issue.containerColumn : ''} (child line unresolvable without build source maps)
                </div>` : ''}
                ${issue.isSingleLine ? `
                <div class="single-line-context" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  Note: Template file is minified / on a single line; line-level attribution unavailable.
                </div>` : ''}
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
            ${(issue.isParentContainer || issue.source?.isParentContainer) ? `
            <div style="font-size: 0.82rem; margin-bottom: 4px; color: #8b5cf6;">
              <strong>Attribution Grounding:</strong> Matched candidate parent container <code>&lt;${escapeHtml(issue.containerTag || issue.source?.containerTag || 'container')}${issue.containerId || issue.source?.containerId ? '#' + escapeHtml(issue.containerId || issue.source?.containerId) : ''}&gt;</code>${(issue.containerLine || issue.source?.containerLine) ? ` at line ${issue.containerLine || issue.source?.containerLine}` : ''} in raw template (runtime child element line is unresolvable directly without build source maps).
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
        <div class="issue-card" data-severity="${escapeHtml(issue.severity)}" data-category="${escapeHtml(issue.cwv)}" data-device="${escapeHtml(deviceAttr)}">
          <div class="issue-card-header" onclick="toggleAccordion(this)">
            <div class="issue-card-left">
              <span class="issue-idx">#${idxStr}</span>
              <div class="issue-badges">
                <span class="card-badge ${severityClass}">${escapeHtml(issue.severity)}</span>
                <span class="card-badge cat">${escapeHtml(issue.cwv)}</span>
                ${deviceBadge}
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
            ${renderAiSectionHtml(issue, index)}
          </div>
        </div>
      `;
    }).join('\n');
  }

  // Replace all general placeholders
  const projectName = options.clientName || path.basename(options.projectPath);
  let gitBranch = options.gitBranch;
  if (!gitBranch || gitBranch === 'N/A') {
    try {
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: options.projectPath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
    } catch (e) {
      try {
        gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
      } catch (err2) {
        gitBranch = 'main';
      }
    }
  }
  if (!gitBranch) gitBranch = 'main';

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const historyPoints = extractCruxHistoryPoints(options.cruxHistoryData);
  let cruxHistogramsHtml = '';
  if (historyPoints && historyPoints.length >= 2) {
    const historyRecord = options.cruxHistoryData.record || options.cruxHistoryData;
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
          <p>LCP, INP, and CLS scores over the previous ${historyPoints.length} collection periods.</p>
        </div>
        <div class="crux-subcharts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 16px; margin-top: 16px;">
          <!-- Card 1: LCP -->
          <div class="crux-trend-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>
                  Largest Contentful Paint (LCP)
                </div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Good: ≤ 2.5s | Needs Imp: ≤ 4.0s</div>
              </div>
              <div id="latest-lcp-badge" style="font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: monospace;"></div>
            </div>
            <div style="position: relative; height: 210px; width: 100%;">
              <canvas id="cruxLcpChart"></canvas>
            </div>
          </div>

          <!-- Card 2: INP -->
          <div class="crux-trend-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                  Interaction to Next Paint (INP)
                </div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Good: ≤ 200ms | Needs Imp: ≤ 500ms</div>
              </div>
              <div id="latest-inp-badge" style="font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-family: monospace;"></div>
            </div>
            <div style="position: relative; height: 210px; width: 100%;">
              <canvas id="cruxInpChart"></canvas>
            </div>
          </div>

          <!-- Card 3: CLS -->
          <div class="crux-trend-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <div style="font-size: 0.88rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                  <span style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; display: inline-block;"></span>
                  Cumulative Layout Shift (CLS)
                </div>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Good: ≤ 0.10 | Needs Imp: ≤ 0.25</div>
              </div>
              <div id="latest-cls-badge" style="font-size: 0.8rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: #fffbeb; color: #b45309; font-family: monospace;"></div>
            </div>
            <div style="position: relative; height: 210px; width: 100%;">
              <canvas id="cruxClsChart"></canvas>
            </div>
          </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script>
          const initSubCharts = () => {
            if (typeof Chart === 'undefined') {
              setTimeout(initSubCharts, 50);
              return;
            }
            const historyData = ${historyJson};
            if (!historyData.collectionPeriods || !historyData.metrics) return;
            
            let labels = [];
            let lcpData = [];
            let clsData = [];
            let inpData = [];
            
            const lcpRaw = historyData.metrics.largest_contentful_paint?.percentilesTimeseries?.p75s || [];
            const clsRaw = historyData.metrics.cumulative_layout_shift?.percentilesTimeseries?.p75s || [];
            const inpRaw = historyData.metrics.interaction_to_next_paint?.percentilesTimeseries?.p75s || [];
            
            historyData.collectionPeriods.forEach((p, idx) => {
              const lcpVal = lcpRaw[idx];
              const clsVal = clsRaw[idx];
              const inpVal = inpRaw[idx];
              
              if ((lcpVal !== null && lcpVal !== undefined && lcpVal !== 'NaN') || 
                  (clsVal !== null && clsVal !== undefined && clsVal !== 'NaN') ||
                  (inpVal !== null && inpVal !== undefined && inpVal !== 'NaN')) {
                labels.push(p.lastDate.year + '-' + String(p.lastDate.month).padStart(2, '0') + '-' + String(p.lastDate.day).padStart(2, '0'));
                lcpData.push(lcpVal !== null && !isNaN(lcpVal) ? Number(lcpVal) : null);
                clsData.push(clsVal !== null && !isNaN(clsVal) ? Number(clsVal) : null);
                inpData.push(inpVal !== null && !isNaN(inpVal) ? Number(inpVal) : null);
              }
            });

            // Populate Latest Status Badges
            const validLcp = lcpData.filter(v => v !== null);
            const validInp = inpData.filter(v => v !== null);
            const validCls = clsData.filter(v => v !== null);

            const latestLcp = validLcp.length > 0 ? validLcp[validLcp.length - 1] : null;
            const latestInp = validInp.length > 0 ? validInp[validInp.length - 1] : null;
            const latestCls = validCls.length > 0 ? validCls[validCls.length - 1] : null;

            const lcpBadge = document.getElementById('latest-lcp-badge');
            if (lcpBadge && latestLcp !== null) {
              lcpBadge.textContent = (latestLcp / 1000).toFixed(2) + 's (' + latestLcp.toLocaleString() + ' ms)';
              lcpBadge.style.color = latestLcp <= 2500 ? '#166534' : latestLcp <= 4000 ? '#b45309' : '#991b1b';
              lcpBadge.style.background = latestLcp <= 2500 ? '#f0fdf4' : latestLcp <= 4000 ? '#fffbeb' : '#fef2f2';
            }

            const inpBadge = document.getElementById('latest-inp-badge');
            if (inpBadge && latestInp !== null) {
              inpBadge.textContent = latestInp + ' ms';
              inpBadge.style.color = latestInp <= 200 ? '#166534' : latestInp <= 500 ? '#b45309' : '#991b1b';
              inpBadge.style.background = latestInp <= 200 ? '#f0fdf4' : latestInp <= 500 ? '#fffbeb' : '#fef2f2';
            }

            const clsBadge = document.getElementById('latest-cls-badge');
            if (clsBadge && latestCls !== null) {
              clsBadge.textContent = latestCls.toFixed(3);
              clsBadge.style.color = latestCls <= 0.10 ? '#166534' : latestCls <= 0.25 ? '#b45309' : '#991b1b';
              clsBadge.style.background = latestCls <= 0.10 ? '#f0fdf4' : latestCls <= 0.25 ? '#fffbeb' : '#fef2f2';
            }

            const baseOptions = (yTitle, yMax, stepSize, unitSuffix = '') => ({
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    font: { size: 10 },
                    color: '#64748b'
                  }
                },
                tooltip: {
                  backgroundColor: '#0f172a',
                  titleColor: '#94a3b8',
                  bodyColor: '#ffffff',
                  padding: 8,
                  cornerRadius: 6,
                  callbacks: {
                    label: (context) => context.dataset.label + ': ' + context.parsed.y + unitSuffix
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { size: 9 }, color: '#94a3b8', maxRotation: 45 }
                },
                y: {
                  beginAtZero: true,
                  suggestedMax: yMax,
                  ticks: {
                    font: { size: 9 },
                    color: '#94a3b8',
                    ...(stepSize ? { stepSize } : {})
                  },
                  title: { display: true, text: yTitle, font: { size: 9 }, color: '#64748b' },
                  grid: { color: 'rgba(226, 232, 240, 0.6)' }
                }
              }
            });

            // 1. LCP Chart
            const lcpEl = document.getElementById('cruxLcpChart');
            if (lcpEl) {
              const maxLcp = validLcp.length > 0 ? Math.max(...validLcp) : 2500;
              const yMax = Math.max(3000, Math.ceil((maxLcp * 1.15) / 500) * 500);
              new Chart(lcpEl.getContext('2d'), {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'LCP p75 (ms)',
                      data: lcpData,
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.08)',
                      tension: 0.25,
                      fill: true,
                      pointRadius: 4,
                      pointBackgroundColor: '#3b82f6'
                    },
                    {
                      label: 'Good Threshold (2500ms)',
                      data: labels.map(() => 2500),
                      borderColor: '#10b981',
                      borderDash: [5, 5],
                      borderWidth: 1.5,
                      pointRadius: 0,
                      fill: false
                    }
                  ]
                },
                options: baseOptions('ms', yMax, null, ' ms')
              });
            }

            // 2. INP Chart
            const inpEl = document.getElementById('cruxInpChart');
            if (inpEl) {
              const maxInp = validInp.length > 0 ? Math.max(...validInp) : 200;
              const yMax = Math.max(300, Math.ceil((maxInp * 1.3) / 50) * 50);
              new Chart(inpEl.getContext('2d'), {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'INP p75 (ms)',
                      data: inpData,
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      tension: 0.25,
                      fill: true,
                      pointRadius: 4,
                      pointBackgroundColor: '#10b981'
                    },
                    {
                      label: 'Good Threshold (200ms)',
                      data: labels.map(() => 200),
                      borderColor: '#10b981',
                      borderDash: [5, 5],
                      borderWidth: 1.5,
                      pointRadius: 0,
                      fill: false
                    }
                  ]
                },
                options: baseOptions('ms', yMax, null, ' ms')
              });
            }

            // 3. CLS Chart
            const clsEl = document.getElementById('cruxClsChart');
            if (clsEl) {
              const maxCls = validCls.length > 0 ? Math.max(...validCls) : 0.10;
              const yMax = Math.max(0.15, Math.ceil((maxCls * 1.35) * 20) / 20);
              new Chart(clsEl.getContext('2d'), {
                type: 'line',
                data: {
                  labels: labels,
                  datasets: [
                    {
                      label: 'CLS p75',
                      data: clsData,
                      borderColor: '#f59e0b',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      tension: 0.25,
                      fill: true,
                      pointRadius: 4,
                      pointBackgroundColor: '#f59e0b'
                    },
                    {
                      label: 'Good Threshold (0.10)',
                      data: labels.map(() => 0.10),
                      borderColor: '#10b981',
                      borderDash: [5, 5],
                      borderWidth: 1.5,
                      pointRadius: 0,
                      fill: false
                    }
                  ]
                },
                options: baseOptions('Score', yMax, 0.05, '')
              });
            }
          };
          initSubCharts();
        </script>
      </div>
    `;
  } else {
    cruxHistogramsHtml = `
      <div class="crux-raw-section" style="margin-top: 24px;">
        <div class="crux-raw-header" style="margin-bottom: 0;">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            CrUX Historical Trend (Past 6 Months)
          </h3>
          <p>LCP, INP, and CLS scores over previous 28-day collection periods.</p>
          <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 18px 20px; margin-top: 14px; display: flex; align-items: flex-start; gap: 14px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem; margin-bottom: 4px;">
                Historical trend data is not available for the current URL
              </div>
              <div style="color: #64748b; font-size: 0.85rem; line-height: 1.5;">
                The Chrome User Experience Report (CrUX) requires a minimum threshold of real-user Chrome pageviews over multiple 28-day aggregation periods to publish historical trends. Test, staging, or lower-traffic URLs do not have historical data in Google CrUX.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  templateHtml = templateHtml
    .replace(/{{CRUX_HISTOGRAMS_SECTION}}/g, cruxHistogramsHtml)
    .replace(/{{CLIENT_NAME}}/g, options.clientName || 'Default Project')
    .replace(/{{PROJECT_PATH}}/g, projectName)
    .replace(/{{GIT_BRANCH}}/g, escapeHtml(gitBranch))
    .replace(/{{AUDIT_DATE}}/g, formattedDate)
    .replace(/{{AUDIT_URL}}/g, options.url || 'No URL specified (Static scan only)')
    .replace(/{{REMOTE_DEPLOYMENT_META}}/g, options.remoteDeployment && options.remoteDeployment.deploymentId ? ` <span class="meta-sep">|</span> <strong>Live Deployment:</strong> <span class="meta-val" style="background: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-family: monospace;">Build #${escapeHtml(options.remoteDeployment.deploymentId)}${options.remoteDeployment.commit ? ` (${escapeHtml(options.remoteDeployment.commit.substring(0, 7))})` : ''}</span>` : '')
    .replace(/{{ENGINEER_NAME}}/g, escapeHtml(options.engineer || 'siripireddy Giri'))
    .replace(/{{SUMMARY_HIGH}}/g, compiledResult.summary.high)
    .replace(/{{SUMMARY_MEDIUM}}/g, compiledResult.summary.medium)
    .replace(/{{SUMMARY_LOW}}/g, compiledResult.summary.low)
    .replace(/{{MOBILE_EMULATION_CONFIG_BAR}}/g, mobileConfigBarHtml)
    .replace(/{{DESKTOP_EMULATION_CONFIG_BAR}}/g, desktopConfigBarHtml)
    
     // MOBILE values
    .replace(/{{MOBILE_MAIN_SCORE}}/g, mobileLocScore.score)
    .replace(/{{MOBILE_SCORE_CLASS}}/g, mobileLocScore.cls)
    .replace(/{{MOBILE_SCORE_TEXT_CLASS}}/g, mobileLocScore.textCls)
    .replace(/{{MOBILE_SCORE_STATUS}}/g, mobileLocScore.status)
    .replace(/{{MOBILE_SCORE_DESC}}/g, escapeHtml(mobileLocScore.desc))

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
    .replace(/{{DESKTOP_MAIN_SCORE}}/g, desktopLocScore.score)
    .replace(/{{DESKTOP_SCORE_CLASS}}/g, desktopLocScore.cls)
    .replace(/{{DESKTOP_SCORE_TEXT_CLASS}}/g, desktopLocScore.textCls)
    .replace(/{{DESKTOP_SCORE_STATUS}}/g, desktopLocScore.status)
    .replace(/{{DESKTOP_SCORE_DESC}}/g, escapeHtml(desktopLocScore.desc))

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
    .replace(/<!-- MOBILE_METRICS_GRID -->/g, buildMetricGridHtml(mLcp, mCls, mTbt, false) + buildMetricGridHtml(localMLcp, localMCls, localMTbt, true, gitBranch))
    .replace(/<!-- DESKTOP_METRICS_GRID -->/g, buildMetricGridHtml(dLcp, dCls, dTbt, false) + buildMetricGridHtml(localDLcp, localDCls, localDTbt, true, gitBranch))
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
  const jsonPath = path.join(outputDir, `report-${timestamp}.json`);

  const isInitialAiComplete = Boolean(
    compiledResult.aiAdvisor &&
    (compiledResult.aiAdvisor.status === 'completed' || compiledResult.aiAdvisor.status === 'partial') &&
    Number(compiledResult.aiAdvisor.analyzedCount) > 0
  );

  const pdfStatus = {
    generated: true,
    aiEnriched: isInitialAiComplete,
    synchronized: true,
    notice: isInitialAiComplete
      ? 'PDF generated synchronously with initial AI advice.'
      : 'PDF reflects initial audit baseline. Subsequent background advice is recorded in companion JSON and interactive HTML.'
  };

  const clientMetaScript = `
  <script>
    window.__AUDIT_ISSUES__ = ${JSON.stringify(compiledResult.issues)};
    window.__AI_ADVISOR_STATUS__ = ${JSON.stringify({ ...(compiledResult.aiAdvisor || { status: 'completed' }), pdfSynchronized: isInitialAiComplete })};
    window.__PDF_STATUS__ = ${JSON.stringify(pdfStatus)};
    window.__REPORT_META__ = {
      project: ${JSON.stringify(path.basename(options.projectPath))},
      reportFile: "report-${timestamp}.json",
      timestamp: ${timestamp}
    };
  </script>
  `;
  const finalHtml = templateHtml.replace('</body>', `${clientMetaScript}\n</body>`);

  fs.writeFileSync(htmlPath, finalHtml);
  fs.writeFileSync(jsonPath, JSON.stringify({
    timestamp,
    project: path.basename(options.projectPath),
    clientName: options.clientName || path.basename(options.projectPath),
    url: options.url,
    scores: compiledResult.scores,
    issues: compiledResult.issues,
    summary: compiledResult.summary,
    aiAdvisor: {
      ...(compiledResult.aiAdvisor || { status: 'completed' }),
      pdfSynchronized: isInitialAiComplete
    },
    pdfStatus
  }, null, 2));
  console.log(`\n📄 HTML report written to: ${htmlPath}`);

  // Render to PDF using Puppeteer
  try {
    console.log('Generating redesigned 3-page executive PDF report...');
    
    // Compute failing / warning metrics dynamically
    const labWarnings = [];
    if (localMLcp.statusLabel !== 'Good') labWarnings.push('Mobile LCP');
    if (localMCls.statusLabel !== 'Good') labWarnings.push('Mobile CLS');
    if (localMTbt.statusLabel !== 'Good') labWarnings.push('Mobile TBT');
    if (localDLcp.statusLabel !== 'Good') labWarnings.push('Desktop LCP');
    if (localDCls.statusLabel !== 'Good') labWarnings.push('Desktop CLS');
    if (localDTbt.statusLabel !== 'Good') labWarnings.push('Desktop TBT');

    const hasRealCrux = mobileCruxLcp.valueDisplay !== 'N/A' || desktopCruxLcp.valueDisplay !== 'N/A';
    const fieldPassed = hasRealCrux && (
      (mobileCruxLcp.statusLabel === 'Good' || mobileCruxLcp.valueDisplay === 'N/A') &&
      (mobileCruxCls.statusLabel === 'Good' || mobileCruxCls.valueDisplay === 'N/A') &&
      (desktopCruxLcp.statusLabel === 'Good' || desktopCruxLcp.valueDisplay === 'N/A') &&
      (desktopCruxCls.statusLabel === 'Good' || desktopCruxCls.valueDisplay === 'N/A')
    );

    let assessmentObj;
    if (labWarnings.length === 0 && mobileLocScore.score >= 90 && desktopLocScore.score >= 90) {
      assessmentObj = {
        status: 'Passed',
        color: '#10b981',
        bgColor: '#ecfdf5',
        borderColor: '#d1fae5',
        borderLeftColor: '#10b981',
        icon: '✓',
        text: 'All Core Web Vitals parameters on both Mobile and Desktop meet Google recommended performance standards.'
      };
    } else if (labWarnings.length >= 3 || mobileLocScore.score < 50 || desktopLocScore.score < 50) {
      assessmentObj = {
        status: 'Needs Immediate Attention',
        color: '#ef4444',
        bgColor: '#fef2f2',
        borderColor: '#fee2e2',
        borderLeftColor: '#ef4444',
        icon: '✕',
        text: `Multiple Core Web Vitals parameters require optimization. Scores: Mobile ${mobileLocScore.score}/100, Desktop ${desktopLocScore.score}/100. Warnings detected on: ${labWarnings.join(', ') || 'overall metrics'}.`
      };
    } else {
      const fieldNote = hasRealCrux
        ? (fieldPassed ? 'Real-user field metrics pass on measured devices.' : 'Field data shows real-user variance.')
        : 'Lab audit baseline evaluated.';
      assessmentObj = {
        status: 'Needs Improvement',
        color: '#f59e0b',
        bgColor: '#fffbeb',
        borderColor: '#fef3c7',
        borderLeftColor: '#f59e0b',
        icon: '!',
        text: `${fieldNote} Lighthouse lab scores (${mobileLocScore.score} / ${desktopLocScore.score})${labWarnings.length > 0 ? ` with warnings on ${labWarnings.join(', ')} outside the Good range.` : '.'}`
      };
    }

    // Generate dynamic findings based on actual lab metrics and code issues
    const dynamicFindings = [];
    
    // LCP finding
    if (localMLcp.statusLabel !== 'Good') {
      dynamicFindings.push({
        color: localMLcp.statusLabel === 'Poor' ? '#ef4444' : '#f59e0b',
        cls: localMLcp.statusLabel === 'Poor' ? 'poor' : 'warn',
        title: `Mobile lab LCP is ${localMLcp.valueDisplay}`,
        desc: 'Preload critical hero images, remove render-blocking CSS and JS, and improve TTFB and server response time.'
      });
    } else {
      dynamicFindings.push({
        color: '#10b981',
        cls: 'pass',
        title: `Mobile lab LCP is ${localMLcp.valueDisplay}`,
        desc: 'Initial viewport content loads quickly and meets Google recommended loading thresholds.'
      });
    }

    // TBT finding
    if (localMTbt.statusLabel !== 'Good') {
      dynamicFindings.push({
        color: localMTbt.statusLabel === 'Poor' ? '#ef4444' : '#f59e0b',
        cls: localMTbt.statusLabel === 'Poor' ? 'poor' : 'warn',
        title: `Mobile lab TBT is ${localMTbt.valueDisplay}`,
        desc: 'Break up JavaScript tasks over 50 ms, defer non-critical third-party analytics and widgets, and move CPU-heavy work to Web Workers.'
      });
    } else {
      dynamicFindings.push({
        color: '#10b981',
        cls: 'pass',
        title: `Mobile lab TBT is ${localMTbt.valueDisplay}`,
        desc: 'Main thread responsiveness is healthy with low task execution delays.'
      });
    }

    // CLS finding
    if (localMCls.statusLabel !== 'Good') {
      dynamicFindings.push({
        color: localMCls.statusLabel === 'Poor' ? '#ef4444' : '#f59e0b',
        cls: localMCls.statusLabel === 'Poor' ? 'poor' : 'warn',
        title: `Mobile lab CLS is ${localMCls.valueDisplay}`,
        desc: `Layout instability detected on branch ${gitBranch || 'main'}. Ensure explicit dimensions on images and reserve ad container space.`
      });
    } else {
      dynamicFindings.push({
        color: '#10b981',
        cls: 'pass',
        title: `Mobile lab CLS is ${localMCls.valueDisplay}`,
        desc: `Layout is stable on branch ${gitBranch || 'main'}, with minimal unexpected shifting.`
      });
    }

    // Fourth finding: Field vs Static/Code findings
    if (hasRealCrux) {
      if (fieldPassed) {
        dynamicFindings.push({
          color: '#10b981',
          cls: 'pass',
          title: 'Field CrUX data confirms good real-world experience',
          desc: 'Production Chrome user experience percentiles meet Google recommended Core Web Vitals thresholds.'
        });
      } else {
        dynamicFindings.push({
          color: '#f59e0b',
          cls: 'warn',
          title: 'Field data shows room to improve',
          desc: 'The 75th percentile of real visitors experiences degraded performance on one or more metrics.'
        });
      }
    } else if (compiledResult.issues && compiledResult.issues.length > 0) {
      const highIssues = compiledResult.issues.filter(i => (i.severity || '').toLowerCase() === 'high').length;
      dynamicFindings.push({
        color: highIssues > 0 ? '#ef4444' : '#0284c7',
        cls: highIssues > 0 ? 'poor' : 'warn',
        title: `Static & Runtime Audit Flagged ${compiledResult.issues.length} Code/DOM Pattern(s)`,
        desc: `${highIssues} high-severity issue(s) detected. Review the detailed findings table and AI code fix recommendations below.`
      });
    } else {
      dynamicFindings.push({
        color: '#10b981',
        cls: 'pass',
        title: 'Clean Performance Architecture',
        desc: 'No anti-patterns or blocking anomalies detected across audited template files.'
      });
    }

    const toStatusPill = (detail, isField = false) => {
      if (detail.statusLabel === 'Good') return 'PASS';
      if (isField && detail.valueDisplay === 'N/A') return 'N/A';
      return 'WARN';
    };

    const makeMetricRow = (device, metric, crux, local, thresh) => ({
      device,
      metric,
      fVal: crux.valueDisplay,
      fStat: toStatusPill(crux, true),
      lVal: local.valueDisplay,
      lStat: toStatusPill(local, false),
      thresh
    });

    const pdfFormattedDate = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date());

    const redesignedData = {
      clientName: options.clientName || projectName,
      gitBranch: gitBranch,
      url: options.url || '',
      date: pdfFormattedDate,
      engineer: options.engineer || 'siripireddy Giri',
      assessment: assessmentObj,
      mobile: {
        score: mobileLocScore.score,
        statusLabel: mobileLocScore.status,
        statusColor: mobileLocScore.score >= 90 ? '#10b981' : mobileLocScore.score >= 50 ? '#f59e0b' : '#ef4444',
        desc: `Lab Core Web Vitals audit under simulated mobile conditions${gitBranch ? ` for branch: ${gitBranch}` : ''}.`,
        lcp: { val: localMLcp.valueDisplay, pass: localMLcp.statusLabel === 'Good', pct: localMLcp.percent, limit: 'Good ≤ 2.5 s' },
        cls: { val: localMCls.valueDisplay, pass: localMCls.statusLabel === 'Good', pct: localMCls.percent, limit: 'Good ≤ 0.1' },
        tbt: { val: localMTbt.valueDisplay, pass: localMTbt.statusLabel === 'Good', pct: localMTbt.percent, limit: 'Good ≤ 200 ms' }
      },
      desktop: {
        score: desktopLocScore.score,
        statusLabel: desktopLocScore.status,
        statusColor: desktopLocScore.score >= 90 ? '#10b981' : desktopLocScore.score >= 50 ? '#f59e0b' : '#ef4444',
        desc: `Lab Core Web Vitals audit under desktop conditions${gitBranch ? ` for branch: ${gitBranch}` : ''}.`,
        lcp: { val: localDLcp.valueDisplay, pass: localDLcp.statusLabel === 'Good', pct: localDLcp.percent, limit: 'Good ≤ 2.5 s' },
        cls: { val: localDCls.valueDisplay, pass: localDCls.statusLabel === 'Good', pct: localDCls.percent, limit: 'Good ≤ 0.1' },
        tbt: { val: localDTbt.valueDisplay, pass: localDTbt.statusLabel === 'Good', pct: localDTbt.percent, limit: 'Good ≤ 200 ms' }
      },
      metricsDetail: [
        makeMetricRow('MOBILE', 'Largest Contentful Paint (LCP)', mobileCruxLcp, localMLcp, '≤ 2.5 s'),
        makeMetricRow('DESKTOP', 'Largest Contentful Paint (LCP)', desktopCruxLcp, localDLcp, '≤ 2.5 s'),
        makeMetricRow('MOBILE', `Cumulative Layout Shift (CLS)${gitBranch ? ` [${gitBranch}]` : ''}`, mobileCruxCls, localMCls, '≤ 0.1'),
        makeMetricRow('DESKTOP', `Cumulative Layout Shift (CLS)${gitBranch ? ` [${gitBranch}]` : ''}`, desktopCruxCls, localDCls, '≤ 0.1'),
        makeMetricRow('MOBILE', 'Total Blocking Time (TBT)', mobileCruxTbt, localMTbt, '≤ 200 ms'),
        makeMetricRow('DESKTOP', 'Total Blocking Time (TBT)', desktopCruxTbt, localDTbt, '≤ 200 ms'),
        makeMetricRow('MOBILE', 'Interaction to Next Paint (INP)', mobileCruxInp, localMInp, '≤ 200 ms'),
        makeMetricRow('DESKTOP', 'Interaction to Next Paint (INP)', desktopCruxInp, localDInp, '≤ 200 ms'),
      ],
      takeaways: [],
      findings: dynamicFindings,
      cruxHistory: options.cruxHistoryData,
      cruxHistoryPoints: historyPoints,
      emulationConfig: emulationConfig
    };

    const pdfHtml = buildRedesignedPdfHtml(redesignedData);

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(pdfHtml, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '0',
        bottom: '0',
        left: '0',
        right: '0'
      },
      printBackground: true
    });

    await browser.close();
    const pageCount = 3;
    console.log(`🏆 Redesigned ${pageCount}-page PDF report successfully generated: ${pdfPath}`);
  } catch (err) {
    console.warn(`⚠️ Failed to generate PDF report: ${err.message}. HTML report is still available.`);
  }

  return { htmlPath, pdfPath };
}
