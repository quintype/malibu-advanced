import React, { createContext, useContext } from "react";

export const StateContext = createContext();

// eslint-disable-next-line react/display-name
export const StateProvider = (RowComponent) => (props) =>
 (
    // eslint-disable-next-line react/prop-types
     <StateContext.Provider value={props.config}>
      <RowComponent {...props} />
     </StateContext.Provider>
 );

export const useStateValue = () => useContext(StateContext);
