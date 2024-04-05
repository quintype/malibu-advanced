import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import useNearScreen from "./useNearScreen";

import PropTypes from "prop-types";

const EMPTY_HTML = { __html: "" };
const isServer = typeof window === "undefined";

export const ProgressiveHydration = (props) => {
  const { children } = props;
  const ref = useRef(null);
  const isNearScreen = useNearScreen({ ref });

  useEffect(() => {
    const { current: el } = ref;
    // CLIENT:
    // If we want to force the hydration OR the element is near screen
    // then we hydrate the content to get the functionality ready
    if (isNearScreen) {
      const action = el.hasChildNodes() ? "hydrate" : "render";
      ReactDOM[action](children, el);
    }
  }, [children, isNearScreen]);

  // SERVER: Just render the content as usual
  if (isServer) {
    return <div ref={ref}>{children}</div>;
  }

  // CLIENT: Avoid hydration until we say so
  return <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={EMPTY_HTML} />;
};

ProgressiveHydration.propTypes = {
  children: PropTypes.element,
};
