import React, { useEffect, useState } from "react";
import { func, string } from "prop-types";
import { withFacebookLogin, withGoogleLogin, withAppleLogin, withLinkedinLogin } from "@quintype/bridgekeeper-js";
import { connect, useSelector } from "react-redux";
import { parseUrl } from "query-string";
import get from "lodash/get";

import { FbIcon } from "../../atoms/icons/fb-icon";
import { Google } from "../../atoms/icons/google";
import { Apple } from "../../atoms/icons/apple";
import Button from "../../atoms/Button";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import "./social-login.m.css";

export const SocialLoginBase = ({ googleAppId, facebookAppId }) => {
  const [redirectUrl, setRedirectUrl] = useState("/");
  const publisherAttributes = useSelector(state => get(state, ["qt", "config", "publisher-attributes"], {}));
  const currentPath = useSelector(state => get(state, ["qt", "currentPath"], ""));
  const ssoLoginIsEnable = get(publisherAttributes, ["sso_login", "is_enable"], false);
  const clientId = get(publisherAttributes, ["sso_login", "client_id"], "");

  useEffect(() => {
    const params = parseUrl(currentPath);
    const getCallbackUrl = get(params, ["query", "callback_uri"], global.location && global.location.origin);
    const getRedirectUrl =
      get(params, ["query", "redirect_uri"]) || get(publisherAttributes, ["sso_login", "redirect_Url"], "");
    const location = new URL(window.location.href);
    const oauthAuthorize = `${location.origin}/api/auth/v1/oauth/authorize?redirect_uri=${getRedirectUrl}&client_id=${clientId}&callback_uri=${getCallbackUrl}&response_type=code`;
    setRedirectUrl(ssoLoginIsEnable ? oauthAuthorize : `${location.origin}${location.pathname}`);
  }, []);

  const socialLogin = (e, login) => {
    e.preventDefault();

    login()
      .then(() => {
        checkForMemberUpdated().then(res => {
          console.log("successfully logged in");
        });
      })
      .catch(error => {
        console.log("error", error);
        if (error === "NO_EMAIL") {
          setError("The account you are using does not have an email id. Please try with another account.");
        } else if (error === "NOT_LOADED") {
          setError("");
        } else if (error === "NOT_GRANTED") {
          setError("There seems to be an error with social logins. Please do a manual email/password login.");
        } else {
          setError("Oops! Something went wrong. Please try again later.");
        }
      }); // Can also make an API call to /api/v1/members/me
  };

  const googleOnClick = (e, serverSideLoginPath) => {
    window.location.href = serverSideLoginPath;
  };

  const LinkedinLogin = () => {
    const { serverSideLoginPath } = withLinkedinLogin({
      scope: "email",
      emailMandatory: true,
      redirectUrl: encodeURIComponent(redirectUrl)
    });
    return (
      <Button color="#dd4b39" flat href={serverSideLoginPath} socialButton>
        <span styleName="icon">
          <SvgIconHandler type="linkedin" iconStyle={{ color: "#3b5998" }} width="30" height="30" viewBox="0 0 15 20" />
        </span>{" "}
        LinkedIn
      </Button>
    );
  };

  const GoogleLogin = () => {
    const { serverSideLoginPath } = withGoogleLogin({
      scope: "email",
      emailMandatory: true,
      redirectUrl: encodeURIComponent(redirectUrl)
    });
    return (
      <Button color="#dd4b39" flat href={serverSideLoginPath} socialButton>
        <span styleName="icon">
          <SvgIconHandler type="google" width="13" height="13" viewBox="0 0 13 13" />
        </span>{" "}
        Google
      </Button>
    );
  };

  const appleOnClick = (e, serverSideLoginPath) => {
    window.location.href = serverSideLoginPath;
  };

  const AppleLogin = () => {
    const appleLoginPath = `/api/auth/v1/login?auth-provider=apple&redirect-url=${currentLocation}`;
    return (
      <Button color="#dd4b39" flat href={appleLoginPath} onClick={e => appleOnClick(e, appleLoginPath)} socialButton>
        <Apple /> Apple
      </Button>
    );
  };

  return (
    <div styleName="social-login">
      <h3 styleName="title">Or login with</h3>
      <ul styleName="buttons">
        <li styleName="button">
          <FaceBookLogin />
        </li>
        <li styleName="button">
          <GoogleLogin />
        </li>
        <li styleName="button">
          <AppleLogin />
        </li>
        <li styleName="button">
          <LinkedinLogin />
        </li>
      </ul>
      <ul>
        <li styleName="button">
          <AppleLogin />
        </li>
      </ul>
      <p styleName="error">{error}</p>
    </div>
  );
};

SocialLoginBase.propTypes = {
  getCurrentUser: func,
  googleAppId: string,
  facebookAppId: string
};

const mapStateToProps = state => ({
  googleAppId: get(state, ["qt", "config", "publisher-attributes", "google_app_id"], ""),
  facebookAppId: get(state, ["qt", "config", "publisher-attributes", "facebook_app_id"], "")
});

export const SocialLogin = connect(mapStateToProps, null)(SocialLoginBase);
