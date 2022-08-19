import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { socialShareData } from "./social-share-data";
import { SocialSharePopup } from "../../Atoms/SocialSharePopup";
import "./social-share-template.m.css";
import { CloseIcon } from "../../Svgs/close-icon";
import { ShareIcon } from "../../Svgs/share-icon";
import { getTextColor } from "../../../utils/utils";
import camelcase from "lodash.camelcase";

const ShareItem = ({ name, url, icon, dataTestId }) => {
  return url ? (
    <li data-testid={dataTestId} styleName="icon">
      <a href={url} target="_blank" rel="noopener noreferrer" data-share-icon={name} aria-label="share-icon">
        {icon}
      </a>
    </li>
  ) : null;
};
ShareItem.propTypes = {
  name: PropTypes.string,
  url: PropTypes.string,
  icon: PropTypes.node,
  dataTestId: PropTypes.string
};

function getActionIcon(open, color) {
  if (!open) return <ShareIcon color={color} />;
  return <CloseIcon color={color} />;
}

export const SocialShareTemplate = (props) => {
  const {
    fbUrl = "",
    twitterUrl = "",
    linkedinUrl = "",
    whatsappUrl = "",
    vertical = false,
    theme,
    iconType = "plain-color-svg",
    open = false
  } = props;
  if (!fbUrl && !twitterUrl && !linkedinUrl && !whatsappUrl) return null;
  const iconShade = getTextColor(theme);
  const iconColor = iconShade === "dark" ? "#000000" : "#ffffff";
  const options = { fbUrl, twitterUrl, linkedinUrl, whatsappUrl, iconColor, iconType };
  const iconsList = socialShareData(options);
  const [isOpen, setIsOpen] = useState(open);
  const verticalShare = vertical ? "vertical" : "horizontal";

  useEffect(() => setIsOpen(open), [open]);

  const shareIcon = () => {
    return (
      <li styleName="icon" key="horizontal-0">
        <div onClick={clickHandler}>{getActionIcon(isOpen, iconColor)}</div>
      </li>
    );
  };

  const clickHandler = () => {
    setIsOpen(!isOpen);
  };

  const popUpWrapper = () => {
    return (
      <div styleName="tablet-view">
        {!isOpen && <ul styleName={`wrapper ${isOpen ? "open" : ""}`}>{shareIcon()}</ul>}
        {isOpen && (
          <>
            <div styleName="overlay" onClick={clickHandler}>
              <div className="arr--popup" styleName={`popup-wrapper ${isOpen ? "popup-open" : ""}`}>
                <SocialSharePopup
                  fbUrl={fbUrl}
                  twitterUrl={twitterUrl}
                  linkedinUrl={linkedinUrl}
                  whatsappUrl={whatsappUrl}
                  iconType={iconType}
                  theme={theme}
                  closePopup={() => {
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };
  const popupStyle = !isOpen && vertical ? "tablet-view-popup" : "";
  return (
    <div data-test-id={verticalShare} className="arr--share" styleName={`${iconShade} ${verticalShare} ${popupStyle}`}>
      <div styleName="desktop-view">
        <ul
          data-test-id={camelcase(iconType)}
          className="desktop-share-wrapper"
          styleName={`wrapper ${isOpen ? "open" : ""}`}>
          {shareIcon()}
          {iconsList.map((iconData, index) => (
            <ShareItem {...iconData} key={iconData.name} dataTestId={`card-share-${index}`} />
          ))}
        </ul>
      </div>
      {popUpWrapper()}
    </div>
  );
};

SocialShareTemplate.propTypes = {
  fbUrl: PropTypes.string,
  twitterUrl: PropTypes.string,
  linkedinUrl: PropTypes.string,
  whatsappUrl: PropTypes.string,
  vertical: PropTypes.bool,
  theme: PropTypes.string,
  iconType: PropTypes.string,
  open: PropTypes.boolean
};
