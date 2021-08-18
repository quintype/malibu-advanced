import get from "lodash/get";
import { useSelector } from "react-redux";

export const gtmScriptGenerator = () => {
  const scriptDelay = parseInt(
    useSelector(state => get(state, ["qt", "config", "publisher-attributes", "google_tag_manager", "script_delay"]))
  );

  const gtmId = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "google_tag_manager", "id"]));

  const timeout = setTimeout(function() {
    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js"
      });
      var f = d.getElementsByTagName(s)[0];
      var j = d.createElement(s);
      var dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", gtmId);
    clearTimeout(timeout);
  }, scriptDelay * 1000);

  return null;
};
