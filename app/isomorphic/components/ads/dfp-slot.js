export const useDfpSlot = ({ path, size, id }) => {
  const googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];
  googletag.cmd.push(function() {
    googletag
      .defineSlot(path, size, id)
      .setTargeting("test", "lazyload")
      .addService(googletag.pubads());

    googletag.pubads().enableLazyLoad({
      fetchMarginPercent: 0,
      renderMarginPercent: 0,
      mobileScaling: 0
    });

    googletag.enableServices();
  });

  googletag.cmd.push(function() {
    googletag.display(id);
  });
};
