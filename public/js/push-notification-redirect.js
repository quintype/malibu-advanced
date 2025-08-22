// Push Notification Redirect Handler
// This script handles redirecting users from PN links to the PWA

(function () {
  "use strict";

  // Check if the app is already installed as PWA
  function isPWAInstalled() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://")
    );
  }

  // Check if PWA is currently running
  function isPWARunning() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  // Check if the current URL is a PN link
  function isPNLink() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("path") || window.location.href.includes("/route-data.json?path=");
  }

  // Extract the target URL from PN link parameters
  function getTargetURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetURL =
      urlParams.get("url") || urlParams.get("target") || urlParams.get("redirect") || urlParams.get("link");
    return targetURL ? decodeURIComponent(targetURL) : "/";
  }

  // Main redirect logic
  function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();
    console.log("Handling PN redirect to:", targetURL);

    // If PWA is currently running, redirect directly
    if (isPWARunning()) {
      window.location.href = targetURL;
      return;
    }

    // If PWA is installed but not running, try to open it
    if (isPWAInstalled()) {
      // Try to open the PWA with the target URL
      const pwaURL = window.location.origin + targetURL;
      window.location.href = pwaURL;
    }
  }

  // Run the redirect logic when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handlePNRedirect);
  } else {
    handlePNRedirect();
  }
})();
