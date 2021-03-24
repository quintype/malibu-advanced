import React, { useEffect } from "react";
import { string, array } from "prop-types";
import { useSelector } from "react-redux";
import { useDfpSlot } from "../../utils";
import { get } from "lodash";
import "./dfp-component.m.css";

const DfpComponent = ({ adType, id, size, path }) => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const loadAdsSynchronously = get(qtState, ["config", "publisher-attributes", "load_ads_synchronously"], false);
  const enableAds = get(qtState, ["config", "publisher-attributes", "enable_ads"], true);
  const currentPath = get(qtState, ["currentPath"], "/");

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

    if (window.googletag) {
      const googletag = window.googletag || {};

      googletag.cmd.push(function() {
        googletag.pubads().refresh();
      });
    } // will have to check if this is required
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
