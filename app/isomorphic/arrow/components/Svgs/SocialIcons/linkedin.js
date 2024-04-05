import React from "react";
import PropTypes from "prop-types";

export const LinkedIn = ({ color = "#2867B2" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.571 2H3.424C2.638 2 2 2.647 2 3.442v17.116C2 21.353 2.638 22 3.424 22h17.147c.786 0 1.429-.647 1.429-1.442V3.442C22 2.647 21.357 2 20.571 2ZM8.045 19.143H5.08V9.598h2.97v9.545h-.005ZM6.563 8.295a1.72 1.72 0 0 1 0-3.438c.946 0 1.718.772 1.718 1.719 0 .95-.768 1.719-1.719 1.719Zm12.593 10.848h-2.964V14.5c0-1.107-.022-2.531-1.54-2.531-1.545 0-1.781 1.205-1.781 2.45v4.724H9.905V9.598h2.844v1.304h.04c.398-.75 1.366-1.54 2.808-1.54 3 0 3.558 1.977 3.558 4.549v5.232Z"
        fill={color}
      />
    </svg>
  );
};
LinkedIn.propTypes = {
  color: PropTypes.string
};
