/* eslint-disable no-unused-vars */
import React from "react";

const WithSSO = ({ ssoHost, redirectUrl, callbackUrl, signInPath, signUpPath, children }) => {
  const formUrl = path => {
    if (!path) {
      return null;
    }

    const url = new URL(`${ssoHost}/authenticate`);

    url.searchParams.set("redirect-url", redirectUrl);
    url.searchParams.set("callback-url", callbackUrl);
    path && url.searchParams.set("auth-page", `${ssoHost}${path}`);

    return url.href;
  };

  return children({
    signInHref: formUrl(signInPath),
    signUpHref: formUrl(signUpPath)
  });
};

WithSSO.defaultProps = {
  signUpRedirectPath: "",
  redirectUrl: global.location && global.location.href,
  callbackUrl: global.location && global.location.origin
};

export default WithSSO;
