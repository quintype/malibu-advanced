import React, { useEffect } from "react";
import { string, array } from "prop-types";
import { useSelector } from "react-redux";
import { useDfpSlot } from "../../utils";
import { get } from "lodash";
import "./dfp-component.m.css";

const DfpComponent = ({ adType, id, size, path }) => {
  const loadAdsSynchronously = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "load_ads_synchronously"], false)
  );

  const enableAds = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "enable_ads"], false)
  );
  useEffect(() => {
    if(!!enableAds) {
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
    }
  }, []);

  return !!enableAds && !!loadAdsSynchronously && <div styleName={`ad-slot ${adType}`} id={id}></div>;
};

DfpComponent.propTypes = {
  adType: string,
  id: string,
  size: array,
  path: string
};

export { DfpComponent };
