(function () {
  "use strict";

  // Detect if app is currently running as installed PWA
  function isPWARunning() {
    return (
      window.matchMedia("(display-mode: standalone)").matches || // modern browsers
      window.navigator.standalone === true || // iOS Safari
      document.referrer.includes("android-app://") || // Android fallback
      window.location.search.includes("utm_source=pwa") || // Custom PWA parameter
      window.location.hash.includes("pwa=true") // Custom PWA hash
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

  // Detect Safari specifically
  function isSafari() {
    const userAgent = navigator.userAgent;
    return /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  }

  // Attempt to open PWA with deep link - improved for Safari
  function openPWAWithDeepLink(targetURL) {
    const deepLinkURL = `${window.location.origin}${targetURL}`;
    console.log("Attempting to open PWA with deep link:", deepLinkURL);

    try {
      // For Safari, try different approaches
      if (isSafari()) {
        console.log("Safari detected, using Safari-specific deep linking");

        // Method 1: Try using window.open with specific features
        const pwaWindow = window.open(deepLinkURL, "_blank", "standalone=yes,scrollbars=yes,resizable=yes");

        // Method 2: If that doesn't work, try location change with a delay
        setTimeout(() => {
          if (!pwaWindow || pwaWindow.closed) {
            console.log("Safari PWA open failed, falling back to browser");
            window.location.href = deepLinkURL;
          }
        }, 100);
      } else {
        // For other browsers, use standard approach
        const pwaWindow = window.open(deepLinkURL, "_blank", "standalone=yes");

        if (!pwaWindow || pwaWindow.closed) {
          window.location.href = deepLinkURL;
        }
      }
    } catch (error) {
      console.log("Failed to open PWA, falling back to browser:", error);
      window.location.href = targetURL;
    }
  }

  // Ask for notification permission via OneSignal

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

  // Redirect to target URL
  function redirectToURL(url) {
    window.location.href = url;
  }

  // Handle PN redirect
  async function handlePNRedirect() {
    if (!isPNLink()) return;

    const targetURL = getTargetURL();
    console.log("PN link detected → redirecting to:", targetURL);
    console.log("Browser info:", navigator.userAgent);
    console.log("Is Safari:", isSafari());

    // Case 1: If PWA is currently running, redirect within PWA
    if (isPWARunning()) {
      console.log("PWA is running → redirecting inside PWA");
      redirectToURL(targetURL);
      return;
    }

    // Case 2: Check if PWA is installed but not running
    try {
      const isInstalled = await isPWAInstalled();
      console.log("PWA installed check result:", isInstalled);

      if (isInstalled) {
        console.log("PWA installed but not running → attempting deep link");

        // For Safari, try a more aggressive approach
        if (isSafari()) {
          console.log("Safari detected - trying multiple deep link methods");

          // Method 1: Try direct PWA URL with special parameters
          const safariPWAURL = `${window.location.origin}${targetURL}?utm_source=pwa&safari_deep_link=true`;
          window.location.href = safariPWAURL;

          // Method 2: Fallback after a short delay
          setTimeout(() => {
            console.log("Safari deep link fallback - trying standard approach");
            openPWAWithDeepLink(targetURL);
          }, 500);
        } else {
          openPWAWithDeepLink(targetURL);
        }
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
    console.log("Initializing PWA redirect logic...");
    console.log("Current URL:", window.location.href);
    console.log("Is PWA running:", isPWARunning());

    if (isPNLink()) {
      console.log("PN link detected, handling redirect...");
      await handlePNRedirect();
    } else {
      const installed = await isPWAInstalled();
      console.log("PWA installed status:", installed);

      if (installed) {
        console.log("Running as PWA → check notifications");
        ensureNotificationsEnabled();

        // Check if this is a Safari PWA launch from notification
        if (isSafari() && window.location.search.includes("safari_deep_link=true")) {
          console.log("Safari PWA launched from notification - cleaning up URL");
          // Clean up the URL by removing the deep link parameters
          const cleanURL = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, cleanURL);
        }
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

  // Debug function for troubleshooting PWA deep linking
  window.debugPWARedirect = function () {
    console.log("=== PWA Redirect Debug Info ===");
    console.log("Current URL:", window.location.href);
    console.log("User Agent:", navigator.userAgent);
    console.log("Is Safari:", isSafari());
    console.log("Is PWA Running:", isPWARunning());
    console.log("Is PN Link:", isPNLink());
    console.log("Target URL:", getTargetURL());
    console.log("Display Mode:", window.matchMedia("(display-mode: standalone)").matches);
    console.log("Navigator Standalone:", window.navigator.standalone);
    console.log("Document Referrer:", document.referrer);

    // Check service worker registrations
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log("Service Worker Registrations:", registrations.length);
        registrations.forEach((reg, index) => {
          console.log(`SW ${index}:`, reg.scope, reg.active ? "Active" : "Inactive");
        });
      });
    }

    // Check OneSignal status
    if (window.OneSignal) {
      window.OneSignal.isPushNotificationsEnabled().then((enabled) => {
        console.log("OneSignal Notifications Enabled:", enabled);
      });
    }

    console.log("=== End Debug Info ===");
  };

  // New function to check Service Worker status specifically for iOS Safari PWA
  window.checkServiceWorkerStatus = async function () {
    console.log("🔍 Checking Service Worker Status for iOS Safari PWA...");

    if (!("serviceWorker" in navigator)) {
      console.log("❌ Service Workers not supported in this browser");
      return;
    }

    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`📊 Found ${registrations.length} Service Worker registration(s)`);

      for (let i = 0; i < registrations.length; i++) {
        const reg = registrations[i];
        console.log(`\n🔧 Service Worker ${i + 1}:`);
        console.log(`   Scope: ${reg.scope}`);
        console.log(`   Active: ${reg.active ? "✅ Yes" : "❌ No"}`);
        console.log(`   Waiting: ${reg.waiting ? "⏳ Yes" : "❌ No"}`);
        console.log(`   Installing: ${reg.installing ? "📥 Yes" : "❌ No"}`);

        if (reg.active) {
          console.log(`   Active SW State: ${reg.active.state}`);
          console.log(`   Active SW Script URL: ${reg.active.scriptURL}`);
        }

        // Try to get status from the service worker
        if (reg.active) {
          try {
            const status = await new Promise((resolve, reject) => {
              const channel = new MessageChannel();
              const timeout = setTimeout(() => reject(new Error("Timeout")), 5000);

              channel.port1.onmessage = (event) => {
                clearTimeout(timeout);
                resolve(event.data);
              };

              reg.active.postMessage({ type: "GET_SW_STATUS" }, [channel.port2]);
            });

            console.log(`   📊 Service Worker Status:`, status);
          } catch (error) {
            console.log(`   ❌ Could not get SW status:`, error.message);
          }
        }
      }

      // Check if we're in a PWA context
      console.log(`\n📱 PWA Context Check:`);
      console.log(`   Display Mode Standalone: ${window.matchMedia("(display-mode: standalone)").matches}`);
      console.log(`   Navigator Standalone: ${navigator.standalone}`);
      console.log(`   Platform: ${navigator.platform}`);
      console.log(`   User Agent: ${navigator.userAgent}`);

      // Check if service worker is controlling this page
      if (navigator.serviceWorker.controller) {
        console.log(`\n🎯 Current Page Controller:`);
        console.log(`   Controller State: ${navigator.serviceWorker.controller.state}`);
        console.log(`   Controller Script: ${navigator.serviceWorker.controller.scriptURL}`);
      } else {
        console.log(`\n❌ No Service Worker controlling this page`);
      }
    } catch (error) {
      console.error("❌ Error checking service worker status:", error);
    }
  };

  // Function to read service worker logs from localStorage (iOS-friendly)
  window.getServiceWorkerLogs = function () {
    try {
      const logs = JSON.parse(localStorage.getItem("sw_logs") || "[]");

      if (logs.length === 0) {
        console.log("📝 No service worker logs found in localStorage");
        return [];
      }

      console.log(`📝 Found ${logs.length} service worker logs:`);
      logs.forEach((log, index) => {
        console.log(`\n📱 Log ${index + 1} (${log.timestamp}):`);
        console.log(`   Message: ${log.message}`);
        if (log.data) {
          console.log(`   Data:`, log.data);
        }
        console.log(`   Platform: ${log.platform}`);
      });

      return logs;
    } catch (error) {
      console.error("❌ Error reading service worker logs:", error);
      return [];
    }
  };

  // Function to clear service worker logs
  window.clearServiceWorkerLogs = function () {
    try {
      localStorage.removeItem("sw_logs");
      console.log("🗑️ Service worker logs cleared");
    } catch (error) {
      console.error("❌ Error clearing logs:", error);
    }
  };

  // Function to show service worker logs in a visual way (iOS-friendly)
  window.showServiceWorkerLogs = function () {
    try {
      const logs = JSON.parse(localStorage.getItem("sw_logs") || "[]");

      if (logs.length === 0) {
        alert("No service worker logs found");
        return;
      }

      // Create a simple visual display
      let logText = `Service Worker Logs (${logs.length} entries):\n\n`;
      logs.slice(-10).forEach((log, index) => {
        // Show last 10 logs
        logText += `${index + 1}. ${log.timestamp}\n`;
        logText += `   ${log.message}\n`;
        if (log.data) {
          logText += `   Data: ${JSON.stringify(log.data)}\n`;
        }
        logText += `\n`;
      });

      alert(logText);
    } catch (error) {
      alert("Error reading service worker logs: " + error.message);
    }
  };

  // Test function to verify service worker notifications work
  window.testServiceWorkerNotification = function () {
    console.log("🧪 Testing service worker notification...");

    if (!("serviceWorker" in navigator)) {
      alert("Service Workers not supported");
      return;
    }

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (registration && registration.active) {
          console.log("Sending test notification to service worker");
          registration.active.postMessage({ type: "TEST_NOTIFICATION" });
          alert("Test notification sent! Check if you see a notification.");
        } else {
          alert("No active service worker found");
        }
      })
      .catch((error) => {
        console.error("Error testing notification:", error);
        alert("Error: " + error.message);
      });
  };
})();
