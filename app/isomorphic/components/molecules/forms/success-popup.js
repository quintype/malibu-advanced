import React from "react";
import { string } from "prop-types";

import "./forms.m.css";

const SuccessPopup = ({ message }) => (
  <div styleName="success-popup-wrapper">
    <p styleName="otp-text">{message}</p>
  </div>
);

SuccessPopup.propTypes = {
  message: string
};

export default SuccessPopup;
