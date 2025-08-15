// PWA Installation Prompt
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Show custom install prompt
  if (!localStorage.getItem("installPromptShown")) {
    setTimeout(() => {
      showInstallPrompt();
    }, 3000);
  }
});

function showInstallPrompt() {
  if (deferredPrompt) {
    // Create a simple install prompt
    const installPrompt = document.createElement("div");
    installPrompt.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #2F3BA2;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    installPrompt.innerHTML = `
      <div>
        <strong>Install Malibu App</strong><br>
        <small>Get the best experience with our app</small>
      </div>
      <div>
        <button onclick="installApp()" style="background: white; color: #2F3BA2; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Install</button>
        <button onclick="dismissPrompt()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Dismiss</button>
      </div>
    `;

    document.body.appendChild(installPrompt);
  }
}

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      deferredPrompt = null;
      dismissPrompt();
    });
  }
}

function dismissPrompt() {
  const prompt = document.querySelector('div[style*="position: fixed"]');
  if (prompt) {
    prompt.remove();
  }
  localStorage.setItem("installPromptShown", "true");
}
