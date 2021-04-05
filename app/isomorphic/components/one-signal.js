import { useEffect } from "react";

export const OneSignal = () => {
  useEffect(() => {
    const myScript = document.createElement("script");
    myScript.setAttribute("src", "https://cdn.onesignal.com/sdks/OneSignalSDK.js");
    myScript.setAttribute("async", "true");
    const head = document.head;
    head.insertBefore(myScript, head.firstElementChild);
  }, []);
  return null;
};
