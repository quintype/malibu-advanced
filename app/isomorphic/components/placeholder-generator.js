import get from "lodash.get";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

export const PlaceholderGenerator = () => {
  const placeholderDelay = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "placeholder_delay"], {})
  );

  useEffect(() => {
    setTimeout(function() {
      const script = document.createElement("script");
      script.src = "https://cdn.gumlet.com/gumlet.js/2.0/gumlet.min.js";
      const node = document.getElementsByTagName("script")[0];
      script.setAttribute("defer", "defer");
      node.parentNode.insertBefore(script, node);
    }, placeholderDelay * 1000);
  }, []);

  return <div />;
};
