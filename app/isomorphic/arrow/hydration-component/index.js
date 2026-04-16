import React, { useEffect, useRef } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import useNearScreen from "./useNearScreen";

import PropTypes from "prop-types";

const EMPTY_HTML = { __html: "" };
const isServer = typeof window === "undefined";

export const ProgressiveHydration = (props) => {
  const { children } = props;
  const ref = useRef(null);
  const rootRef = useRef(null);
  const isNearScreen = useNearScreen({ ref });

  useEffect(() => {
    const { current: el } = ref;
    // CLIENT:
    // If we want to force the hydration OR the element is near screen
    // then we hydrate the content to get the functionality ready
    if (!isNearScreen || !el) return;

    if (!rootRef.current) {
      if (el.hasChildNodes()) {
        rootRef.current = hydrateRoot(el, children);
        return;
      }
      rootRef.current = createRoot(el);
    }
    rootRef.current.render(children);
  }, [children, isNearScreen]);
  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

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
