function handleFeedRefresh() {
  const start = performance.now();
  let total = 0;
  for (let i = 0; i < 9000000; i++) {
    total += (i % 7) * Math.cos(i);
  }
  const container = document.getElementById('articles-container');
  container.textContent = `Feed refreshed with ${total.toFixed(0)} items in ${(performance.now() - start).toFixed(1)}ms`;
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('refresh-feed-btn');
  if (btn) btn.addEventListener('click', handleFeedRefresh);
});


// Late layout changes with a different structure from demo-app: the cover src is assigned from data-src
// after load (no size reserved), and a strip is inserted with insertBefore into the ticker slot.
document.addEventListener('DOMContentLoaded', () => {
  const cover = document.getElementById('alt-news-cover');
  const tickerSlot = document.getElementById('news-ticker-slot');

  setTimeout(() => {
    cover.src = cover.dataset.src;
  }, 400);

  setTimeout(() => {
    const strip = document.createElement('section');
    strip.className = 'breaking-strip';
    strip.textContent = 'Breaking: feed updated';
    tickerSlot.insertBefore(strip, tickerSlot.firstChild);
  }, 1100);
});
