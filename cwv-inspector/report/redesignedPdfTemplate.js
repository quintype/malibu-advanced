/**
 * Redesigned Executive PDF Template for CWV Inspector.
 * Conditionally includes CrUX Historical Trend (Page 2) if real CrUX history data is available;
 * otherwise produces a clean 2-page report with Metrics Detail & Findings on Page 2.
 */

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

    if (hasLcp || hasCls || hasInp) {
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
    gitBranch = '',
    url = '',
    date = '',
    engineer = 'siripireddy Giri',
    assessment = {
      status: 'Completed',
      color: '#0284c7',
      bgColor: '#f0f9ff',
      borderColor: '#e0f2fe',
      borderLeftColor: '#0284c7',
      icon: 'ℹ',
      text: 'Performance audit completed.'
    },
    mobile = {
      score: 0,
      statusLabel: 'N/A',
      statusColor: '#94a3b8',
      desc: 'Mobile audit results.',
      lcp: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 2.5 s' },
      cls: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 0.1' },
      tbt: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 200 ms' }
    },
    desktop = {
      score: 0,
      statusLabel: 'N/A',
      statusColor: '#94a3b8',
      desc: 'Desktop audit results.',
      lcp: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 2.5 s' },
      cls: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 0.1' },
      tbt: { val: 'N/A', pass: false, pct: 0, limit: 'Good ≤ 200 ms' }
    },
    metricsDetail = [],
    takeaways = [],
    findings = [],
    cruxHistory = null,
    cruxHistoryPoints = null
  } = data || {};

  const validPoints = Array.isArray(cruxHistoryPoints) && cruxHistoryPoints.length >= 2
    ? cruxHistoryPoints
    : extractCruxHistoryPoints(cruxHistory);

  const hasCruxHistory = !!(validPoints && validPoints.length >= 2);
  const totalPages = hasCruxHistory ? 3 : 2;

  const renderGaugeSvg = (score) => {
    const strokeColor = score >= 90 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
    const arcLength = 172.44;
    const circ = 238.76;
    const progressLength = arcLength * (Math.min(100, Math.max(0, score)) / 100);

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 125px; flex-shrink: 0;">
        <svg width="105" height="105" viewBox="0 0 100 100">
          <!-- Background arc: starts at 140 deg to 400 deg (260 deg arc) -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" stroke-width="8.5"
            stroke-linecap="round" stroke-dasharray="${arcLength} ${circ}"
            transform="rotate(140 50 50)" />
          <!-- Progress arc -->
          <circle cx="50" cy="50" r="38" fill="none" stroke="${strokeColor}" stroke-width="8.5"
            stroke-linecap="round" stroke-dasharray="${progressLength} ${circ}"
            transform="rotate(140 50 50)" />
          <!-- Center Text -->
          <text x="50" y="47" text-anchor="middle" font-size="26" font-weight="800" fill="#0f172a" font-family="Inter, -apple-system, sans-serif">${score}</text>
          <text x="50" y="60" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a" font-family="Inter, -apple-system, sans-serif">
            ${score} <tspan fill="#94a3b8" font-weight="500">/100</tspan>
          </text>
          <text x="50" y="70" text-anchor="middle" font-size="6.5" font-weight="700" fill="#94a3b8" letter-spacing="0.05em" font-family="Inter, -apple-system, sans-serif">PERFORMANCE</text>
          <text x="50" y="78" text-anchor="middle" font-size="6.5" font-weight="700" fill="#94a3b8" letter-spacing="0.05em" font-family="Inter, -apple-system, sans-serif">SCORE</text>
        </svg>
      </div>
    `;
  };

  const renderSlider = (pct) => `
    <div style="position: relative; width: 100%; height: 5px; background: linear-gradient(to right, #10b981 0%, #10b981 48%, #f59e0b 48%, #f59e0b 80%, #ef4444 80%, #ef4444 100%); border-radius: 3px; margin: 8px 0 8px 0;">
      <div style="position: absolute; top: 50%; left: ${Math.min(96, Math.max(4, pct))}%; transform: translate(-50%, -50%); width: 9px; height: 9px; background: #ffffff; border: 2px solid #0f172a; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.2);"></div>
    </div>
  `;

  const renderRunningHeader = () => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 2px solid #004b87;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 24px; height: 24px; background: #0f172a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; font-family: Inter, sans-serif;">Q</div>
        <span style="font-size: 1.05rem; font-weight: 800; color: #004b87; font-family: Inter, sans-serif; letter-spacing: -0.01em;">Core Web Vitals Diagnostic Lab</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; font-size: 0.78rem; color: #64748b; font-weight: 500;">
        ${gitBranch ? `<span style="background: #e0f2fe; color: #0284c7; font-family: monospace; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 4px;">branch: ${gitBranch}</span>` : ''}
        ${date ? `<span>${date}</span>` : ''}
      </div>
    </div>
  `;

  const renderRunningFooter = (pageNum) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #cbd5e1; margin-top: auto; font-size: 0.7rem; color: #64748b; font-family: Inter, sans-serif;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="width: 14px; height: 14px; background: #0f172a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 8px;">Q</div>
        <span>Confidential · Core Web Vitals Diagnostic Lab</span>
      </div>
      <div style="font-weight: 600; color: #64748b;">Core Web Vitals Executive Audit</div>
      <div style="font-weight: 700; color: #0f172a;">Page ${pageNum} of ${totalPages}</div>
    </div>
  `;

  const renderMetricCard = (title, sub1, sub2, val, pass, pct, limit) => `
    <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column;">
      <div style="font-size: 0.85rem; font-weight: 800; color: #0f172a; line-height: 1.2;">${title}</div>
      <div style="font-size: 0.62rem; color: #64748b; line-height: 1.2;">${sub1}<br>${sub2}</div>
      <div style="font-size: 1.45rem; font-weight: 800; color: ${pass ? '#10b981' : '#f59e0b'}; margin-top: 4px; line-height: 1.1;">${val}</div>
      ${renderSlider(pct)}
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.62rem; margin-top: 2px;">
        <span style="color: ${pass ? '#10b981' : '#f59e0b'}; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
          <span style="font-size: 9px;">●</span> ${pass ? 'PASS' : 'WARN'}
        </span>
        <span style="color: #64748b; font-weight: 500;">${limit}</span>
      </div>
    </div>
  `;

  const renderCruxTrendPage = () => {
    if (!hasCruxHistory || !validPoints) return '';

    const n = validPoints.length;
    const firstDate = validPoints[0].dateStr;
    const lastDate = validPoints[n - 1].dateStr;

    // Collect max values
    const lcpInpVals = validPoints.flatMap(p => [p.lcp, p.inp]).filter(v => v !== null && !isNaN(v));
    const maxLcpInpRaw = lcpInpVals.length > 0 ? Math.max(...lcpInpVals) : 2500;
    const maxLcpInp = Math.max(2500, Math.ceil(maxLcpInpRaw / 500) * 500);

    const clsVals = validPoints.map(p => p.cls).filter(v => v !== null && !isNaN(v));
    const maxClsRaw = clsVals.length > 0 ? Math.max(...clsVals) : 0.25;
    const maxCls = Math.max(0.20, Math.ceil(maxClsRaw * 20) / 20);

    // Chart dimensions
    const xStart = 55;
    const xEnd = 645;
    const chartW = xEnd - xStart;
    const yTop = 20;
    const yBottom = 236;
    const chartH = yBottom - yTop;

    // Grid lines: 5 intervals
    const gridCount = 5;
    let gridLinesSvg = '';
    let leftYLabelsSvg = '';
    let rightYLabelsSvg = '';

    for (let k = 0; k <= gridCount; k++) {
      const y = yBottom - (k / gridCount) * chartH;
      const lcpVal = Math.round((k / gridCount) * maxLcpInp);
      const clsVal = ((k / gridCount) * maxCls).toFixed(2);
      const isBase = k === 0;

      gridLinesSvg += `<line x1="${xStart}" y1="${y.toFixed(1)}" x2="${xEnd}" y2="${y.toFixed(1)}" stroke="${isBase ? '#e2e8f0' : '#f1f5f9'}" stroke-width="1" />\n`;
      leftYLabelsSvg += `<text x="46" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="8.5" fill="#94a3b8">${lcpVal.toLocaleString()}</text>\n`;
      rightYLabelsSvg += `<text x="654" y="${(y + 3).toFixed(1)}" text-anchor="start" font-size="8.5" fill="#94a3b8">${clsVal}</text>\n`;
    }

    // Coordinates mapping
    const getX = (idx) => (xStart + (idx / (n - 1)) * chartW).toFixed(1);
    const getYLeft = (val) => (yBottom - (val / maxLcpInp) * chartH).toFixed(1);
    const getYRight = (val) => (yBottom - (val / maxCls) * chartH).toFixed(1);

    // Build LCP path & points
    const lcpPoints = [];
    let lcpPath = '';
    // Build INP path & points
    const inpPoints = [];
    let inpPath = '';
    // Build CLS path & points
    const clsPoints = [];
    let clsPath = '';

    validPoints.forEach((pt, idx) => {
      const cx = getX(idx);

      if (pt.lcp !== null) {
        const cy = getYLeft(pt.lcp);
        lcpPath += (lcpPath === '' ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`);
        lcpPoints.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="#3b82f6" />`);
      }
      if (pt.inp !== null) {
        const cy = getYLeft(pt.inp);
        inpPath += (inpPath === '' ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`);
        inpPoints.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="#10b981" />`);
      }
      if (pt.cls !== null) {
        const cy = getYRight(pt.cls);
        clsPath += (clsPath === '' ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`);
        clsPoints.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="#f59e0b" />`);
      }
    });

    // X Axis Labels: up to 10 labels evenly spaced
    const labelStep = Math.max(1, Math.floor((n - 1) / 9));
    const xLabelsSvg = [];
    const addedIndices = new Set();
    for (let idx = 0; idx < n; idx += labelStep) {
      const cx = getX(idx);
      xLabelsSvg.push(`<text x="${cx}" y="248" transform="rotate(-45 ${cx} 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">${validPoints[idx].dateStr}</text>`);
      addedIndices.add(idx);
    }
    if (!addedIndices.has(n - 1)) {
      const lastCx = getX(n - 1);
      xLabelsSvg.push(`<text x="${lastCx}" y="248" transform="rotate(-45 ${lastCx} 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">${validPoints[n - 1].dateStr}</text>`);
    }

    const activeTakeaways = (takeaways && takeaways.length > 0) ? takeaways : [
      {
        title: 'LCP',
        text: validPoints[0].lcp !== null && validPoints[n - 1].lcp !== null
          ? `Field LCP moved from ${(validPoints[0].lcp / 1000).toFixed(2)}s to ${(validPoints[n - 1].lcp / 1000).toFixed(2)}s (${Math.round(((validPoints[n - 1].lcp - validPoints[0].lcp) / validPoints[0].lcp) * 100)}%) across collection periods.`
          : 'Field LCP historical data recorded.'
      },
      {
        title: 'CLS',
        text: validPoints[0].cls !== null && validPoints[n - 1].cls !== null
          ? `Cumulative Layout Shift changed from ${validPoints[0].cls.toFixed(3)} to ${validPoints[n - 1].cls.toFixed(3)}.`
          : 'Cumulative Layout Shift historical stability maintained.'
      },
      {
        title: 'INP',
        text: validPoints[0].inp !== null && validPoints[n - 1].inp !== null
          ? `Interaction latency (INP) moved from ${validPoints[0].inp}ms to ${validPoints[n - 1].inp}ms.`
          : 'Interaction responsiveness maintained.'
      }
    ];

    return `
  <!-- ================= PAGE 2 ================= -->
  <div class="pdf-page">
    <div class="page-border-box">
      ${renderRunningHeader()}

      <div style="margin-top: 14px;">
        <!-- Section: CrUX Historical Trend -->
        <div class="section-title">
          CrUX HISTORICAL TREND <span style="font-size: 0.6rem; font-weight: 800; background: #e0f2fe; color: #0284c7; padding: 2px 7px; border-radius: 4px; margin-left: 8px;">PAST 6 MONTHS</span>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;">
          <h3 style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">LCP, INP and CLS (75th percentile)</h3>
          <p style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">Collected over the previous ${n} collection periods (${firstDate} – ${lastDate}).</p>
          
          <!-- Legend -->
          <div style="display: flex; gap: 18px; font-size: 0.68rem; font-weight: 700; margin: 12px 0 10px 0;">
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> <span style="color: #3b82f6;">LCP p75 (ms)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> <span style="color: #10b981;">INP p75 (ms)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></span> <span style="color: #f59e0b;">CLS p75</span></div>
          </div>

          <!-- Dual Axis SVG Chart -->
          <div style="position: relative; width: 100%; height: 280px; margin-top: 8px;">
            <svg viewBox="0 0 700 280" style="width: 100%; height: 100%; overflow: visible;" font-family="Inter, sans-serif">
              <!-- Grid lines -->
              ${gridLinesSvg}

              <!-- Left Y Axis Labels (LCP/INP ms) -->
              ${leftYLabelsSvg}
              <text x="14" y="128" transform="rotate(-90 14 128)" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b">LCP / INP (ms)</text>

              <!-- Right Y Axis Labels (CLS) -->
              ${rightYLabelsSvg}
              <text x="686" y="128" transform="rotate(90 686 128)" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b">CLS score</text>

              <!-- X Axis Labels -->
              ${xLabelsSvg.join('\n              ')}

              <!-- Lines & Points: CLS (Amber) -->
              ${clsPath ? `<path d="${clsPath}" fill="none" stroke="#f59e0b" stroke-width="2.5" />` : ''}
              ${clsPoints.join('\n              ')}

              <!-- Lines & Points: LCP (Blue) -->
              ${lcpPath ? `<path d="${lcpPath}" fill="none" stroke="#3b82f6" stroke-width="2.5" />` : ''}
              ${lcpPoints.join('\n              ')}

              <!-- Lines & Points: INP (Green) -->
              ${inpPath ? `<path d="${inpPath}" fill="none" stroke="#10b981" stroke-width="2.5" />` : ''}
              ${inpPoints.join('\n              ')}
            </svg>
          </div>
          <div style="font-size: 0.62rem; color: #94a3b8; margin-top: 10px;">Field data aggregated by Google Chrome User Experience Report (CrUX).</div>
        </div>

        <!-- Section: Key Takeaways -->
        <div class="section-title">
          KEY TAKEAWAYS
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px;">
          ${activeTakeaways.map(t => `
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 3.5px solid #10b981; border-radius: 8px; padding: 12px 14px;">
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 4px;">${t.title}</div>
              <div style="font-size: 0.72rem; color: #475569; line-height: 1.35;">${t.text}</div>
            </div>
          `).join('')}
        </div>

      </div>

      ${renderRunningFooter(2)}
    </div>
  </div>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Performance Audit Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }
    @page {
      size: A4;
      margin: 0;
    }
    .pdf-page {
      width: 210mm;
      height: 297mm;
      max-height: 297mm;
      page-break-after: always;
      position: relative;
      background: #ffffff;
      padding: 12mm 14mm;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;
    }
    .page-border-box {
      border: 1.5px solid #004b87;
      border-radius: 12px;
      padding: 16px 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .section-title {
      border-left: 3.5px solid #004b87;
      padding-left: 8px;
      font-size: 0.82rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #004b87;
      margin: 10px 0 8px 0;
      display: flex;
      align-items: center;
    }
    .exec-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      position: relative;
      margin-bottom: 6px;
    }
    .exec-tag {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #0284c7;
      background: #e0f2fe;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .status-dot-text {
      font-size: 0.95rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      line-height: 1.2;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="pdf-page">
    <div class="page-border-box">
      ${renderRunningHeader()}

      <div style="margin-top: 12px;">
        <h1 style="font-size: 1.95rem; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; margin-bottom: 10px;">Performance Audit Report</h1>
        
        <!-- Metadata Box -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: grid; grid-template-columns: 1fr 1fr 1.6fr 1.3fr; gap: 10px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">PROJECT</div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${clientName}</div>
          </div>
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">GIT BRANCH</div>
            <div style="font-size: 0.82rem; font-weight: 700; color: #0284c7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace;">${gitBranch}</div>
          </div>
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">URL</div>
            <div style="font-size: 0.88rem; font-weight: 600; color: #0284c7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</div>
          </div>
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">ENGINEERING ANALYSIS</div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${engineer}</div>
          </div>
        </div>

        <!-- Assessment Banner -->
        <div style="background: ${assessment.bgColor}; border: 1px solid ${assessment.borderColor}; border-left: 4px solid ${assessment.borderLeftColor}; border-radius: 8px; padding: 10px 14px; display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px;">
          <div style="width: 20px; height: 20px; border-radius: 50%; background: ${assessment.borderLeftColor}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px; flex-shrink: 0; margin-top: 1px;">${assessment.icon}</div>
          <div>
            <div style="font-size: 0.88rem; font-weight: 800; color: #0f172a; line-height: 1.3;">Core Web Vitals Assessment: ${assessment.status}</div>
            <div style="font-size: 0.72rem; color: #475569; margin-top: 2px; line-height: 1.3;">${assessment.text}</div>
          </div>
        </div>

        <!-- Section: Executive Summary Mobile -->
        <div class="section-title">
          EXECUTIVE SUMMARY <span style="font-weight: 600; color: #64748b; margin-left: 6px;">MOBILE</span>
        </div>

        <div class="exec-card">
          <div style="display: flex; gap: 14px; align-items: center;">
            ${renderGaugeSvg(mobile.score)}
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="status-dot-text" style="color: ${mobile.statusColor};">
                  <span>●</span> ${mobile.statusLabel}
                </div>
                <span class="exec-tag" style="position: static;">MOBILE · LIGHTHOUSE</span>
              </div>
              <p style="font-size: 0.7rem; color: #475569; margin-top: 3px; line-height: 1.3;">${mobile.desc}</p>
              
              <div style="font-size: 0.65rem; font-weight: 800; color: #004b87; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 8px; margin-bottom: 6px;">CORE WEB VITALS OVERVIEW (LAB AUDIT${gitBranch ? ` · ${gitBranch.toUpperCase()}` : ''})</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                ${renderMetricCard('LCP', 'Largest Contentful Paint', 'Loading performance', mobile.lcp.val, mobile.lcp.pass, mobile.lcp.pct, mobile.lcp.limit)}
                ${renderMetricCard('CLS', 'Cumulative Layout Shift', 'Visual stability', mobile.cls.val, mobile.cls.pass, mobile.cls.pct, mobile.cls.limit)}
                ${renderMetricCard('TBT', 'Total Blocking Time', 'Responsiveness', mobile.tbt.val, mobile.tbt.pass, mobile.tbt.pct, mobile.tbt.limit)}
              </div>
            </div>
          </div>
        </div>

        <!-- Section: Executive Summary Desktop -->
        <div class="section-title">
          EXECUTIVE SUMMARY <span style="font-weight: 600; color: #64748b; margin-left: 6px;">DESKTOP</span>
        </div>

        <div class="exec-card">
          <div style="display: flex; gap: 14px; align-items: center;">
            ${renderGaugeSvg(desktop.score)}
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="status-dot-text" style="color: ${desktop.statusColor};">
                  <span>●</span> ${desktop.statusLabel}
                </div>
                <span class="exec-tag" style="position: static; color: #7c3aed; background: #ede9fe;">DESKTOP · LIGHTHOUSE</span>
              </div>
              <p style="font-size: 0.7rem; color: #475569; margin-top: 3px; line-height: 1.3;">${desktop.desc}</p>
              
              <div style="font-size: 0.65rem; font-weight: 800; color: #004b87; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 8px; margin-bottom: 6px;">CORE WEB VITALS OVERVIEW (LAB AUDIT${gitBranch ? ` · ${gitBranch.toUpperCase()}` : ''})</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                ${renderMetricCard('LCP', 'Largest Contentful Paint', 'Loading performance', desktop.lcp.val, desktop.lcp.pass, desktop.lcp.pct, desktop.lcp.limit)}
                ${renderMetricCard('CLS', 'Cumulative Layout Shift', 'Visual stability', desktop.cls.val, desktop.cls.pass, desktop.cls.pct, desktop.cls.limit)}
                ${renderMetricCard('TBT', 'Total Blocking Time', 'Responsiveness', desktop.tbt.val, desktop.tbt.pass, desktop.tbt.pct, desktop.tbt.limit)}
              </div>
            </div>
          </div>
        </div>

        <!-- Page 1 Bottom Legend -->
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.62rem; color: #64748b; margin-top: 8px; padding: 0 4px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <span><span style="color: #10b981;">●</span> Good</span>
            <span><span style="color: #f59e0b;">●</span> Needs improvement</span>
            <span><span style="color: #ef4444;">●</span> Poor</span>
          </div>
          <div>Gauge: Lighthouse performance score (0–100)</div>
        </div>

      </div>

      ${renderRunningFooter(1)}
    </div>
  </div>

  ${renderCruxTrendPage()}

  <!-- ================= PAGE ${hasCruxHistory ? 3 : 2} ================= -->
  <div class="pdf-page">
    <div class="page-border-box">
      ${renderRunningHeader()}

      <div style="margin-top: 14px;">
        <!-- Section: Metrics Detail -->
        <div class="section-title">
          METRICS DETAIL
        </div>

        <div style="border: 1px solid #004b87; border-radius: 8px; overflow: hidden; margin-bottom: 16px; background: #ffffff;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.75rem;">
            <thead>
              <tr style="background: #004b87; color: #ffffff; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">
                <th rowspan="2" style="padding: 10px 12px; text-align: left; width: 33%; border-right: 1px solid #1e5a96;">METRIC</th>
                <th colspan="2" style="padding: 6px 10px; text-align: center; border-right: 1px solid #1e5a96;">FIELD DATA (REAL USERS)</th>
                <th colspan="2" style="padding: 6px 10px; text-align: center; border-right: 1px solid #1e5a96;">LAB DATA (LIGHTHOUSE)</th>
                <th rowspan="2" style="padding: 10px 12px; text-align: center; width: 17%;">GOOD THRESHOLD<br>(RECOMMENDED)</th>
              </tr>
              <tr style="background: #003d6e; color: #ffffff; font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">
                <th style="padding: 5px 8px; text-align: center; border-right: 1px solid #1e5a96;">VALUE</th>
                <th style="padding: 5px 8px; text-align: center; border-right: 1px solid #1e5a96;">STATUS</th>
                <th style="padding: 5px 8px; text-align: center; border-right: 1px solid #1e5a96;">VALUE</th>
                <th style="padding: 5px 8px; text-align: center; border-right: 1px solid #1e5a96;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${metricsDetail.map((m, idx) => {
                const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                const isMobile = m.device === 'MOBILE';
                const pillBg = isMobile ? '#e0f2fe' : '#ede9fe';
                const pillColor = isMobile ? '#0284c7' : '#7c3aed';
                const fPass = m.fStat === 'PASS';
                const lPass = m.lStat === 'PASS';
                return `
                  <tr style="background: ${bg}; border-top: 1px solid #e2e8f0;">
                    <td style="padding: 9px 12px; vertical-align: middle;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.58rem; font-weight: 800; background: ${pillBg}; color: ${pillColor}; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.04em;">${m.device}</span>
                        <span style="font-weight: 600; color: #0f172a; font-size: 0.75rem;">${m.metric}</span>
                      </div>
                    </td>
                    <td style="padding: 9px 10px; text-align: center; font-weight: 800; color: #0f172a; font-size: 0.8rem;">${m.fVal}</td>
                    <td style="padding: 9px 10px; text-align: center;">
                      <span style="font-size: 0.65rem; font-weight: 700; color: ${fPass ? '#059669' : m.fStat === 'N/A' ? '#94a3b8' : '#d97706'}; display: inline-flex; align-items: center; gap: 4px;">
                        <span>●</span> ${m.fStat}
                      </span>
                    </td>
                    <td style="padding: 9px 10px; text-align: center; font-weight: 800; color: #0f172a; font-size: 0.8rem;">${m.lVal}</td>
                    <td style="padding: 9px 10px; text-align: center;">
                      <span style="font-size: 0.65rem; font-weight: 700; color: ${lPass ? '#059669' : m.lStat === 'N/A' ? '#94a3b8' : '#d97706'}; display: inline-flex; align-items: center; gap: 4px;">
                        <span>●</span> ${m.lStat}
                      </span>
                    </td>
                    <td style="padding: 9px 12px; text-align: center; color: #64748b; font-weight: 600; font-size: 0.72rem;">${m.thresh}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Section: Findings & Recommended Focus -->
        <div class="section-title">
          FINDINGS & RECOMMENDED FOCUS
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px;">
          ${findings && findings.length > 0 ? findings.map((f, idx) => `
            <div style="margin-bottom: ${idx === findings.length - 1 ? '0' : '12px'};">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 800; color: #0f172a;">
                <span style="color: ${f.color || '#0284c7'}; font-size: 11px;">●</span>
                <span>${f.title}</span>
              </div>
              <p style="margin: 2px 0 0 16px; font-size: 0.68rem; color: #475569; line-height: 1.35;">${f.desc}</p>
            </div>
          `).join('') : '<div style="font-size: 0.72rem; color: #64748b;">No critical performance findings detected for this audit.</div>'}
        </div>

      </div>

      ${renderRunningFooter(hasCruxHistory ? 3 : 2)}
    </div>
  </div>

</body>
</html>
  `;
}
