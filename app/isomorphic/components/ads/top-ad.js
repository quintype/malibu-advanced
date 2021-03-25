import React from "react";
import { string } from "prop-types";

import { DfpComponent } from "./dfp-component";

export const TopAd = ({ id }) => (
  <DfpComponent
    adType="ad-slot-size-320x50"
    id={id}
    path="/5463099287/BannerAd"
    size={[
      [320, 50],
      [728, 90]
    ]}
  />
);

TopAd.propTypes = {
  id: string
};
