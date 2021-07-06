import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import AccountModal from "../../login/AccountModal";

import { generateRedirect, getQueryParam } from "../../utils";

const UserLoginPage = () => {
  const integrationId = 51;
  const member = useSelector(state => get(state, ["member"], null));

  const redirectionHandler = async (integrationId, redirectUrl) => {
    window.location.href = await generateRedirect(integrationId, redirectUrl);
  };

  useEffect(() => {
    const redirectUrl = getQueryParam(window.location.href, "post-login-redirect-uri");
    if (redirectUrl) {
      redirectionHandler(integrationId, redirectUrl);
    }
  }, []);

  useEffect(() => {
    const redirectUrl = getQueryParam(window.location.href, "redirect_uri");
    if (redirectUrl && member) {
      redirectionHandler(integrationId, redirectUrl);
    }
  }, [member]);

  return <AccountModal isPopup={false} />;
};

export { UserLoginPage };
