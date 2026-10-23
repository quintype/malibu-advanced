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
    cruxHistoryPoints = null,
    emulationConfig = null
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

  const renderPdfTestConfig = (cfg) => {
    if (!cfg) return '';
    const isMobile = cfg.formFactor === 'mobile';
    const cpuBg = isMobile ? '#fce7f3' : '#f0fdf4';
    const cpuColor = isMobile ? '#9d174d' : '#166534';
    return `
      <div style="margin: 4px 0 8px 0; padding: 7px 12px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 6px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; font-size: 0.58rem; color: #475569; font-family: Inter, sans-serif;">
        <span style="font-weight: 700; color: #0f172a; font-size: 0.6rem;">⚙ Test Config</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="background: #e0f2fe; color: #0369a1; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-family: monospace;">${cfg.viewport}</span>
        <span style="color: #94a3b8;">@</span>
        <span style="background: #f0fdf4; color: #166534; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-family: monospace;">${cfg.deviceScaleFactor}x DPR</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="background: #fef3c7; color: #92400e; padding: 1px 6px; border-radius: 4px; font-weight: 600; font-family: monospace;">${cfg.throttlingProfile}</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="font-weight: 600; color: #64748b;">CPU:</span>
        <span style="background: ${cpuBg}; color: ${cpuColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-family: monospace;">${cfg.cpuSlowdown}</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="font-weight: 600; color: #334155;">${cfg.deviceName}</span>
        <span style="color: #cbd5e1;">|</span>
        <span style="background: #ede9fe; color: #5b21b6; padding: 1px 6px; border-radius: 4px; font-weight: 700; font-family: monospace;">Lighthouse v${emulationConfig?.lighthouseVersion || '11.7.1'}</span>
        <span style="color: #94a3b8; font-style: italic;">(Default)</span>
      </div>`;
  };

  const renderCruxTrendPage = () => {
    if (!hasCruxHistory || !validPoints) return '';

    const n = validPoints.length;
    const firstDate = validPoints[0].dateStr;
    const lastDate = validPoints[n - 1].dateStr;

    // Extract series and date labels
    const lcpVals = validPoints.map(p => p.lcp);
    const inpVals = validPoints.map(p => p.inp);
    const clsVals = validPoints.map(p => p.cls);
    const dateLabels = validPoints.map(p => p.dateStr.length >= 10 ? p.dateStr.substring(5) : p.dateStr);

    const validLcp = lcpVals.filter(v => v !== null && !isNaN(v));
    const validInp = inpVals.filter(v => v !== null && !isNaN(v));
    const validCls = clsVals.filter(v => v !== null && !isNaN(v));

    const maxLcpRaw = validLcp.length > 0 ? Math.max(...validLcp) : 2500;
    const maxLcp = Math.max(3000, Math.ceil((maxLcpRaw * 1.15) / 500) * 500);

    const maxInpRaw = validInp.length > 0 ? Math.max(...validInp) : 200;
    const maxInp = Math.max(300, Math.ceil((maxInpRaw * 1.3) / 50) * 50);

    const maxClsRaw = validCls.length > 0 ? Math.max(...validCls) : 0.10;
    const maxCls = Math.max(0.15, Math.ceil(maxClsRaw * 20) / 20);

    const latestLcp = validLcp.length > 0 ? validLcp[validLcp.length - 1] : null;
    const latestInp = validInp.length > 0 ? validInp[validInp.length - 1] : null;
    const latestCls = validCls.length > 0 ? validCls[validCls.length - 1] : null;

    // Helper to render vector SVG sub-charts with dedicated scale and threshold
    const renderSubChartSvg = (opts) => {
      const {
        width = 200,
        height = 135,
        values = [],
        dates = [],
        color = '#3b82f6',
        yMax = 5000,
        threshold = 2500,
        thresholdLabel = '≤ 2.5s',
        formatVal = (v) => `${(v / 1000).toFixed(1)}s`
      } = opts;

      const padLeft = 32;
      const padRight = 8;
      const padTop = 14;
      const padBottom = 22;
      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;
      const ptCount = values.length;

      const getX = (idx) => (padLeft + (idx / Math.max(1, ptCount - 1)) * chartW).toFixed(1);
      const getY = (val) => (padTop + chartH - (val / yMax) * chartH).toFixed(1);

      // Horizontal grid lines (0, 50%, 100%)
      let gridLines = '';
      [0, yMax / 2, yMax].forEach(val => {
        const y = getY(val);
        gridLines += `<line x1="${padLeft}" y1="${y}" x2="${padLeft + chartW}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />\n`;
        gridLines += `<text x="${padLeft - 4}" y="${(Number(y) + 3).toFixed(1)}" text-anchor="end" font-size="7" fill="#94a3b8">${formatVal(val)}</text>\n`;
      });

      // Threshold line
      let thresholdSvg = '';
      if (threshold && threshold <= yMax) {
        const ty = getY(threshold);
        thresholdSvg = `
          <line x1="${padLeft}" y1="${ty}" x2="${padLeft + chartW}" y2="${ty}" stroke="#10b981" stroke-width="1.2" stroke-dasharray="3,3" />
          <text x="${padLeft + chartW}" y="${(Number(ty) - 3).toFixed(1)}" text-anchor="end" font-size="6.5" font-weight="700" fill="#10b981">Good ${thresholdLabel}</text>
        `;
      }

      // Line path and dots
      let pathD = '';
      let dotsSvg = '';
      values.forEach((v, idx) => {
        if (v !== null && !isNaN(v)) {
          const cx = getX(idx);
          const cy = getY(v);
          pathD += (pathD === '' ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`);
          dotsSvg += `<circle cx="${cx}" cy="${cy}" r="3" fill="${color}" stroke="#ffffff" stroke-width="1.2" />\n`;
        }
      });

      // Subtle area fill
      let areaSvg = '';
      if (pathD) {
        const firstX = getX(0);
        const lastX = getX(ptCount - 1);
        const baseY = getY(0);
        areaSvg = `<path d="${pathD} L ${lastX} ${baseY} L ${firstX} ${baseY} Z" fill="${color}" fill-opacity="0.08" />\n`;
      }

      // X-axis date labels
      let xLabelsSvg = '';
      if (dates.length >= 2) {
        const startX = getX(0);
        const endX = getX(dates.length - 1);
        const yText = (padTop + chartH + 14).toFixed(1);
        xLabelsSvg += `<text x="${startX}" y="${yText}" text-anchor="start" font-size="7" fill="#94a3b8">${dates[0]}</text>\n`;
        xLabelsSvg += `<text x="${endX}" y="${yText}" text-anchor="end" font-size="7" fill="#94a3b8">${dates[dates.length - 1]}</text>\n`;
      }

      return `
        <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible;" font-family="Inter, sans-serif">
          ${gridLines}
          ${thresholdSvg}
          ${areaSvg}
          ${pathD ? `<path d="${pathD}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` : ''}
          ${dotsSvg}
          ${xLabelsSvg}
        </svg>
      `;
    };

    const lcpSvg = renderSubChartSvg({
      width: 200,
      height: 135,
      values: lcpVals,
      dates: dateLabels,
      color: '#3b82f6',
      yMax: maxLcp,
      threshold: 2500,
      thresholdLabel: '≤ 2.5s',
      formatVal: (v) => `${(v / 1000).toFixed(1)}s`
    });

    const inpSvg = renderSubChartSvg({
      width: 200,
      height: 135,
      values: inpVals,
      dates: dateLabels,
      color: '#10b981',
      yMax: maxInp,
      threshold: 200,
      thresholdLabel: '≤ 200ms',
      formatVal: (v) => `${Math.round(v)}ms`
    });

    const clsSvg = renderSubChartSvg({
      width: 200,
      height: 135,
      values: clsVals,
      dates: dateLabels,
      color: '#f59e0b',
      yMax: maxCls,
      threshold: 0.10,
      thresholdLabel: '≤ 0.10',
      formatVal: (v) => v.toFixed(2)
    });

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

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
          <h3 style="font-size: 0.95rem; font-weight: 800; color: #0f172a;">Core Web Vitals Historical Trends (75th percentile)</h3>
          <p style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">Field data aggregated by Google Chrome User Experience Report (CrUX) across ${n} collection periods (${firstDate} – ${lastDate}).</p>

          <!-- 3 Sub-Charts Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 12px;">
            <!-- Card 1: LCP -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <div style="font-size: 0.74rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 5px;">
                    <span style="width: 7px; height: 7px; background: #3b82f6; border-radius: 50%; display: inline-block;"></span>
                    Largest Contentful Paint
                  </div>
                  <div style="font-size: 0.6rem; color: #64748b;">Target: ≤ 2.5s (Good)</div>
                </div>
                <div style="font-size: 0.75rem; font-weight: 800; color: ${latestLcp !== null && latestLcp <= 2500 ? '#166534' : latestLcp !== null && latestLcp <= 4000 ? '#b45309' : '#991b1b'}; background: ${latestLcp !== null && latestLcp <= 2500 ? '#dcfce7' : latestLcp !== null && latestLcp <= 4000 ? '#fef3c7' : '#fee2e2'}; padding: 1px 6px; border-radius: 3px; font-family: monospace;">
                  ${latestLcp !== null ? `${(latestLcp / 1000).toFixed(2)}s` : 'N/A'}
                </div>
              </div>
              ${lcpSvg}
            </div>

            <!-- Card 2: INP -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <div style="font-size: 0.74rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 5px;">
                    <span style="width: 7px; height: 7px; background: #10b981; border-radius: 50%; display: inline-block;"></span>
                    Interaction to Next Paint
                  </div>
                  <div style="font-size: 0.6rem; color: #64748b;">Target: ≤ 200ms (Good)</div>
                </div>
                <div style="font-size: 0.75rem; font-weight: 800; color: ${latestInp !== null && latestInp <= 200 ? '#166534' : latestInp !== null && latestInp <= 500 ? '#b45309' : '#991b1b'}; background: ${latestInp !== null && latestInp <= 200 ? '#dcfce7' : latestInp !== null && latestInp <= 500 ? '#fef3c7' : '#fee2e2'}; padding: 1px 6px; border-radius: 3px; font-family: monospace;">
                  ${latestInp !== null ? `${latestInp}ms` : 'N/A'}
                </div>
              </div>
              ${inpSvg}
            </div>

            <!-- Card 3: CLS -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <div style="font-size: 0.74rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 5px;">
                    <span style="width: 7px; height: 7px; background: #f59e0b; border-radius: 50%; display: inline-block;"></span>
                    Cumulative Layout Shift
                  </div>
                  <div style="font-size: 0.6rem; color: #64748b;">Target: ≤ 0.10 (Good)</div>
                </div>
                <div style="font-size: 0.75rem; font-weight: 800; color: ${latestCls !== null && latestCls <= 0.10 ? '#166534' : latestCls !== null && latestCls <= 0.25 ? '#b45309' : '#991b1b'}; background: ${latestCls !== null && latestCls <= 0.10 ? '#dcfce7' : latestCls !== null && latestCls <= 0.25 ? '#fef3c7' : '#fee2e2'}; padding: 1px 6px; border-radius: 3px; font-family: monospace;">
                  ${latestCls !== null ? latestCls.toFixed(3) : 'N/A'}
                </div>
              </div>
              ${clsSvg}
            </div>
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

        ${renderPdfTestConfig(emulationConfig?.mobile)}

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

        ${renderPdfTestConfig(emulationConfig?.desktop)}

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
