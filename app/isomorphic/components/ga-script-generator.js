import get from "lodash/get";
import { useSelector } from "react-redux";

export const gaScriptGenerator = () => {
  const scriptDelay = parseInt(
    useSelector(state => get(state, ["qt", "config", "publisher-attributes", "google_analytics", "script_delay"]))
  );
  const gaId = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "google_analytics", "id"]));

  const timeout = setTimeout(function() {
    const script = document.createElement("script");
    script.src = "https://www.google-analytics.com/analytics.js";
    const node = document.getElementsByTagName("script")[0];
    node.parentNode.insertBefore(script, node);

    const ga =
      window.ga ||
      function() {
        (ga.q = ga.q || []).push(arguments);
      };
    ga.l = +new Date();
    ga("create", gaId, "auto");
    ga("send", "pageview");
    clearTimeout(timeout);
  }, scriptDelay * 1000);

  return null;
};
