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

  // Check if we're on a mobile device
  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Check if the current URL is a PN link (you can customize this logic)
  function isPNLink() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);

    // Check for common PN link patterns
    return (
      urlParams.has("pn") ||
      urlParams.has("push") ||
      urlParams.has("notification") ||
      url.includes("/pn/") ||
      url.includes("/push/") ||
      url.includes("/notification/")
    );
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

  // Show PWA installation prompt if not installed
  function showPWAInstallPrompt() {
    if (isPWAInstalled()) return;

    const installPrompt = document.createElement("div");
    installPrompt.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2F3BA2;
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

    installPrompt.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; max-width: 600px; margin: 0 auto;">
        <div>
          <strong>📱 Install App for Better Experience</strong><br>
          <small>Get instant access and better performance</small>
        </div>
        <div>
          <button onclick="installPWA()" style="background: white; color: #2F3BA2; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px; font-weight: bold;">Install</button>
          <button onclick="dismissPWAInstall()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Skip</button>
        </div>
      </div>
    `;

    document.body.appendChild(installPrompt);
  }

  // Dismiss PWA install prompt
  window.dismissPWAInstall = function () {
    const prompt = document.querySelector('div[style*="position: fixed"]');
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
          }, 1000);
        }
        window.deferredPrompt = null;
        window.dismissPWAInstall();
      });
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      window.dismissPWAInstall();
      window.location.href = getTargetURL();
    }
  };

  // Main redirect logic
  function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();

    // If PWA is already installed, redirect directly
    if (isPWAInstalled()) {
      window.location.href = targetURL;
      return;
    }

    // If on mobile and PWA not installed, show install prompt
    if (isMobileDevice()) {
      showPWAInstallPrompt();
      return;
    }

    // If on desktop, redirect to target URL (desktop users can install manually)
    window.location.href = targetURL;
  }

  // Listen for beforeinstallprompt event
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredPrompt = e;
  });

  // Handle app installation success
  window.addEventListener("appinstalled", (evt) => {
    console.log("PWA installed successfully");
    // Redirect to target URL after successful installation
    setTimeout(() => {
      window.location.href = getTargetURL();
    }, 500);
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
