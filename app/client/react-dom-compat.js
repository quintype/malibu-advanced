//react 18/19 compatibility shim for older code expecting ReactDOM.hydrate/render
import * as ReactDOMActual from "react-dom/raw";
import { createRoot, hydrateRoot } from "react-dom/client";

//provide default export with hydrate/render methods expected by legacy code
const ReactDOMCompat = {
  ...ReactDOMActual,
  hydrate(element, container) {
    //returns a root-like object in React 18/19
    return hydrateRoot(container, element);
  },
  render(element, container) {
    const root = createRoot(container);
    root.render(element);
    return root;
  },
};

export default ReactDOMCompat;

//they'll get shimmed version instead of the native one
export * from "react-dom/raw";

//create root 18 for the dom container;render component "element" into it ; return root object to maintain compatibility
export const hydrate = (element, container) => hydrateRoot(container, element);
export const render = (element, container) => {
  const root = createRoot(container);
  root.render(element);
  return root;
};

