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
      // Check if service worker is registered
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length > 0) {
          return true;
        }
      }

      // Check if running in standalone mode (already installed and running)
      return isPWARunning();
    } catch (error) {
      console.log("Error checking PWA installation:", error);
      return false;
    }
  }

  // Detect if current URL is a PN link
  function isPNLink() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log("LOGGG isPNLink  Check for common PN link patterns ---------", window.location.href, urlParams);
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

  // Show OneSignal notification popup
  async function showNotificationPopup() {
    try {
      // Check if OneSignal is available
      if (!window.OneSignal) {
        console.log("OneSignal not available");
        return;
      }

      // Wait for OneSignal to be ready
      await window.OneSignal.isPushNotificationsEnabled();

      // Check if notifications are already enabled
      const isEnabled = await window.OneSignal.isPushNotificationsEnabled();

      if (isEnabled) {
        console.log("Notifications already enabled");
        return;
      }

      console.log("Showing OneSignal notification popup...");

      // Show the notification permission popup
      await window.OneSignal.showSlidedownPrompt();
    } catch (error) {
      console.log("Error showing notification popup:", error);
    }
  }

  // Handle PWA installation detection and show notification popup
  async function handlePWAInstallation() {
    try {
      const isInstalled = await isPWAInstalled();

      if (isInstalled) {
        console.log("PWA installation detected, showing notification popup...");

        // Add a delay to ensure OneSignal is fully loaded
        setTimeout(() => {
          showNotificationPopup();
        }, 3000);
      }
    } catch (error) {
      console.log("Error handling PWA installation:", error);
    }
  }

  // Handle PN redirect
  async function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();
    console.log("PN link detected → redirecting to:", targetURL);

    // Case 1: If PWA is currently running, redirect within PWA
    if (isPWARunning()) {
      console.log("PWA is running → redirecting within PWA");
      redirectToURL(targetURL);
      return;
    }

    // Case 2: Check if PWA is installed but not running
    try {
      const isInstalled = await isPWAInstalled();

      if (isInstalled) {
        console.log("PWA is installed but not running → attempting to open PWA");
        openPWAWithDeepLink(targetURL);
      } else {
        console.log("PWA not installed → redirecting to browser");
        redirectToURL(targetURL);
      }
    } catch (error) {
      console.log("Error checking PWA installation, falling back to browser:", error);
      redirectToURL(targetURL);
    }
  }

  // Initialize when DOM is ready
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        // Handle PN redirect if it's a PN link
        handlePNRedirect();
        
        // Handle PWA installation and notification prompt (only if not a PN link)
        if (!isPNLink()) {
          handlePWAInstallation();
        }
      });
    } else {
      // Handle PN redirect if it's a PN link
      handlePNRedirect();
      
      // Handle PWA installation and notification prompt (only if not a PN link)
      if (!isPNLink()) {
        handlePWAInstallation();
      }
    }
  }
  init();
})();
