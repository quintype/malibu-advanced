/**
 * Redesigned 3-Page Executive PDF Template for CWV Inspector.
 * Matches performance-audit-report-redesigned.pdf design.
 */

export function buildRedesignedPdfHtml(data) {
  const {
    clientName = 'ima-india',
    url = 'https://imaindia-uat-web.quintype.io',
    date = 'October 9, 2026 · 09:57 PM',
    engineer = 'Siripireddy Giri',
    assessment = {
      status: 'Needs Improvement',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      borderColor: '#fef3c7',
      borderLeftColor: '#f59e0b',
      icon: '!',
      text: 'Field metrics pass on Mobile and Desktop; Lighthouse lab scores (61 / 69) and mobile lab LCP / TBT warnings are outside the Good range.'
    },
    mobile = {
      score: 61,
      statusLabel: 'Needs Improvement',
      statusColor: '#f59e0b',
      desc: 'Real-user (field) Core Web Vitals pass on every metric. The lab score is below the 90+ target, with LCP and TBT in the warning range under simulated mobile conditions.',
      lcp: { val: '1.82s', pass: true, pct: 36.4, limit: 'Good ≤ 2.5 s' },
      cls: { val: '0.000', pass: true, pct: 2.0, limit: 'Good ≤ 0.1' },
      tbt: { val: '113ms', pass: true, pct: 18.8, limit: 'Good ≤ 200 ms' }
    },
    desktop = {
      score: 69,
      statusLabel: 'Needs Improvement',
      statusColor: '#f59e0b',
      desc: 'Real-user (field) Core Web Vitals pass on every metric. The lab score is below the 90+ target, with room to improve overall load efficiency.',
      lcp: { val: '1.70s', pass: true, pct: 34.0, limit: 'Good ≤ 2.5 s' },
      cls: { val: '0.000', pass: true, pct: 2.0, limit: 'Good ≤ 0.1' },
      tbt: { val: '63ms', pass: true, pct: 10.5, limit: 'Good ≤ 200 ms' }
    },
    metricsDetail = [
      { device: 'MOBILE', metric: 'Largest Contentful Paint (LCP)', fVal: '1.82s', fStat: 'PASS', lVal: '3.58s', lStat: 'WARN', thresh: '≤ 2.5 s' },
      { device: 'DESKTOP', metric: 'Largest Contentful Paint (LCP)', fVal: '1.70s', fStat: 'PASS', lVal: '0.49s', lStat: 'PASS', thresh: '≤ 2.5 s' },
      { device: 'MOBILE', metric: 'Cumulative Layout Shift (CLS)', fVal: '0.000', fStat: 'PASS', lVal: '0.021', lStat: 'PASS', thresh: '≤ 0.1' },
      { device: 'DESKTOP', metric: 'Cumulative Layout Shift (CLS)', fVal: '0.000', fStat: 'PASS', lVal: '0.038', lStat: 'PASS', thresh: '≤ 0.1' },
      { device: 'MOBILE', metric: 'Total Blocking Time (TBT)', fVal: '113ms', fStat: 'PASS', lVal: '249ms', lStat: 'WARN', thresh: '≤ 200 ms' },
      { device: 'DESKTOP', metric: 'Total Blocking Time (TBT)', fVal: '63ms', fStat: 'PASS', lVal: '0ms', lStat: 'PASS', thresh: '≤ 200 ms' },
      { device: 'MOBILE', metric: 'Interaction to Next Paint (INP)', fVal: '113ms', fStat: 'PASS', lVal: '0ms', lStat: 'PASS', thresh: '≤ 200 ms' },
      { device: 'DESKTOP', metric: 'Interaction to Next Paint (INP)', fVal: '63ms', fStat: 'PASS', lVal: '0ms', lStat: 'PASS', thresh: '≤ 200 ms' },
    ],
    takeaways = [
      { title: 'CLS', text: 'Layout shift dropped from ~0.43 to ~0 after July: from Poor to well inside Good.' },
      { title: 'LCP', text: 'Field LCP fell ~28% over six months and is now 1.86 s, under the 2.5 s limit.' },
      { title: 'INP', text: 'Interaction latency stayed steady around 115–145 ms, below the 200 ms limit.' }
    ],
    findings = [
      { color: '#f59e0b', title: 'Mobile lab LCP is 3.58 s (limit 2.5 s)', desc: 'Optimise the hero image/resource, reduce render-blocking CSS and JS, and improve server response time.' },
      { color: '#f59e0b', title: 'Mobile lab TBT is 249 ms (limit 200 ms)', desc: 'Split long JavaScript tasks, defer non-critical scripts and trim third-party code.' },
      { color: '#10b981', title: 'All field metrics pass on Mobile and Desktop', desc: 'Real users already get a stable, fast experience; keep monitoring to protect these gains.' },
      { color: '#0284c7', title: 'Verify INP data', desc: 'Field INP (113 ms / 63 ms) matches the TBT values exactly; confirm both come from separate measurements.' }
    ],
    cruxHistory = null
  } = data;

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
      <div style="font-size: 0.78rem; color: #64748b; font-weight: 500;">${date}</div>
    </div>
  `;

  const renderRunningFooter = (pageNum) => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #cbd5e1; margin-top: auto; font-size: 0.7rem; color: #64748b; font-family: Inter, sans-serif;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <div style="width: 14px; height: 14px; background: #0f172a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 8px;">Q</div>
        <span>Confidential · Core Web Vitals Diagnostic Lab</span>
      </div>
      <div style="font-weight: 600; color: #64748b;">Core Web Vitals Executive Audit</div>
      <div style="font-weight: 700; color: #0f172a;">Page ${pageNum} of 3</div>
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
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: grid; grid-template-columns: 1fr 1.6fr 1.4fr; gap: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">PROJECT</div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a;">${clientName}</div>
          </div>
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">URL</div>
            <div style="font-size: 0.88rem; font-weight: 600; color: #0284c7; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${url}</div>
          </div>
          <div>
            <div style="font-size: 0.62rem; font-weight: 700; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase;">ENGINEERING ANALYSIS</div>
            <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a;">${engineer}</div>
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
              
              <div style="font-size: 0.65rem; font-weight: 800; color: #004b87; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 8px; margin-bottom: 6px;">CORE WEB VITALS OVERVIEW (FIELD DATA)</div>
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
              
              <div style="font-size: 0.65rem; font-weight: 800; color: #004b87; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 8px; margin-bottom: 6px;">CORE WEB VITALS OVERVIEW (FIELD DATA)</div>
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
          <p style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">Collected over the previous 25 collection periods (weekly, 18 Apr – 3 Oct 2026).</p>
          
          <!-- Legend -->
          <div style="display: flex; gap: 18px; font-size: 0.68rem; font-weight: 700; margin: 12px 0 10px 0;">
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #3b82f6; border-radius: 2px;"></span> <span style="color: #3b82f6;">LCP p75 (ms)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span> <span style="color: #10b981;">INP p75 (ms)</span></div>
            <div style="display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; background: #f59e0b; border-radius: 2px;"></span> <span style="color: #f59e0b;">CLS p75</span></div>
          </div>

          <!-- Dual Axis SVG Chart -->
          <div style="position: relative; width: 100%; height: 280px; margin-top: 8px;">
            <svg viewBox="0 0 700 280" style="width: 100%; height: 100%; overflow: visible;" font-family="Inter, sans-serif">
              <!-- Grid lines: 10 levels from 0 to 4500 (spacing: 24px) -->
              <line x1="55" y1="20" x2="645" y2="20" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="44" x2="645" y2="44" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="68" x2="645" y2="68" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="92" x2="645" y2="92" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="116" x2="645" y2="116" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="140" x2="645" y2="140" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="164" x2="645" y2="164" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="188" x2="645" y2="188" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="212" x2="645" y2="212" stroke="#f1f5f9" stroke-width="1" />
              <line x1="55" y1="236" x2="645" y2="236" stroke="#e2e8f0" stroke-width="1" />

              <!-- Left Y Axis Labels (LCP/INP ms) -->
              <text x="46" y="23" text-anchor="end" font-size="8.5" fill="#94a3b8">4,500</text>
              <text x="46" y="47" text-anchor="end" font-size="8.5" fill="#94a3b8">4,000</text>
              <text x="46" y="71" text-anchor="end" font-size="8.5" fill="#94a3b8">3,500</text>
              <text x="46" y="95" text-anchor="end" font-size="8.5" fill="#94a3b8">3,000</text>
              <text x="46" y="119" text-anchor="end" font-size="8.5" fill="#94a3b8">2,500</text>
              <text x="46" y="143" text-anchor="end" font-size="8.5" fill="#94a3b8">2,000</text>
              <text x="46" y="167" text-anchor="end" font-size="8.5" fill="#94a3b8">1,500</text>
              <text x="46" y="191" text-anchor="end" font-size="8.5" fill="#94a3b8">1,000</text>
              <text x="46" y="215" text-anchor="end" font-size="8.5" fill="#94a3b8">500</text>
              <text x="46" y="239" text-anchor="end" font-size="8.5" fill="#94a3b8">0</text>
              <text x="14" y="128" transform="rotate(-90 14 128)" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b">LCP / INP (ms)</text>

              <!-- Right Y Axis Labels (CLS) -->
              <text x="654" y="23" text-anchor="start" font-size="8.5" fill="#94a3b8">0.45</text>
              <text x="654" y="47" text-anchor="start" font-size="8.5" fill="#94a3b8">0.40</text>
              <text x="654" y="71" text-anchor="start" font-size="8.5" fill="#94a3b8">0.35</text>
              <text x="654" y="95" text-anchor="start" font-size="8.5" fill="#94a3b8">0.30</text>
              <text x="654" y="119" text-anchor="start" font-size="8.5" fill="#94a3b8">0.25</text>
              <text x="654" y="143" text-anchor="start" font-size="8.5" fill="#94a3b8">0.20</text>
              <text x="654" y="167" text-anchor="start" font-size="8.5" fill="#94a3b8">0.15</text>
              <text x="654" y="191" text-anchor="start" font-size="8.5" fill="#94a3b8">0.10</text>
              <text x="654" y="215" text-anchor="start" font-size="8.5" fill="#94a3b8">0.05</text>
              <text x="654" y="239" text-anchor="start" font-size="8.5" fill="#94a3b8">0.00</text>
              <text x="686" y="128" transform="rotate(90 686 128)" text-anchor="middle" font-size="9" font-weight="600" fill="#64748b">CLS score</text>

              <!-- X Axis Labels (13 dates) -->
              <text x="65" y="248" transform="rotate(-45 65 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-04-18</text>
              <text x="112" y="248" transform="rotate(-45 112 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-05-02</text>
              <text x="160" y="248" transform="rotate(-45 160 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-05-16</text>
              <text x="207" y="248" transform="rotate(-45 207 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-05-30</text>
              <text x="255" y="248" transform="rotate(-45 255 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-06-13</text>
              <text x="302" y="248" transform="rotate(-45 302 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-06-27</text>
              <text x="350" y="248" transform="rotate(-45 350 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-07-11</text>
              <text x="397" y="248" transform="rotate(-45 397 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-07-25</text>
              <text x="445" y="248" transform="rotate(-45 445 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-08-08</text>
              <text x="492" y="248" transform="rotate(-45 492 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-08-22</text>
              <text x="540" y="248" transform="rotate(-45 540 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-09-05</text>
              <text x="587" y="248" transform="rotate(-45 587 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-09-19</text>
              <text x="635" y="248" transform="rotate(-45 635 248)" text-anchor="end" font-size="7.5" fill="#94a3b8">2026-10-03</text>

              <!-- Lines: CLS (Amber) dropping from 0.43 to 0.00 -->
              <path d="M 65 30 L 112 36 L 160 30 L 207 30 L 255 30 L 302 36 L 350 234 L 397 235 L 445 235 L 492 235 L 540 235 L 587 235 L 635 235" fill="none" stroke="#f59e0b" stroke-width="2.5" />
              <!-- Points on CLS -->
              <circle cx="65" cy="30" r="3" fill="#f59e0b" />
              <circle cx="112" cy="36" r="3" fill="#f59e0b" />
              <circle cx="160" cy="30" r="3" fill="#f59e0b" />
              <circle cx="207" cy="30" r="3" fill="#f59e0b" />
              <circle cx="255" cy="30" r="3" fill="#f59e0b" />
              <circle cx="302" cy="36" r="3" fill="#f59e0b" />
              <circle cx="350" cy="234" r="3" fill="#f59e0b" />
              <circle cx="397" cy="235" r="3" fill="#f59e0b" />
              <circle cx="445" cy="235" r="3" fill="#f59e0b" />
              <circle cx="492" cy="235" r="3" fill="#f59e0b" />
              <circle cx="540" cy="235" r="3" fill="#f59e0b" />
              <circle cx="587" cy="235" r="3" fill="#f59e0b" />
              <circle cx="635" cy="235" r="3" fill="#f59e0b" />

              <!-- Lines: LCP (Blue) dropping from 2.57s to 1.86s -->
              <path d="M 65 113 L 112 116 L 160 111 L 207 113 L 255 111 L 302 121 L 350 132 L 397 138 L 445 140 L 492 140 L 540 143 L 587 145 L 635 147" fill="none" stroke="#3b82f6" stroke-width="2.5" />
              <circle cx="65" cy="113" r="3" fill="#3b82f6" />
              <circle cx="112" cy="116" r="3" fill="#3b82f6" />
              <circle cx="160" cy="111" r="3" fill="#3b82f6" />
              <circle cx="207" cy="113" r="3" fill="#3b82f6" />
              <circle cx="255" cy="111" r="3" fill="#3b82f6" />
              <circle cx="302" cy="121" r="3" fill="#3b82f6" />
              <circle cx="350" cy="132" r="3" fill="#3b82f6" />
              <circle cx="397" cy="138" r="3" fill="#3b82f6" />
              <circle cx="445" cy="140" r="3" fill="#3b82f6" />
              <circle cx="492" cy="140" r="3" fill="#3b82f6" />
              <circle cx="540" cy="143" r="3" fill="#3b82f6" />
              <circle cx="587" cy="145" r="3" fill="#3b82f6" />
              <circle cx="635" cy="147" r="3" fill="#3b82f6" />

              <!-- Lines: INP (Green) steady around 120ms -->
              <path d="M 65 230 L 112 230 L 160 230 L 207 230 L 255 230 L 302 230 L 350 230 L 397 230 L 445 230 L 492 230 L 540 230 L 587 230 L 635 230" fill="none" stroke="#10b981" stroke-width="2.5" />
              <circle cx="65" cy="230" r="3" fill="#10b981" />
              <circle cx="112" cy="230" r="3" fill="#10b981" />
              <circle cx="160" cy="230" r="3" fill="#10b981" />
              <circle cx="207" cy="230" r="3" fill="#10b981" />
              <circle cx="255" cy="230" r="3" fill="#10b981" />
              <circle cx="302" cy="230" r="3" fill="#10b981" />
              <circle cx="350" cy="230" r="3" fill="#10b981" />
              <circle cx="397" cy="230" r="3" fill="#10b981" />
              <circle cx="445" cy="230" r="3" fill="#10b981" />
              <circle cx="492" cy="230" r="3" fill="#10b981" />
              <circle cx="540" cy="230" r="3" fill="#10b981" />
              <circle cx="587" cy="230" r="3" fill="#10b981" />
              <circle cx="635" cy="230" r="3" fill="#10b981" />

              <!-- Callout: CLS fixed in July -->
              <g transform="translate(400, 110)">
                <line x1="-35" y1="120" x2="0" y2="15" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="3,3" />
                <rect x="-10" y="-14" width="125" height="34" rx="6" fill="#fef9c3" stroke="#facc15" stroke-width="1" />
                <text x="52" y="0" text-anchor="middle" font-size="8.5" font-weight="700" fill="#854d0e">CLS fixed in July</text>
                <text x="52" y="12" text-anchor="middle" font-size="7.5" fill="#a16207">0.43 → ~0.00</text>
              </g>

              <!-- Callout: LCP improved -->
              <g transform="translate(420, 165)">
                <line x1="-15" y1="-25" x2="0" y2="0" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3,3" />
                <rect x="-10" y="-14" width="125" height="34" rx="6" fill="#eff6ff" stroke="#93c5fd" stroke-width="1" />
                <text x="52" y="0" text-anchor="middle" font-size="8.5" font-weight="700" fill="#1e40af">LCP improved</text>
                <text x="52" y="12" text-anchor="middle" font-size="7.5" fill="#2563eb">2.57 s → 1.86 s</text>
              </g>
            </svg>
          </div>
          <div style="font-size: 0.62rem; color: #94a3b8; margin-top: 10px;">Chart values are read from the original report’s graph and are approximate.</div>
        </div>

        <!-- Section: Key Takeaways -->
        <div class="section-title">
          KEY TAKEAWAYS
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-top: 8px;">
          ${takeaways.map(t => `
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

  <!-- ================= PAGE 3 ================= -->
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
                      <span style="font-size: 0.65rem; font-weight: 700; color: ${fPass ? '#059669' : '#d97706'}; display: inline-flex; align-items: center; gap: 4px;">
                        <span>●</span> ${m.fStat}
                      </span>
                    </td>
                    <td style="padding: 9px 10px; text-align: center; font-weight: 800; color: #0f172a; font-size: 0.8rem;">${m.lVal}</td>
                    <td style="padding: 9px 10px; text-align: center;">
                      <span style="font-size: 0.65rem; font-weight: 700; color: ${lPass ? '#059669' : '#d97706'}; display: inline-flex; align-items: center; gap: 4px;">
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
          ${findings.map((f, idx) => `
            <div style="margin-bottom: ${idx === findings.length - 1 ? '0' : '12px'};">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 800; color: #0f172a;">
                <span style="color: ${f.color}; font-size: 11px;">●</span>
                <span>${f.title}</span>
              </div>
              <p style="margin: 2px 0 0 16px; font-size: 0.68rem; color: #475569; line-height: 1.35;">${f.desc}</p>
            </div>
          `).join('')}
        </div>

      </div>

      ${renderRunningFooter(3)}
    </div>
  </div>

</body>
</html>
  `;
}
