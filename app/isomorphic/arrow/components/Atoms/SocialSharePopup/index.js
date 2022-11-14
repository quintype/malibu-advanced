import React from "react";
import PropTypes from "prop-types";
import "./social-share-popup.m.css";
import { CloseIcon } from "../../Svgs/close-icon";
import { socialShareData } from "../../Molecules/SocialShareTemplate/social-share-data";
import { getTextColor } from "../../../utils/utils";

const popupSocialShareItem = (url, icon, text, index) => {
  return url ? (
    <li styleName="social-icon-wrapper" data-testid={text} key={`popup-item-${index}`}>
      <a href={url} target="_blank" rel="noopener noreferrer" styleName="social-wrapper" aria-label="social-icon">
        {icon}
        <span styleName="social-text">{text}</span>
      </a>
    </li>
  ) : null;
};

export const SocialSharePopup = ({
  fbUrl = "",
  twitterUrl = "",
  linkedinUrl = "",
  whatsappUrl = "",
  theme,
  closePopup = "",
  iconType = "plain-color-svg",
}) => {
  const textColor = getTextColor(theme);
  const iconColor = textColor === "dark" ? "#000000" : "#ffffff";
  const options = { fbUrl, twitterUrl, linkedinUrl, whatsappUrl, iconColor, iconType };
  const popupItemsList = socialShareData(options);
  return (
    <div styleName={`share-popup-wrapper ${textColor}`}>
      <div styleName="share-popup">
        <div styleName="top-bar">
          <span styleName="share-text">Share via</span>
          <span styleName="close" onClick={closePopup}>
            <CloseIcon color={iconColor} />
          </span>
        </div>
        <ul styleName="wrapper">
          {popupItemsList.map(({ url, icon, text, bgColor, alt }, index) =>
            popupSocialShareItem(url, icon, text, bgColor, alt)
          )}
        </ul>
      </div>
    </div>
  );
};

SocialSharePopup.propTypes = {
  fbUrl: PropTypes.string,
  twitterUrl: PropTypes.string,
  linkedinUrl: PropTypes.string,
  whatsappUrl: PropTypes.string,
  grey: PropTypes.string,
  primaryColor: PropTypes.string,
  closePopup: PropTypes.bool,
  theme: PropTypes.string,
  iconType: PropTypes.string,
};
