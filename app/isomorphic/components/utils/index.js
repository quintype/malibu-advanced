export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

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

    googletag.pubads().addEventListener("slotRequested", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "fetched");
    });

    googletag.pubads().addEventListener("slotOnload", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "rendered");
    });

    googletag.enableServices();
  });

  googletag.cmd.push(function() {
    googletag.display(id);
  });

  function updateSlotStatus(slotId, state) {
    var elem = document.getElementById(slotId + "-" + state);
    if (elem) {
      elem.className = "activated";
      elem.innerText = "Yes";
    }
  }
};
