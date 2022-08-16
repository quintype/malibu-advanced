import React from "react";
import PropTypes from "prop-types";
import "./ads.m.css";

export const AdPlaceholder = ({ height, width }) => {
  return (
    <div className="arr--ad-wrapper" styleName="ad-wrapper">
      <div styleName="ads" style={{ height: height, width: width }}>
        <h3 styleName="ad-text">LEADERBOARD </h3>
      </div>
    </div>
  );
};

AdPlaceholder.propTypes = {
  // height of ad
  height: PropTypes.string,
  // width of ad
  width: PropTypes.string
};

AdPlaceholder.defaultProps = {
  width: "720px",
  height: "90px"
};
