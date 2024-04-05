import React from "react";
import { Twitter } from "../../Svgs/SocialIcons/twitter";
import { Facebook } from "../../Svgs/SocialIcons/facebook";
import { LinkedIn } from "../../Svgs/SocialIcons/linkedin";
import { WhatsApp } from "../../Svgs/SocialIcons/whatsapp";

const getSocialIcons = (color, iconType) => {
  switch (iconType) {
    case "plain-color-svg":
      return {
        facebook: <Facebook key={iconType} />,
        twitter: <Twitter key={iconType} color={color} />,
        linkedin: <LinkedIn key={iconType} />,
        whatsapp: <WhatsApp key={iconType} />,
      };

    default:
      return {
        facebook: <Facebook color={color} key={iconType} />,
        twitter: <Twitter color={color} key={iconType} />,
        linkedin: <LinkedIn color={color} key={iconType} />,
        whatsapp: <WhatsApp color={color} key={iconType} />,
      };
  }
};

export const socialShareData = ({ fbUrl, twitterUrl, linkedinUrl, whatsappUrl, iconColor, iconType = "plain-svg" }) => {
  const socialIcons = getSocialIcons(iconColor, iconType);
  const getOptions = () => {
    return [
      {
        name: "facebook",
        url: fbUrl,
        icon: socialIcons.facebook,
        text: "Facebook",
        bgColor: "#4e71a8",
        alt: "fb icon",
      },
      {
        name: "twitter",
        url: twitterUrl,
        icon: socialIcons.twitter,
        text: "Twitter",
        bgColor: "#1db7eb",
        alt: "twitter icon",
      },
      {
        name: "linkedin",
        url: linkedinUrl,
        icon: socialIcons.linkedin,
        text: "LinkedIn",
        bgColor: "#0077B5",
        alt: "linkedin icon",
      },
      {
        name: "whatsapp",
        url: whatsappUrl,
        icon: socialIcons.whatsapp,
        text: "Whatsapp",
        bgColor: "#25d366",
        alt: "whatsapp share",
      },
    ];
  };
  return getOptions();
};
