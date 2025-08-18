// Push Notification Redirect Handler
// This script handles redirecting users from PN links to the PWA
// and adds desktop icon when users opt for push notifications

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

  // Check if we're on desktop
  function isDesktopDevice() {
    return !isMobileDevice();
  }

  // Check if the current URL is a PN link (you can customize this logic)
  function isPNLink() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);

    // Check for common PN link patterns
    return urlParams.has("path") || url.includes("/route-data.json?path=");
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

  // Check if push notifications are supported
  function isPushNotificationSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  // Check if push notification permission is granted
  function getPushNotificationPermission() {
    if (!isPushNotificationSupported()) return "unsupported";
    return Notification.permission;
  }

  // Request push notification permission
  async function requestPushNotificationPermission() {
    if (!isPushNotificationSupported()) {
      console.log("Push notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting push notification permission:", error);
      return false;
    }
  }

  // Show enhanced prompt with push notification and PWA installation options
  function showEnhancedPrompt() {
    if (isPWAInstalled()) return;

    const promptId = "enhanced-pwa-prompt";
    if (document.getElementById(promptId)) return; // Prevent duplicate prompts

    const installPrompt = document.createElement("div");
    installPrompt.id = promptId;
    installPrompt.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #2F3BA2 0%, #1a237e 100%);
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;

    const pushSupported = isPushNotificationSupported();
    const pushPermission = getPushNotificationPermission();

    let promptContent = `
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; font-size: 18px;">🚀 Enhanced Experience</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Get the best experience with our app</p>
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
    `;

    // Add push notification button if supported and not already granted
    if (pushSupported && pushPermission !== "granted") {
      promptContent += `
        <button onclick="requestPushNotifications()" style="
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
          transition: background 0.3s;
        " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
          🔔 Enable Notifications
        </button>
      `;
    }

    // Add PWA install button
    promptContent += `
      <button onclick="installPWA()" style="
        background: white;
        color: #2F3BA2;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 14px;
        transition: background 0.3s;
      " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
        📱 Install App
      </button>
      <button onclick="dismissEnhancedPrompt()" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 12px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
        Skip
      </button>
    `;

    promptContent += `
        </div>
        ${
          pushPermission === "granted"
            ? '<p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">✅ Notifications enabled</p>'
            : ""
        }
      </div>
    `;

    installPrompt.innerHTML = promptContent;
    document.body.appendChild(installPrompt);
  }

  // Dismiss enhanced prompt
  window.dismissEnhancedPrompt = function () {
    const prompt = document.getElementById("enhanced-pwa-prompt");
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
          showSuccessMessage("App installed successfully!");
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

        // Remove any existing prompts
        const prompts = document.querySelectorAll("#enhanced-pwa-prompt, #desktop-install-prompt");
        prompts.forEach((prompt) => prompt.remove());
      });
    } else {
      // Fallback for browsers that don't support beforeinstallprompt
      console.log("PWA installation not available");
      showSuccessMessage("Redirecting to app...");
      setTimeout(() => {
        window.location.href = getTargetURL();
      }, 1000);
    }
  };

  // Handle push notification permission request
  window.requestPushNotifications = async function () {
    const granted = await requestPushNotificationPermission();

    if (granted) {
      console.log("Push notification permission granted");

      // For desktop users, trigger PWA installation after push notification permission
      if (isDesktopDevice()) {
        showDesktopInstallPrompt();
      } else {
        // For mobile users, show success message and continue
        showSuccessMessage("Notifications enabled! Installing app...");
        setTimeout(() => {
          window.installPWA();
        }, 1500);
      }
    } else {
      console.log("Push notification permission denied");
      // Still offer PWA installation
      window.installPWA();
    }
  };

  // Show desktop-specific install prompt
  function showDesktopInstallPrompt() {
    const promptId = "desktop-install-prompt";
    if (document.getElementById(promptId)) return;

    const installPrompt = document.createElement("div");
    installPrompt.id = promptId;
    installPrompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      color: #333;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      z-index: 10001;
      max-width: 400px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    installPrompt.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
        <h3 style="margin: 0 0 10px 0; color: #2F3BA2;">Great! Notifications Enabled</h3>
        <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
          Now let's add the app to your desktop for quick access and better experience.
        </p>
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button onclick="installPWA()" style="
          background: #2F3BA2;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 14px;
        ">Add to Desktop</button>
        <button onclick="dismissDesktopPrompt()" style="
          background: transparent;
          color: #666;
          border: 1px solid #ddd;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">Skip</button>
      </div>
    `;

    document.body.appendChild(installPrompt);
  }

  // Dismiss desktop install prompt
  window.dismissDesktopPrompt = function () {
    const prompt = document.getElementById("desktop-install-prompt");
    if (prompt) {
      prompt.remove();
    }
    window.location.href = getTargetURL();
  };

  // Show success message
  function showSuccessMessage(message) {
    const messageId = "success-message";
    if (document.getElementById(messageId)) return;

    const successDiv = document.createElement("div");
    successDiv.id = messageId;
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      z-index: 10002;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `;

    successDiv.innerHTML = `
      <style>
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      </style>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 18px;">✅</span>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(successDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.remove();
      }
    }, 3000);
  }

  // Main redirect logic
  function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();

    // If PWA is already installed, redirect directly
    if (isPWAInstalled()) {
      window.location.href = targetURL;
      return;
    }

    // Show enhanced prompt for both mobile and desktop
    showEnhancedPrompt();
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
    showSuccessMessage("App installed successfully!");
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
