import React from "react";
import { string } from "prop-types";

import { DfpComponent } from "./index";

export const TopAd = ({ id }) => (
  <DfpComponent
    adType="res-ad-slot-size-300x250"
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
