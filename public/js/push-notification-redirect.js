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

  // Check if the current URL is a PN link
  function isPNLink() {
    const urlParams = new URLSearchParams(window.location.search);
    // Check for common PN link patterns
    return urlParams.has("path") || window.location.href.includes("/route-data.json?path=");
  }

  // Extract the target URL from PN link parameters
  function getTargetURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // Try different parameter names that might contain the target URL
    const targetURL =
      urlParams.get("url") || urlParams.get("target") || urlParams.get("redirect") || urlParams.get("link");

    if (targetURL) {
      return decodeURIComponent(targetURL);
    }

    // If no target URL found, redirect to home page
    return "/";
  }

  // Show simple PWA install prompt for PN links
  function showPWAInstallPrompt() {
    const promptId = "pwa-install-prompt";
    if (document.getElementById(promptId)) return;

    const installPrompt = document.createElement("div");
    installPrompt.id = promptId;
    installPrompt.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2F3BA2;
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    installPrompt.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto;">
        <h3 style="margin: 0 0 15px 0; font-size: 18px;">📱 Install App for Better Experience</h3>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="installPWA()" style="
            background: white;
            color: #2F3BA2;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
          ">Install App</button>
          <button onclick="dismissPWAInstallPrompt()" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Continue in Browser</button>
        </div>
      </div>
    `;

    document.body.appendChild(installPrompt);
  }

  // Dismiss PWA install prompt
  window.dismissPWAInstallPrompt = function () {
    const prompt = document.getElementById("pwa-install-prompt");
    if (prompt) {
      prompt.remove();
    }
    // Continue to target URL
    window.location.href = getTargetURL();
  };

  // Handle PWA installation
  window.installPWA = function () {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA installation");
          // Redirect to target URL after installation
          setTimeout(() => {
            window.location.href = getTargetURL();
          }, 2000);
        } else {
          console.log("User dismissed PWA installation");
          // Still redirect to target URL
          setTimeout(() => {
            window.location.href = getTargetURL();
          }, 1000);
        }
        window.deferredPrompt = null;

        // Remove prompt
        const prompt = document.getElementById("pwa-install-prompt");
        if (prompt) prompt.remove();
      });
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      console.log("PWA installation not available");
      setTimeout(() => {
        window.location.href = getTargetURL();
      }, 1000);
    }
  };

  // Main redirect logic
  function handlePNRedirect() {
    if (!isPNLink()) return;
    console.log("Handling PN redirect to:", getTargetURL());

    const targetURL = getTargetURL();

    // If PWA is already installed, redirect directly
    if (isPWAInstalled()) {
      window.location.href = targetURL;
      return;
    }

    // Show PWA install prompt
    showPWAInstallPrompt();
  }

  // Listen for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
    console.log("PWA installation prompt available");
  });

  // Handle app installation success
  window.addEventListener("appinstalled", (evt) => {
    console.log("PWA installed successfully");
    // Redirect to target URL after successful installation
    setTimeout(() => {
      window.location.href = getTargetURL();
    }, 1500);
  });

  // Run the redirect logic when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handlePNRedirect);
  } else {
    handlePNRedirect();
  }

  // Also handle cases where the script loads after DOM is ready
  if (document.readyState === "complete" || document.readyState === "interactive") {
    handlePNRedirect();
  }
})();
