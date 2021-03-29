import React, { useEffect } from "react";
import { string, array } from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { useDfpSlot } from "../utils";

import "./dfp-component.m.css";

const DfpComponent = ({ adType, id, size, path }) => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const publisherAttributes = get(qtState, ["config", "publisher-attributes"]) || {};
  const loadAdsSynchronously = get(publisherAttributes, ["dfp_ads", "load_ads_synchronously"], false);
  const enableAds = get(publisherAttributes, ["dfp_ads", "enable_ads"], true);
  const currentPath = useSelector(state => get(state, ["qt", "currentPath"], "/"));

  if (!enableAds) {
    return null;
  }

  useEffect(() => {
    if (loadAdsSynchronously) {
      useDfpSlot({
        path: path,
        size: size,
        id: id,
        qtState: qtState
      });
    } else {
      setTimeout(() => {
        useDfpSlot({
          path: path,
          size: size,
          id: id,
          qtState: qtState
        });
      }, 5000);
    }
  }, [currentPath]);

  return <div styleName={`ad-slot ${adType}`} id={id} />;
};

DfpComponent.propTypes = {
  adType: string,
  id: string,
  size: array,
  path: string
};

export { DfpComponent };
