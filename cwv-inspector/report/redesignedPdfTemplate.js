/**
 * Redesigned Executive 3-Page PDF Template for CWV Inspector.
 * Strictly adheres to the 3-page A4 visual layout specified in template.html, page-1.png, page-2.png, page-3.png.
 */
import { config } from '../config.js';

export function extractCruxHistoryPoints(cruxHistoryData) {
  if (!cruxHistoryData) return null;
  const historyData = cruxHistoryData.record || cruxHistoryData;
  if (!historyData.collectionPeriods || !historyData.metrics) return null;

  const lcpRaw = historyData.metrics.largest_contentful_paint?.percentilesTimeseries?.p75s || [];
  const clsRaw = historyData.metrics.cumulative_layout_shift?.percentilesTimeseries?.p75s || [];
  const inpRaw = historyData.metrics.interaction_to_next_paint?.percentilesTimeseries?.p75s || [];

  const points = [];
  historyData.collectionPeriods.forEach((p, idx) => {
    const lcpVal = lcpRaw[idx];
    const clsVal = clsRaw[idx];
    const inpVal = inpRaw[idx];

    const hasLcp = lcpVal !== null && lcpVal !== undefined && lcpVal !== 'NaN' && !isNaN(Number(lcpVal));
    const hasCls = clsVal !== null && clsVal !== undefined && clsVal !== 'NaN' && !isNaN(Number(clsVal));
    const hasInp = inpVal !== null && inpVal !== undefined && inpVal !== 'NaN' && !isNaN(Number(inpVal));

    // Keep trend observations complete so the PDF never substitutes demo values
    // for a metric that CrUX did not report in that collection period.
    if (hasLcp && hasCls && hasInp) {
      const year = p.lastDate?.year || '';
      const month = String(p.lastDate?.month || '').padStart(2, '0');
      const day = String(p.lastDate?.day || '').padStart(2, '0');
      points.push({
        dateStr: `${year}-${month}-${day}`,
        lcp: hasLcp ? Number(lcpVal) : null,
        cls: hasCls ? Number(clsVal) : null,
        inp: hasInp ? Number(inpVal) : null,
      });
    }
  });

  return points.length >= 2 ? points : null;
}

