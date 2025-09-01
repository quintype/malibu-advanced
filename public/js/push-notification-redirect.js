(function () {
  "use strict";

  // Detect if app is currently running as installed PWA
  function isPWARunning() {
    return (
      window.matchMedia("(display-mode: standalone)").matches || // modern browsers
      window.navigator.standalone === true || // iOS Safari
      document.referrer.includes("android-app://") // Android fallback
    );
  }

  // Detect if PWA is installed (but may not be running)
  async function isPWAInstalled() {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) return true;
      }
      return isPWARunning();
    } catch (error) {
      console.log("Error checking PWA installation:", error);
      return false;
    }
  }

  // Ask for notification permission via OneSignal
  async function ensureNotificationsEnabled_old() {
    if (!window.OneSignal) {
      console.log("OneSignal not available");
      return;
    }

    const enabled = await window.OneSignal.isPushNotificationsEnabled();
    if (!enabled) {
      console.log("PWA installed but notifications not enabled → show prompt");
      await window.OneSignal.showSlidedownPrompt();
    } else {
      console.log("Notifications already enabled for this PWA");
    }
  }

  async function ensureNotificationsEnabled() {
    if (!window.OneSignal) {
      console.log("OneSignal not available");
      return;
    }

    const permission = Notification.permission;
    console.log("Notification.permission =", permission);

    if (permission === "granted") {
      console.log("✅ Notifications already allowed");
      return;
    }

    if (permission === "denied") {
      console.log("❌ Notifications are blocked, must be enabled in settings");
      return;
    }

    // Only when permission === "default"
    const enabled = await window.OneSignal.isPushNotificationsEnabled();
    if (!enabled) {
      console.log("⚠️ Notifications not enabled yet → showing OneSignal prompt");
      await window.OneSignal.showSlidedownPrompt();
    } else {
      console.log("✅ OneSignal already has notifications enabled");
    }
  }

  // Detect if current URL is a PN link
  function isPNLink() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("LOGGG isPNLink ---------", window.location.href, urlParams);
    return urlParams.has("path") || window.location.href.includes("/route-data.json?path=");
  }

  // Extract the target URL from PN link parameters
  function getTargetURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const targetURL = urlParams.get("path");
    return targetURL ? decodeURIComponent(targetURL) : "/";
  }

  // Attempt to open PWA with deep link
  function openPWAWithDeepLink(targetURL) {
    const deepLinkURL = `${window.location.origin}${targetURL}`;
    try {
      // Try using window.open with specific features
      const pwaWindow = window.open(deepLinkURL, "_blank", "standalone=yes");

      // If window.open doesn't work, try location change
      if (!pwaWindow || pwaWindow.closed) {
        window.location.href = deepLinkURL;
      }
    } catch (error) {
      console.log("Failed to open PWA, falling back to browser:", error);
      window.location.href = targetURL;
    }
  }

  // Redirect to target URL
  function redirectToURL(url) {
    window.location.href = url;
  }

  // Handle PN redirect
  async function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();
    console.log("PN link detected → redirecting to:", targetURL);

    // Case 1: If PWA is currently running, redirect within PWA
    if (isPWARunning()) {
      console.log("PWA is running → redirecting inside PWA");
      redirectToURL(targetURL);
      return;
    }

    // Case 2: Check if PWA is installed but not running
    try {
      const isInstalled = await isPWAInstalled();
      if (isInstalled) {
        console.log("PWA installed but not running → attempting deep link");
        openPWAWithDeepLink(targetURL);
      } else {
        console.log("PWA not installed → open in browser");
        redirectToURL(targetURL);
      }
    } catch (error) {
      console.log("Error checking PWA installation, fallback:", error);
      redirectToURL(targetURL);
    }
  }

  // Run when DOM ready
  async function initApp() {
    if (isPNLink()) {
      await handlePNRedirect();
    } else {
      const installed = await isPWAInstalled();
      if (installed) {
        console.log("Running as PWA → check notifications");
        ensureNotificationsEnabled();
      } else {
        console.log("Not a PWA installation → skip notification prompt");
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

  // ✅ Only prompt for notifications when the user actually installs the app
  window.addEventListener("appinstalled", () => {
    console.log("PWA was just installed → asking for notifications");
    ensureNotificationsEnabled();
  });
})();
