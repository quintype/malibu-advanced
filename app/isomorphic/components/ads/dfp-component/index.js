import React, { useEffect } from "react";
import { string, array, object } from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { useDfpSlot } from "../utils";

import "./dfp-component.m.css";

const DfpComponent = ({ adStyleName, id, size, path, type = "", viewPortSizeMapping }) => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const adsConfig = get(qtState, ["config", "ads-config", "dfp_ads"], {});
  const loadAdsSynchronously = get(adsConfig, ["load_ads_synchronously"], null);
  const enableAds = get(adsConfig, ["enable_ads"], null);
  const currentPath = get(qtState, ["currentPath"], null);

  if (!enableAds) {
    return null;
  }

  useEffect(() => {
    if (loadAdsSynchronously) {
      useDfpSlot({
        path: path,
        size: size,
        id: id,
        qtState: qtState,
        type: type,
        viewPortSizeMapping: viewPortSizeMapping
      });
    } else {
      setTimeout(() => {
        useDfpSlot({
          path: path,
          size: size,
          id: id,
          qtState: qtState,
          type: type,
          viewPortSizeMapping: viewPortSizeMapping
        });
      }, 5000);
    }
  }, [currentPath]);

  return <div styleName={`ad-slot ${adStyleName}`} id={id} />;
};

DfpComponent.propTypes = {
  adStyleName: string,
  id: string,
  size: array,
  path: string,
  type: string,
  viewPortSizeMapping: array
};

export { DfpComponent };
