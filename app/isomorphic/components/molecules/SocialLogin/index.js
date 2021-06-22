import React, { useEffect, useState } from "react";
import { func, string } from "prop-types";
import { withFacebookLogin, withGoogleLogin, withAppleLogin } from "@quintype/bridgekeeper-js";
import { connect } from "react-redux";
import get from "lodash/get";

import Button from "../../atoms/Button";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import "./social-login.m.css";

export const SocialLoginBase = ({ getCurrentUser, googleAppId, facebookAppId }) => {
  const [error, setError] = useState("");
  const [currentLocation, setCurrentLocation] = useState("/");

  useEffect(() => {
    const location = new URL(window.location.href);
    const redirectUrl = `${location.origin}${location.pathname}`;
    location && setCurrentLocation(redirectUrl);
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
    const { login, serverSideLoginPath } = withFacebookLogin(facebookAppId, "email", true, currentLocation);
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
    const { serverSideLoginPath } = withGoogleLogin(googleAppId, "email", true, currentLocation);
    return (
      <Button
        color="#dd4b39"
        flat
        href={serverSideLoginPath}
        onClick={e => googleOnClick(e, serverSideLoginPath)}
        socialButton
      >
        <span styleName="icon">
          <SvgIconHandler type="google" width="13" height="13" viewBox="0 0 13 13" />
        </span>{" "}
        Google
      </Button>
    );
  };

  const AppleLogin = () => {
    const { serverSideLoginPath } = withAppleLogin(currentLocation);
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
