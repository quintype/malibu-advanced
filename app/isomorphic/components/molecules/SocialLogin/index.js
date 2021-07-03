import React, { useEffect, useState } from "react";
import { func, string } from "prop-types";
import { withFacebookLogin, withGoogleLogin, withAppleLogin } from "@quintype/bridgekeeper-js";
import { connect, useSelector } from "react-redux";
import get from "lodash/get";

import Button from "../../atoms/Button";
import { getQueryParams } from "../../utils";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";

import "./social-login.m.css";

export const SocialLoginBase = ({ getCurrentUser, googleAppId, facebookAppId }) => {
  const [error, setError] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("/");
  const enableSSO = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enable_sso"]));

  useEffect(() => {
    if (enableSSO) {
      setRedirectUrl(getQueryParams(window.location.href, ["redirect-url"])["redirect-url"]);
    } else {
      const location = new URL(window.location.href);
      const currentLocation = `${location.origin}${location.pathname}`;
      location && !enableSSO && setRedirectUrl(currentLocation);
    }
  }, []);

  const socialLogin = (e, login) => {
    e.preventDefault();

    login()
      .then(async () => {
        await getCurrentUser();
        console.log("successfully login");
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

  const FaceBookLogin = () => {
    const { login, serverSideLoginPath } = withFacebookLogin(
      facebookAppId,
      "email",
      true,
      "https://malibu-advanced-web-auth.qtstage.io"
    );
    return (
      <Button color="#3b5998" flat href={serverSideLoginPath} onClick={e => socialLogin(e, login)} socialButton>
        <span styleName="icon">
          <SvgIconHandler type="facebook" iconStyle={{ color: "#3b5998" }} width="9" height="15" viewBox="0 0 12 21" />
        </span>{" "}
        Facebook
      </Button>
    );
  };

  const GoogleLogin = () => {
    const [redirectUriHost, setRedirectUriHost] = useState("https://malibu-advanced-web.qtstage.io/user/signup");

    useEffect(() => {
      const urlObj2 = new URL(window.location.href);
      const urlSubstring2 = urlObj2.search;
      const host = new URLSearchParams(urlSubstring2).get("redirect_uri");
      setRedirectUriHost(host);
    }, []);

    const { serverSideLoginPath } = withGoogleLogin(
      googleAppId,
      "email",
      true,
      "https://malibu-advanced-web-auth.qtstage.io/user-login"
    );

    const signInUrl = `${serverSideLoginPath}/?redirect-urii=${redirectUriHost}`;
    return (
      <Button color="#dd4b39" flat href={signInUrl} onClick={e => googleOnClick(e, serverSideLoginPath)} socialButton>
        <span styleName="icon">
          <SvgIconHandler type="google" width="13" height="13" viewBox="0 0 13 13" />
        </span>{" "}
        Google
      </Button>
    );
  };

  const AppleLogin = () => {
    const { serverSideLoginPath } = withAppleLogin(redirectUrl);
    return (
      <Button color="#dd4b39" flat href={serverSideLoginPath} socialButton>
        <SvgIconHandler type="apple" height="44" width="44" iconStyle={{ color: "#000" }} /> Apple
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
