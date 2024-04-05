import React from "react";
import PropTypes from "prop-types";

export const Facebook = ({ color = "#1877F2" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22 12.06C22 6.504 17.524 2 12 2S2 6.503 2 12.06c0 5.022 3.657 9.185 8.438 9.94v-7.03h-2.54v-2.91h2.54V9.845c0-2.521 1.491-3.914 3.776-3.914 1.095 0 2.24.197 2.24.197V8.6h-1.262c-1.242 0-1.63.776-1.63 1.571v1.889h2.774l-.444 2.908h-2.33V22C18.343 21.245 22 17.082 22 12.06Z"
        fill={color}
      />
    </svg>
  );
};
Facebook.propTypes = {
  color: PropTypes.string,
};
