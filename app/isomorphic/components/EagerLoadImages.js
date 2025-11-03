import React, { createContext } from "react";
import { func, node } from "prop-types";

// React 19 compatible context to replace legacy childContextTypes API
const EagerLoadImagesContext = createContext({
  lazyLoadEagerPredicate: () => true,
});

/**
 * React 19 compatible EagerLoadImages component
 * This component replaces the legacy @quintype/components EagerLoadImages
 * which used childContextTypes (removed in React 19)
 */
export const EagerLoadImages = ({ predicate, children }) => {
  const predicateFunction = predicate || (() => true);

  return (
    <EagerLoadImagesContext.Provider value={{ lazyLoadEagerPredicate: predicateFunction }}>
      {children}
    </EagerLoadImagesContext.Provider>
  );
};

EagerLoadImages.propTypes = {
  predicate: func,
  children: node,
};

// Export the context so children components can consume it
export { EagerLoadImagesContext };

