import React, { useEffect } from "react";
import { string, array } from "prop-types";

import { useDfpSlot } from "../../utils";

import "./dfp-component.m.css";

const DfpComponent = ({ adType, id, size, path }) => {
  useEffect(() => {
    setTimeout(() => {
      useDfpSlot({
        path: path,
        size: size,
        id: id
      });
    }, 4000);
  }, []);

  return <div styleName={`ad-slot ${adType}`} id={id}></div>;
};

DfpComponent.propTypes = {
  adType: string,
  id: string,
  size: array,
  path: string
};

export { DfpComponent };
