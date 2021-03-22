import React from "react";
import { string } from "prop-types";
import "./dfp-component.m.css";

const DfpComponent = ({adType, id}) => {
  return (
      <div styleName={`ad-slot ${adType}`} id={id}></div>
  );
};

DfpComponent.propTypes = {
  adType: string,
  id: string
};

export { DfpComponent };
