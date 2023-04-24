import React, { useEffect } from "react";
import { func } from "prop-types";
import { AppLogo } from "../../app-logo";

import "./top-bar.m.css";

const TopBar = ({ initAccessType }) => {
  useEffect(() => {
    initAccessType(() => console.log("Accesstype is initialized in topbar"));
  }, []);

  return (
    <div styleName="main-wrapper">
      <div className="container topbar-wrapper">
        <h1>
          <AppLogo />
        </h1>
        <div id="search-bar"></div>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  initAccessType: func,
};

export { TopBar };
