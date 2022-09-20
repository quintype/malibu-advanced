import React from "react";
import PropTypes from "prop-types";
import { getTextColor, sharePageUrl, clientWidth } from "../../../utils/utils";
import AuthorImage from "../../Atoms/AuthorImage";
import { SocialShareTemplate } from "../../Molecules/SocialShareTemplate/index";
import { SocialShare } from "@quintype/components";
import "./author-intro.m.css";
import { Facebook } from "../../Svgs/SocialIcons/facebook";
import { Youtube } from "../../Svgs/SocialIcons/youtube";
import { Twitter } from "../../Svgs/SocialIcons/twitter";
import { LinkedIn } from "../../Svgs/SocialIcons/linkedin";
import { Instagram } from "../../Svgs/SocialIcons/instagram";
import { WhatsApp } from "../../Svgs/SocialIcons/whatsapp";
import { Pinterest } from "../../Svgs/SocialIcons/pinterest";

const AuthorIntroductionCard = ({ data = {}, config = {}, template = "" }) => {
  const { theme = "", enableBio = true, enableSocialLinks = true, borderSupport = true } = config;
  const textColor = getTextColor(theme);
  const { name, bio, social } = data;
  const isSmallCircle = template === "smallCircle";
  const authorCardStyle = isSmallCircle ? "small-circle" : "default";
  const isMobile = clientWidth("mobile");
  const isFullWidth = !isSmallCircle ? "full-width-with-padding" : "";
  const supportBorder = isSmallCircle && borderSupport ? "border" : "";

  const getIcon = (item) => {
    switch (item) {
      case "twitter":
        return <Twitter />;
      case "facebook":
        return <Facebook />;
      case "youtube":
        return <Youtube />;
      case "linkedin":
        return <LinkedIn />;
      case "whatsapp":
        return <WhatsApp color="#4AC959" />;
      case "instagram":
        return <Instagram />;
      case "pinterest":
        return <Pinterest />;
    }
  };

  return (
    <div
      data-test-id="author-intro"
      className={`${isFullWidth} arrow-component arr--author-intro-card`}
      styleName={`${authorCardStyle} ${supportBorder} ${textColor}`}
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName={`wrapper ${textColor}`} className="arrow-author-intro-wrapper">
        <div styleName="introduction-card" className="arrow-author-introduction-card">
          {isSmallCircle && isMobile ? null : <h2 styleName={`author-name ${textColor}`}>{name}</h2>}
          {enableBio && bio && (
            <div data-test-id="author-bio" styleName={`author-description ${textColor}`}>
              {bio}
              {isSmallCircle && (
                <div
                  styleName="fade-out"
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent, ${theme})`,
                  }}
                ></div>
              )}
            </div>
          )}
          <div styleName="social-wrapper">
            <div styleName="social-connect-wrapper">
              {enableSocialLinks && social && (
                <>
                  {template !== "smallCircle" && <div styleName={`connect ${textColor}`}>Connect :</div>}
                  {Object.entries(social).map((item, index) =>
                    item.length > 0 && item[1] ? (
                      // can add Social Networks without the url so adding an additional check below
                      item[1].url ? (
                        <a
                          data-test-id="social-link"
                          href={item[1].url}
                          key={`${item}-${index}`}
                          rel="noopener noreferrer"
                          target="_blank"
                          styleName="social-share"
                        >
                          {getIcon(item[0])}
                        </a>
                      ) : null
                    ) : null
                  )}
                </>
              )}
            </div>
            {!isSmallCircle && (
              <SocialShare
                template={SocialShareTemplate}
                fullUrl={sharePageUrl}
                title={name}
                theme={theme}
                iconType="plain-svg"
              />
            )}
          </div>
        </div>
        <div styleName="author-image" className="arrow-author-image">
          <AuthorImage author={data} template={template} />
          {isSmallCircle && isMobile && <h2 styleName={`author-name ${textColor}`}>{name}</h2>}
        </div>
      </div>
    </div>
  );
};

AuthorIntroductionCard.propTypes = {
  data: PropTypes.shape({ name: PropTypes.string, bio: PropTypes.string, social: PropTypes.object }),
  config: PropTypes.shape({
    theme: PropTypes.string,
    enableBio: PropTypes.bool,
    enableSocialLinks: PropTypes.bool,
    borderSupport: PropTypes.bool,
  }),
  template: PropTypes.string,
};
export default AuthorIntroductionCard;
