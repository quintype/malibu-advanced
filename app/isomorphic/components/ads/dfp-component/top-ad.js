import React, { useEffect } from "react";
import { object } from "prop-types";
import { connect } from "react-redux";
import { get } from "lodash";

import { DfpComponent } from ".";

const TopAdbase = ({ currentPath }) => {
  useEffect(() => {
    if (window.googletag) {
      const googletag = window.googletag || {};

      googletag.cmd.push(function() {
        googletag.pubads().refresh();
      });
    }
  }, [currentPath]);

  return (
    <DfpComponent
      adType="ad-slot-size-250x250"
      id="banner-ad"
      path="/6355419/Travel/Europe/France/Paris"
      size={[300, 250]}
    />
  );
};

const mapStateToProps = state => ({
  currentPath: get(state, ["qt", "currentPath"], "/")
});

TopAdbase.propTypes = {
  currentPath: object
};

export const TopAd = connect(mapStateToProps, () => ({}))(TopAdbase);
