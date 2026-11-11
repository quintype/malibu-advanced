// CWV Inspector Demo App Scripts
// Designed with deterministic INP, LCP, and CLS characteristics for testing

let taskCount = 0;
// Fixed fixture data is built once at page startup, so each one-key filter
// interaction starts from the same 8,000 products without lazy-init cost.
const PRODUCT_DATASET = Array.from({ length: 8000 }, (_, i) => ({
  id: i,
  title: `Product Title #${i}`,
  category: `Category ${i % 10}`
}));

/**
 * Heavy synchronous task that triggers long task processing (> 50ms)
 * and forced synchronous layout calculation (layout thrashing).
 */
function handleSlowButtonClick(event) {
  const start = performance.now();
  const counterEl = document.getElementById('counter');
  const btn = document.getElementById('slow-click-btn');

  // 1. Heavy synchronous CPU loop (~350ms on standard CPU, ~400-500ms on 4x throttle)
  let sum = 0;
  for (let i = 0; i < 14000000; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }

  // 2. Real forced synchronous layout calculation (Layout Thrashing)
  // Repeatedly writing styles that dirty layout, then immediately reading layout metrics
  // forces the browser into repeated synchronous reflows, causing forcedStyleAndLayoutDuration > 0
  let forcedDimsTotal = 0;
  for (let j = 0; j < 100; j++) {
    btn.style.width = `${180 + (j % 30)}px`;
    forcedDimsTotal += btn.offsetHeight; // layout read forcing synchronous layout
    btn.style.paddingLeft = `${10 + (j % 12)}px`;
    forcedDimsTotal += btn.getBoundingClientRect().width; // layout read forcing another reflow
  }

  taskCount++;
  counterEl.textContent = `Tasks completed: ${taskCount} (calc: ${sum.toFixed(1)}, forcedLayoutSum: ${forcedDimsTotal.toFixed(0)})`;

  const elapsed = performance.now() - start;
  console.log(`[DemoApp] handleSlowButtonClick completed in ${elapsed.toFixed(1)}ms`);
}

/**
 * Handles text input with moderate processing.
 */
function handleSearchInput(event) {
  const query = event.target.value;
  const resultsEl = document.getElementById('search-results');

  // Moderate filtering loop
  const items = Array.from({ length: 5000 }, (_, i) => `Result item #${i} matching "${query}"`);
  const filtered = items.filter(item => item.includes(query)).slice(0, 5);

  resultsEl.textContent = filtered.join(', ');
}

/**
 * Handles menu toggle interaction.
 */
function handleMenuToggle(event) {
  const menu = document.getElementById('nav-menu');
  menu.classList.toggle('open');
}

/**
 * Interactive filter for product list matching ProductList.jsx.
 * Unmemoized synchronous filter causing measurable interaction delay.
 */
function handleProductFilterInput(event) {
  const query = event.target.value;
  const start = performance.now();

  // Deterministic filter loop matching React component logic. No early return;
  // each query scans the complete, fixed dataset rather than prior results.
  const filtered = PRODUCT_DATASET.filter(p => {
    let matches = false;
    for (let j = 0; j < 300; j++) {
      matches = p.title.toLowerCase().includes(query.toLowerCase());
    }
    return matches;
  });

  const elapsed = performance.now() - start;
  const end = performance.now();
  console.log(`[DemoApp] handleProductFilterInput query=${JSON.stringify(query)} arrayLength=${PRODUCT_DATASET.length} heavyBranch=true unchangedEarlyReturn=false narrowedInput=false start=${start.toFixed(1)} end=${end.toFixed(1)} filtered=${filtered.length} duration=${elapsed.toFixed(1)}ms`);
}

/**
 * Late banner injection to cause an intentional layout shift after load.
 * Injected at 1500ms into an unreserved slot (min-height: 0).
 */
function injectLateBanner() {
  setTimeout(() => {
    const slot = document.getElementById('dynamic-banner-slot');
    if (slot && !slot.hasChildNodes()) {
      window.__banner_injected_time = performance.now();
      const banner = document.createElement('div');
      banner.className = 'injected-banner';
      banner.textContent = '⚡ Breaking Announcement: Late injected content causing layout shift!';
      slot.appendChild(banner);
      console.log(`[DemoApp] Late banner injected into DOM at ${window.__banner_injected_time.toFixed(1)}ms`);
    }
  }, 1500);
}

// Wire up event listeners
document.addEventListener('DOMContentLoaded', () => {
  const slowBtn = document.getElementById('slow-click-btn');
  if (slowBtn) {
    slowBtn.addEventListener('click', handleSlowButtonClick);
  }

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchInput);
  }

  const filterInput = document.getElementById('filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', handleProductFilterInput);
  }

  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', handleMenuToggle);
  }

  injectLateBanner();
});

