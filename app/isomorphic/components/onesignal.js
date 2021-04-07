export const initOneSignalScript = () =>
  setTimeout(() => {
    const myScript = document.createElement("script");
    myScript.setAttribute("src", "https://cdn.onesignal.com/sdks/OneSignalSDK.js");
    myScript.setAttribute("defer", "true");
    const head = document.head;
    head.insertBefore(myScript, head.firstElementChild);
  }, 4000);