export function buildRedesignedPdfHtml(data = {}) {
  const {
    clientName = 'Performance Audit',
    gitBranch = 'N/A',
    url = '',
    date = '',
    engineer = 'Siripireddy Giri',
    assessment = {},
    mobile = {},
    desktop = {},
    metricsDetail = [],
    findings = [],
    cruxHistory = null,
    cruxHistoryPoints = null,
    emulationConfig = null
  } = data;

  // Format header date: e.g. "23 Oct 2026"
  const formattedDate = date && !date.includes(':') 
    ? date 
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date());

  const branchDisplay = gitBranch || 'N/A';
  const projectDisplay = clientName || 'Performance Audit';
  const engineerDisplay = engineer || 'Siripireddy Giri';
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  // Device score & classification logic
  // Score <50: poor, 50-89: warn, >=90: pass
  const hasMobileScore = typeof mobile.score === 'number' && !isNaN(mobile.score);
  const mobileScore = hasMobileScore ? mobile.score : 0;
  const mobileScoreText = hasMobileScore ? String(mobile.score) : '-';
  const mobileScoreDisplay = hasMobileScore ? mobile.score : 0;

  const hasDesktopScore = typeof desktop.score === 'number' && !isNaN(desktop.score);
  const desktopScore = hasDesktopScore ? desktop.score : 0;
  const desktopScoreText = hasDesktopScore ? String(desktop.score) : '-';
  const desktopScoreDisplay = hasDesktopScore ? desktop.score : 0;

  const getScoreClass = (hasScore, s) => (!hasScore ? 'warn' : s < 50 ? 'poor' : s >= 90 ? 'pass' : 'warn');
  const getScoreLabel = (hasScore, s) => (!hasScore ? '-' : s < 50 ? 'Failed' : s >= 90 ? 'Passed' : 'Needs improvement');

  const mobileClass = getScoreClass(hasMobileScore, mobileScore);
  const desktopClass = getScoreClass(hasDesktopScore, desktopScore);

  const mobileLabel = mobile.statusLabel && mobile.statusLabel !== 'Poor' ? mobile.statusLabel : getScoreLabel(hasMobileScore, mobileScore);
  const desktopLabel = desktop.statusLabel || getScoreLabel(hasDesktopScore, desktopScore);

  // Device configs for CrUX
  const mobileConfig = mobile.desc || 'Real-user Chrome mobile traffic (CrUX p75)';
  const desktopConfig = desktop.desc || 'Real-user Chrome desktop traffic (CrUX p75)';

  // Metric status to pill class & label
  const toPill = (valStr, isPass, type) => {
    if (!valStr || valStr === 'N/A' || valStr === '—' || valStr === '-') {
      return { cls: '', label: '' };
    }
    const num = parseFloat(valStr);
    let cls = isPass ? 'pass' : 'warn';
    let label = isPass ? 'Pass' : 'Warn';

    if (type === 'lcp') {
      if (num <= config.thresholds.lcp / 1000) { cls = 'pass'; label = 'Pass'; }
      else if (num > config.thresholds.lcpNeedsImprovement / 1000) { cls = 'poor'; label = 'Poor'; }
      else { cls = 'warn'; label = 'Warn'; }
    } else if (type === 'cls') {
      if (num <= config.thresholds.cls) { cls = 'pass'; label = 'Pass'; }
      else if (num <= config.thresholds.clsNeedsImprovement) { cls = 'warn'; label = 'Warn'; }
      else { cls = 'poor'; label = 'Poor'; }
    } else if (type === 'tbt') {
      if (num <= config.thresholds.tbt) { cls = 'pass'; label = 'Pass'; }
      else { cls = 'warn'; label = 'Warn'; }
    } else if (type === 'inp') {
      if (num <= config.thresholds.inp) { cls = 'pass'; label = 'Pass'; }
      else if (num <= config.thresholds.inpNeedsImprovement) { cls = 'warn'; label = 'Warn'; }
      else { cls = 'poor'; label = 'Poor'; }
    }
    return { cls, label };
  };

  // Mobile CrUX Metrics
  const mLcpVal = mobile.lcp?.val && mobile.lcp?.val !== 'N/A' && mobile.lcp?.val !== '—' ? mobile.lcp.val : '-';
  const mClsVal = mobile.cls?.val && mobile.cls?.val !== 'N/A' && mobile.cls?.val !== '—' ? mobile.cls.val : '-';
  const mInpVal = mobile.inp?.val && mobile.inp?.val !== 'N/A' && mobile.inp?.val !== '—' ? mobile.inp.val : '-';

  const mLcpPill = toPill(mLcpVal, mobile.lcp?.pass, 'lcp');
  const mClsPill = toPill(mClsVal, mobile.cls?.pass, 'cls');
  const mInpPill = toPill(mInpVal, mobile.inp?.pass, 'inp');

  // Desktop CrUX Metrics
  const dLcpVal = desktop.lcp?.val && desktop.lcp?.val !== 'N/A' && desktop.lcp?.val !== '—' ? desktop.lcp.val : '-';
  const dClsVal = desktop.cls?.val && desktop.cls?.val !== 'N/A' && desktop.cls?.val !== '—' ? desktop.cls.val : '-';
  const dInpVal = desktop.inp?.val && desktop.inp?.val !== 'N/A' && desktop.inp?.val !== '—' ? desktop.inp.val : '-';

  const dLcpPill = toPill(dLcpVal, desktop.lcp?.pass, 'lcp');
  const dClsPill = toPill(dClsVal, desktop.cls?.pass, 'cls');
  const dInpPill = toPill(dInpVal, desktop.inp?.pass, 'inp');

  // Verdict Card
  const verdictTitle = assessment.status || 'CrUX Field Data Audit';
  const verdictText = assessment.text || 'Real-user field performance from the Chrome User Experience Report (CrUX).';
  const verdictClass = assessment.color === '#ef4444' ? 'poor' : assessment.color === '#10b981' ? 'pass' : 'warn';
  const verdictIcon = assessment.icon || (verdictClass === 'pass' ? '✓' : verdictClass === 'poor' ? '✕' : '!');

  // Page 2: show real CrUX history only; never fill missing data with sample values.
  const validPoints = (Array.isArray(cruxHistoryPoints) && cruxHistoryPoints.length >= 2
    ? cruxHistoryPoints
    : extractCruxHistoryPoints(cruxHistory)) || [];
  const completePoints = validPoints.filter(point =>
    [point?.lcp, point?.inp, point?.cls].every(value => value !== null && value !== undefined && Number.isFinite(Number(value)))
  );
  const hasCruxHistory = completePoints.length >= 2;
  const pCount = completePoints.length;
  const startPt = completePoints[0] || { dateStr: '', lcp: 0, inp: 0, cls: 0 };
  const endPt = completePoints[pCount - 1] || startPt;

  const formatDateShort = (dStr) => {
    if (!dStr) return '';
    const parts = dStr.split('-');
    if (parts.length < 3) return dStr;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${Number(parts[2])} ${monthNames[Number(parts[1]) - 1] || ''}`.trim();
  };

  const cruxStartDate = formatDateShort(startPt.dateStr);
  const cruxEndDate = formatDateShort(endPt.dateStr);
  const cruxRange = `${cruxStartDate} – ${cruxEndDate}`;

  // Helper to calculate CrUX track values
  // Axis max: LCP 5.5 s, INP 300 ms, CLS 0.15
  // Good thresholds come from config.js.
  // LCP
  const lcpAxisMax = 5.5;
  const lcpStartVal = hasCruxHistory ? (startPt.lcp > 100 ? startPt.lcp / 1000 : startPt.lcp) : 0;
  const lcpEndVal = hasCruxHistory ? (endPt.lcp > 100 ? endPt.lcp / 1000 : endPt.lcp) : 0;
  const lcpThrPct = (((config.thresholds.lcp / 1000) / lcpAxisMax) * 100).toFixed(2);
  const lcpStartPct = (Math.min(lcpStartVal / lcpAxisMax, 1) * 100).toFixed(2);
  const lcpEndPct = (Math.min(lcpEndVal / lcpAxisMax, 1) * 100).toFixed(2);
  const lcpSegLeft = Math.min(Number(lcpStartPct), Number(lcpEndPct)).toFixed(2);
  const lcpSegPct = Math.abs(Number(lcpEndPct) - Number(lcpStartPct)).toFixed(2);
  const lcpMidPct = ((Number(lcpStartPct) + Number(lcpEndPct)) / 2).toFixed(2);

  const lcpPctDiff = Math.round(((lcpEndVal - lcpStartVal) / lcpStartVal) * 100);
  const lcpDelta = `${lcpPctDiff > 0 ? '+' : ''}${lcpPctDiff}%`;
  const lcpStartDisplay = `${lcpStartVal.toFixed(2)} s`;
  const lcpEndDisplay = `${lcpEndVal.toFixed(2)} s`;

  let lcpLabelsHtml = '';
  if (Math.abs(Number(lcpEndPct) - Number(lcpStartPct)) >= 8) {
    lcpLabelsHtml = `
      <div class="lbl" style="left:${lcpEndPct}%">${lcpEndDisplay}</div>
      <div class="lbl" style="left:${lcpStartPct}%;color:var(--mute);font-weight:500">${lcpStartDisplay}</div>
    `;
  } else {
    lcpLabelsHtml = `<div class="lbl" style="left:${lcpMidPct}%">${lcpStartDisplay} → ${lcpEndDisplay}</div>`;
  }

  // INP
  const inpAxisMax = 300;
  const inpStartVal = hasCruxHistory ? startPt.inp : 0;
  const inpEndVal = hasCruxHistory ? endPt.inp : 0;
  const inpThrPct = ((config.thresholds.inp / inpAxisMax) * 100).toFixed(2);
  const inpStartPct = (Math.min(inpStartVal / inpAxisMax, 1) * 100).toFixed(2);
  const inpEndPct = (Math.min(inpEndVal / inpAxisMax, 1) * 100).toFixed(2);
  const inpSegLeft = Math.min(Number(inpStartPct), Number(inpEndPct)).toFixed(2);
  const inpSegPct = Math.abs(Number(inpEndPct) - Number(inpStartPct)).toFixed(2);
  const inpMidPct = ((Number(inpStartPct) + Number(inpEndPct)) / 2).toFixed(2);

  const inpDiff = inpEndVal - inpStartVal;
  const inpDelta = `${inpDiff > 0 ? '+' : ''}${inpDiff} ms`;
  const inpStartDisplay = `${Math.round(inpStartVal)} ms`;
  const inpEndDisplay = `${Math.round(inpEndVal)} ms`;

  let inpLabelsHtml = '';
  if (Math.abs(Number(inpEndPct) - Number(inpStartPct)) >= 8) {
    inpLabelsHtml = `
      <div class="lbl" style="left:${inpEndPct}%">${inpEndDisplay}</div>
      <div class="lbl" style="left:${inpStartPct}%;color:var(--mute);font-weight:500">${inpStartDisplay}</div>
    `;
  } else {
    inpLabelsHtml = `<div class="lbl" style="left:${inpMidPct}%">${inpStartDisplay} → ${inpEndDisplay}</div>`;
  }

  // CLS
  const clsAxisMax = 0.15;
  const clsStartVal = hasCruxHistory ? startPt.cls : 0;
  const clsEndVal = hasCruxHistory ? endPt.cls : 0;
  const clsThrPct = ((config.thresholds.cls / clsAxisMax) * 100).toFixed(2);
  const clsStartPct = (Math.min(clsStartVal / clsAxisMax, 1) * 100).toFixed(2);
  const clsEndPct = (Math.min(clsEndVal / clsAxisMax, 1) * 100).toFixed(2);
  const clsSegLeft = Math.min(Number(clsStartPct), Number(clsEndPct)).toFixed(2);
  const clsSegPct = Math.abs(Number(clsEndPct) - Number(clsStartPct)).toFixed(2);
  const clsMidPct = ((Number(clsStartPct) + Number(clsEndPct)) / 2).toFixed(2);

  const clsDiff = (clsEndVal - clsStartVal).toFixed(3);
  const clsDelta = `${Number(clsDiff) > 0 ? '+' : ''}${clsDiff}`;
  const clsStartDisplay = clsStartVal.toFixed(3);
  const clsEndDisplay = clsEndVal.toFixed(3);

  let clsLabelsHtml = '';
  if (Math.abs(Number(clsEndPct) - Number(clsStartPct)) >= 8) {
    clsLabelsHtml = `
      <div class="lbl" style="left:${clsEndPct}%">${clsEndDisplay}</div>
      <div class="lbl" style="left:${clsStartPct}%;color:var(--mute);font-weight:500">${clsStartDisplay}</div>
    `;
  } else {
    clsLabelsHtml = `<div class="lbl" style="left:${clsMidPct}%">${clsStartDisplay} → ${clsEndDisplay}</div>`;
  }

  // Key takeaways
  const goodLcpSeconds = config.thresholds.lcp / 1000;
  const lcpTakeaway = lcpEndVal < lcpStartVal
    ? `Field LCP improved from ${lcpStartDisplay} to ${lcpEndDisplay} (${lcpDelta}) ${lcpEndVal <= goodLcpSeconds ? `and is within the ${goodLcpSeconds} s target.` : `but is still above the ${goodLcpSeconds} s target.`}`
    : `Field LCP held steady at ${lcpEndDisplay} ${lcpEndVal <= goodLcpSeconds ? `within the ${goodLcpSeconds} s target.` : `above the ${goodLcpSeconds} s target.`}`;

  const inpTakeaway = inpEndVal <= config.thresholds.inp
    ? `Interaction latency held steady, ${inpStartDisplay} to ${inpEndDisplay}, just inside the ${config.thresholds.inp} ms threshold.`
    : `Interaction latency was ${inpEndDisplay}, exceeding the ${config.thresholds.inp} ms threshold.`;

  const clsDirection = clsEndVal <= clsStartVal ? 'improved' : 'increased';
  const clsRange = clsEndVal <= config.thresholds.cls ? 'within' : 'above';
  const clsTakeaway = `Layout shift ${clsDirection} from ${clsStartDisplay} to ${clsEndDisplay} and is ${clsRange} the ${config.thresholds.cls} good threshold.`;

  const fieldTrendsHtml = hasCruxHistory ? `
    <div class="sub">Real-user data (CrUX, 75th percentile) · ${pCount} collection periods, ${cruxRange}</div>
    <div class="trend">
      <div class="hd"><div><span class="chip">LCP</span><span class="nm">Largest Contentful Paint</span></div><div><div class="big">${lcpEndDisplay}</div><div class="delta">${lcpDelta} since ${cruxStartDate}</div></div></div>
      <div class="track" style="--thr:${lcpThrPct}%"><div class="thr"><em>Good ≤ ${config.thresholds.lcp / 1000} s</em></div><div class="seg" style="left:${lcpSegLeft}%;width:${lcpSegPct}%"></div><div class="d s" style="left:${lcpStartPct}%"></div><div class="d e" style="left:${lcpEndPct}%"></div>${lcpLabelsHtml}</div>
    </div>
    <div class="trend">
      <div class="hd"><div><span class="chip">INP</span><span class="nm">Interaction to Next Paint</span></div><div><div class="big">${inpEndDisplay}</div><div class="delta">${inpDelta} since ${cruxStartDate}</div></div></div>
      <div class="track" style="--thr:${inpThrPct}%"><div class="thr"><em>Good ≤ ${config.thresholds.inp} ms</em></div><div class="seg" style="left:${inpSegLeft}%;width:${inpSegPct}%"></div><div class="d s" style="left:${inpStartPct}%"></div><div class="d e" style="left:${inpEndPct}%"></div>${inpLabelsHtml}</div>
    </div>
    <div class="trend">
      <div class="hd"><div><span class="chip">CLS</span><span class="nm">Cumulative Layout Shift</span></div><div><div class="big">${clsEndDisplay}</div><div class="delta">${clsDelta} since ${cruxStartDate}</div></div></div>
      <div class="track" style="--thr:${clsThrPct}%"><div class="thr"><em>Good ≤ ${config.thresholds.cls}</em></div><div class="seg" style="left:${clsSegLeft}%;width:${clsSegPct}%"></div><div class="d s" style="left:${clsStartPct}%"></div><div class="d e" style="left:${clsEndPct}%"></div>${clsLabelsHtml}</div>
    </div>
    <div class="take"><h3>Key takeaways</h3><p><b>LCP</b>${lcpTakeaway}</p><p><b>INP</b>${inpTakeaway}</p><p><b>CLS</b>${clsTakeaway}</p></div>
  ` : '<div class="empty-history">CrUX historical data is unavailable for this URL. No synthetic trend values are shown.</div>';

  // Page 3: Metrics Table Rows
  // CrUX Core Web Vitals: LCP, CLS, INP (Mobile & Desktop)
  let tableRowsHtml = '';
  if (Array.isArray(metricsDetail) && metricsDetail.length > 0) {
    metricsDetail.forEach((row) => {
      const metricShort = row.metric.includes('LCP') ? 'LCP'
        : row.metric.includes('CLS') ? 'CLS'
        : row.metric.includes('TBT') ? 'TBT'
        : 'INP';
      const devName = (row.device || '').toLowerCase().includes('mob') ? 'Mobile' : 'Desktop';

      const fVal = row.fVal || '-';
      const hasValue = fVal !== '-' && fVal !== '—' && fVal !== 'N/A';
      const fStatCls = (row.fStat || '').toLowerCase().includes('pass') ? 'pass' : (row.fStat || '').toLowerCase().includes('fail') ? 'poor' : 'warn';
      const fStatLabel = fStatCls === 'pass' ? 'Pass' : fStatCls === 'poor' ? 'Fail' : 'Warn';
      const fPillHtml = hasValue && row.fStat !== '-' ? `<span class="pill ${fStatCls}">${fStatLabel}</span>` : '';

      tableRowsHtml += `<tr><td class="m">${metricShort}<span>${devName}</span></td><td><b>${fVal}</b>${fPillHtml}</td><td class="t">${row.thresh || ''}</td></tr>\n`;
    });
  } else {
    // Fallback standard 6 rows
    tableRowsHtml = `
      <tr><td class="m">LCP<span>Mobile</span></td><td><b>${mLcpVal}</b>${mLcpPill.label ? `<span class="pill ${mLcpPill.cls}">${mLcpPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.lcp / 1000} s</td></tr>
      <tr><td class="m">LCP<span>Desktop</span></td><td><b>${dLcpVal}</b>${dLcpPill.label ? `<span class="pill ${dLcpPill.cls}">${dLcpPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.lcp / 1000} s</td></tr>
      <tr><td class="m">CLS<span>Mobile</span></td><td><b>${mClsVal}</b>${mClsPill.label ? `<span class="pill ${mClsPill.cls}">${mClsPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.cls}</td></tr>
      <tr><td class="m">CLS<span>Desktop</span></td><td><b>${dClsVal}</b>${dClsPill.label ? `<span class="pill ${dClsPill.cls}">${dClsPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.cls}</td></tr>
      <tr><td class="m">INP<span>Mobile</span></td><td><b>${mInpVal}</b>${mInpPill.label ? `<span class="pill ${mInpPill.cls}">${mInpPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.inp} ms</td></tr>
      <tr><td class="m">INP<span>Desktop</span></td><td><b>${dInpVal}</b>${dInpPill.label ? `<span class="pill ${dInpPill.cls}">${dInpPill.label}</span>` : ''}</td><td class="t">≤ ${config.thresholds.inp} ms</td></tr>
    `;
  }

  // Page 3: Findings Cards
  let findingsHtml = '';
  if (Array.isArray(findings) && findings.length > 0) {
    findingsHtml = findings.map(f => {
      let fCls = f.cls || (f.color === '#ef4444' ? 'poor' : f.color === '#10b981' ? 'pass' : 'warn');
      // Clean title format if it contains (recommended ...)
      let titleClean = (f.title || '').replace(/\s*\([^)]*\)$/, '');
      return `<div class="find ${fCls}"><b>${titleClean}</b><p>${f.desc || f.text || ''}</p></div>`;
    }).join('\n');
  } else {
    findingsHtml = `
      <div class="find ${mLcpPill.cls || 'pass'}"><b>Field LCP is ${mLcpVal}</b><p>Optimize server response times, CDN routing, and preload hero images to ensure rapid real-user loading.</p></div>
      <div class="find ${mClsPill.cls || 'pass'}"><b>Field CLS is ${mClsVal}</b><p>Layout stability reflects real-user browsing. Ensure image and dynamic container dimensions are explicitly reserved.</p></div>
      <div class="find ${mInpPill.cls || 'warn'}"><b>Field INP is ${mInpVal}</b><p>Interaction latency measures real-user responsiveness. Break up long JavaScript tasks and defer non-critical work.</p></div>
      <div class="find warn"><b>CrUX Field Observations</b><p>The 75th percentile of real visitors is measured across 28-day rolling collection windows.</p></div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Performance Audit — ${projectDisplay}</title>
<style>
@page { size: A4; margin: 0; }
:root{
  --ink:#0F172A; --mute:#64748B; --line:#E2E8F0; --panel:#F8FAFC;
  --accent:#4F46E5; --accent-bg:#EEF2FF; --navy:#0F172A; --sky:#A5B4FC;
  --good:#16A34A; --good-bg:#DCFCE7; --warn:#D97706; --warn-bg:#FEF3C7; --poor:#DC2626; --poor-bg:#FEE2E2;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Inter","Helvetica Neue",Arial,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;padding:0 18mm}
.page:last-child, section.page:last-of-type { page-break-after: avoid; }
.page::before{content:"";position:absolute;inset:0 0 auto 0;height:2mm;background:var(--accent)}
.top{display:flex;justify-content:space-between;font-size:8.5pt;padding-top:11mm}
.top b{font-weight:700}.top span{color:var(--mute)}
.foot{position:absolute;left:18mm;right:18mm;bottom:8mm;border-top:1px solid var(--line);padding-top:3mm;display:flex;justify-content:space-between;font-size:8pt;color:var(--mute)}
.bar{width:10mm;height:1.4mm;background:var(--accent);border-radius:1mm;margin:14mm 0 4mm}
h1{font-size:24pt;font-weight:800;letter-spacing:-.02em}
.sub{font-size:9pt;color:var(--mute);margin-top:2mm}

/* ---------- pill ---------- */
.pill{display:inline-block;font-size:8pt;font-weight:700;padding:1mm 3mm;border-radius:99px}
.pass{color:var(--good);background:var(--good-bg)}.warn{color:var(--warn);background:var(--warn-bg)}.poor{color:var(--poor);background:var(--poor-bg)}

/* ---------- page 1 ---------- */
.hero{position:absolute;inset:0 0 auto 0;height:62mm;background:var(--navy)}
.hero~*:not(.foot){position:relative}
.page1 .top b{color:#fff}.page1 .top span{color:var(--sky)}
.page1 h1{color:#fff;font-size:30pt;margin-top:9mm}
.url{color:var(--sky);font-size:9pt;margin-top:2mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.branch{color:var(--sky);font-size:9pt;margin-top:4mm}.branch strong{color:#fff}
.verdict{margin-top:9mm;background:#fff;border:1px solid var(--line);border-radius:3.5mm;padding:4mm 5mm;display:flex;gap:4mm;align-items:center;color:var(--ink)}
.verdict .ic{width:9mm;height:9mm;border-radius:50%;background:var(--poor-bg);color:var(--poor);font-weight:800;display:grid;place-items:center}
.verdict.warn .ic{background:var(--warn-bg);color:var(--warn)}.verdict.pass .ic{background:var(--good-bg);color:var(--good)}
.verdict b{font-size:12pt}.verdict p{font-size:9pt;color:var(--mute);margin-top:1mm}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin-top:8mm}
.card{border-radius:4mm;padding:5mm;color:var(--ink)}
.card.poor{background:var(--poor-bg)}.card.warn{background:var(--warn-bg)}.card.pass{background:var(--good-bg)}
.card h3{font-size:12pt}.card .dev{font-size:8pt;color:var(--mute);margin-top:1mm}
.score{display:flex;align-items:center;gap:4mm;margin:6mm 0 5mm}
.ring{--p:0;width:21mm;height:21mm;border-radius:50%;display:grid;place-items:center;position:relative;
  background:conic-gradient(var(--c) calc(var(--p)*1%), #fff 0)}
.ring::after{content:"";position:absolute;inset:2mm;border-radius:50%;background:inherit;background:var(--bgc)}
.ring span{position:relative;z-index:1;font-size:21pt;font-weight:800;color:var(--ink)}
.card.poor .ring{--c:var(--poor);--bgc:var(--poor-bg)}.card.warn .ring{--c:var(--warn);--bgc:var(--warn-bg)}.card.pass .ring{--c:var(--good);--bgc:var(--good-bg)}
.score .v{font-weight:700;font-size:11.5pt}.card.poor .v{color:var(--poor)}.card.warn .v{color:var(--warn)}.card.pass .v{color:var(--good)}
.score small{display:block;font-size:8pt;color:var(--mute);font-weight:400;margin-top:1mm}
.row{display:grid;grid-template-columns:1fr auto auto;gap:3mm;align-items:center;border-top:1.2px solid #fff;padding:3.5mm 0}
.row b{font-size:10.5pt;display:block}.row small{font-size:7.5pt;color:var(--mute)}
.row .val{font-size:14pt;font-weight:800;text-align:right}
.legend{display:flex;gap:8mm;font-size:8.5pt;color:var(--mute);margin-top:8mm}
.legend i{display:inline-block;width:2.4mm;height:2.4mm;border-radius:50%;margin-right:2mm;vertical-align:middle}

/* ---------- page 2 ---------- */
.trend{background:var(--panel);border:1px solid var(--line);border-radius:4mm;padding:5mm;margin-top:6mm}
.empty-history{margin-top:12mm;padding:14mm 10mm;text-align:center;background:var(--panel);border:1px dashed var(--line);border-radius:4mm;color:var(--mute);font-size:11pt}
.trend .hd{display:flex;justify-content:space-between;align-items:flex-start}
.chip{background:var(--accent-bg);color:var(--accent);font-weight:700;font-size:10pt;padding:1.5mm 3.5mm;border-radius:2mm;margin-right:3mm}
.trend .nm{font-size:9pt;color:var(--mute)}
.trend .big{font-size:20pt;font-weight:800;text-align:right}.trend .delta{font-size:8.5pt;color:var(--mute);text-align:right}
.track{position:relative;height:3mm;border-radius:2mm;margin:13mm 6mm 8mm;
  background:linear-gradient(90deg,var(--good-bg) 0 var(--thr),var(--poor-bg) var(--thr) 100%)}
.track .thr{position:absolute;left:var(--thr);top:-2mm;height:7mm;width:.3mm;background:var(--mute)}
.track .thr em{position:absolute;top:-4.5mm;left:50%;transform:translateX(-50%);font-size:7.5pt;font-style:normal;color:var(--mute);white-space:nowrap}
.track .seg{position:absolute;top:50%;height:.6mm;background:var(--accent);transform:translateY(-50%)}
.track .d{position:absolute;top:50%;width:3.2mm;height:3.2mm;border-radius:50%;transform:translate(-50%,-50%);border:.5mm solid var(--accent)}
.track .d.s{background:#fff}.track .d.e{background:var(--accent)}
.track .lbl{position:absolute;top:5mm;font-size:8pt;transform:translateX(-50%);white-space:nowrap;color:var(--accent);font-weight:700}
.take{margin-top:8mm}.take h3{font-size:12pt;margin-bottom:3mm}
.take p{font-size:9.5pt;color:var(--mute);margin-bottom:2mm;display:flex;gap:6mm}.take p b{color:var(--accent);font-size:9pt;width:8mm}

/* ---------- page 3 ---------- */
table{width:100%;border-collapse:separate;border-spacing:0;margin-top:7mm;font-size:10pt}
th{background:var(--navy);color:#fff;font-size:7.5pt;letter-spacing:.04em;text-align:left;padding:3mm 3.5mm}
th:first-child{border-radius:2mm 0 0 2mm}th:last-child{border-radius:0 2mm 2mm 0}
td{padding:2.6mm 3.5mm}tbody tr:nth-child(odd) td{background:var(--panel)}
td.m{color:var(--accent);font-weight:700}td.m span{color:var(--mute);font-weight:400;margin-left:3mm}
td b{margin-right:2mm}td.t{color:var(--mute)}
.note{font-size:8pt;color:var(--mute);margin-top:3mm}
h2{font-size:13pt;margin:9mm 0 3mm}
.find{border-radius:2.5mm;padding:3mm 4mm 3.2mm;margin-bottom:2.4mm;border-left:1.2mm solid}
.find.warn{background:var(--warn-bg);border-color:var(--warn)}.find.pass{background:var(--good-bg);border-color:var(--good)}.find.poor{background:var(--poor-bg);border-color:var(--poor)}
.find{color:var(--ink)}.find b{font-size:10pt;color:var(--ink)}.find p{font-size:9pt;color:#475569;margin-top:1.2mm;line-height:1.4}
</style></head><body>

<!-- ============ PAGE 1 : EXECUTIVE SUMMARY ============ -->
<section class="page page1">
  <div class="hero"></div>
  <div class="top"><b>Core Web Vitals Diagnostic Lab</b><span>${projectDisplay} · ${branchDisplay} · ${formattedDate}</span></div>
  <h1>Performance Audit</h1>
  <div class="url">${escapeHtml(url)}</div>
  <div class="branch">Branch&nbsp; ${escapeHtml(branchDisplay)} <span>·</span> <strong>Engineering Analysis:</strong> <strong>${escapeHtml(engineerDisplay)}</strong></div>
  <div class="verdict ${verdictClass}"><div class="ic">${verdictIcon}</div><div><b>${verdictTitle}</b><p>${verdictText}</p></div></div>

  <div class="cards">
    <!-- card class: poor (<50) | warn (50-89) | pass (>=90) -->
    <div class="card ${mobileClass}">
      <h3>Mobile</h3><div class="dev">${mobileConfig}</div>
      <div class="score"><div class="ring" style="--p:${mobileScoreDisplay}"><span>${mobileScoreText}</span></div>
        <div class="v">${mobileLabel}<small>CrUX field assessment</small></div></div>
      <div class="row"><div><b>LCP</b><small>Largest Contentful Paint</small></div><div class="val">${mLcpVal}</div><div>${mLcpPill.label ? `<span class="pill ${mLcpPill.cls}">${mLcpPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.lcp / 1000} s</small></div></div>
      <div class="row"><div><b>CLS</b><small>Cumulative Layout Shift</small></div><div class="val">${mClsVal}</div><div>${mClsPill.label ? `<span class="pill ${mClsPill.cls}">${mClsPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.cls}</small></div></div>
      <div class="row"><div><b>INP</b><small>Interaction to Next Paint</small></div><div class="val">${mInpVal}</div><div>${mInpPill.label ? `<span class="pill ${mInpPill.cls}">${mInpPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.inp} ms</small></div></div>
    </div>
    <div class="card ${desktopClass}">
      <h3>Desktop</h3><div class="dev">${desktopConfig}</div>
      <div class="score"><div class="ring" style="--p:${desktopScoreDisplay}"><span>${desktopScoreText}</span></div>
        <div class="v">${desktopLabel}<small>CrUX field assessment</small></div></div>
      <div class="row"><div><b>LCP</b><small>Largest Contentful Paint</small></div><div class="val">${dLcpVal}</div><div>${dLcpPill.label ? `<span class="pill ${dLcpPill.cls}">${dLcpPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.lcp / 1000} s</small></div></div>
      <div class="row"><div><b>CLS</b><small>Cumulative Layout Shift</small></div><div class="val">${dClsVal}</div><div>${dClsPill.label ? `<span class="pill ${dClsPill.cls}">${dClsPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.cls}</small></div></div>
      <div class="row"><div><b>INP</b><small>Interaction to Next Paint</small></div><div class="val">${dInpVal}</div><div>${dInpPill.label ? `<span class="pill ${dInpPill.cls}">${dInpPill.label}</span><br>` : ''}<small>Good ≤ ${config.thresholds.inp} ms</small></div></div>
    </div>
  </div>
  <div class="legend"><b style="color:var(--ink)">Score guide</b>
    <span><i style="background:var(--good)"></i>Good 90–100</span><span><i style="background:var(--warn)"></i>Needs improvement 50–89</span><span><i style="background:var(--poor)"></i>Poor 0–49</span></div>
  <div class="foot"><span>Confidential</span><span>1 / 3</span></div>
</section>

<!-- ============ PAGE 2 : CRUX FIELD TRENDS ============ -->
<section class="page">
  <div class="top"><b>Core Web Vitals Diagnostic Lab</b><span>${projectDisplay} · ${branchDisplay} · ${formattedDate}</span></div>
  <div class="bar"></div><h1>Field trends</h1>
  ${fieldTrendsHtml}
  <div class="foot"><span>Confidential</span><span>2 / 3</span></div>
</section>

<!-- ============ PAGE 3 : METRICS DETAIL + FINDINGS ============ -->
<section class="page">
  <div class="top"><b>Core Web Vitals Diagnostic Lab</b><span>${projectDisplay} · ${branchDisplay} · ${formattedDate}</span></div>
  <div class="bar"></div><h1>Metrics detail</h1>
  <div class="sub">Field data from real users (CrUX, 75th percentile)</div>
  <table>
    <thead><tr><th>METRIC</th><th>FIELD (REAL USERS)</th><th>TARGET</th></tr></thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>
  <div class="note">All metrics represent 75th percentile (p75) real-user experience collected by Google Chrome (CrUX).</div>

  <h2>Findings &amp; recommended focus</h2>
  ${findingsHtml}
  <div class="foot"><span>Confidential</span><span>3 / 3</span></div>
</section>
</body></html>`;
}
