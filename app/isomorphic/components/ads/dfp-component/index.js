import React, { useEffect } from "react";
import { string, array } from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { useDfpSlot } from "../../utils";

import "./dfp-component.m.css";

const DfpComponent = ({ adType, id, size, path }) => {
  const loadAdsSynchronously = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "load_ads_synchronously"], false)
  );

  const enableAds = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enable_ads"], true));

  if (!enableAds) {
    return null;
  }

  useEffect(() => {
    if (loadAdsSynchronously) {
      useDfpSlot({
        path: path,
        size: size,
        id: id
      });
    } else {
      setTimeout(() => {
        useDfpSlot({
          path: path,
          size: size,
          id: id
        });
      }, 4000);
    }
  }, []);

  return <div styleName={`ad-slot ${adType}`} id={id} />;
};

DfpComponent.propTypes = {
  adType: string,
  id: string,
  size: array,
  path: string
};

export { DfpComponent };
