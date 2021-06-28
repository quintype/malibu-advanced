import React, { useEffect, useState } from "react";
import { func, string } from "prop-types";
import { withFacebookLogin, withGoogleLogin, withAppleLogin } from "@quintype/bridgekeeper-js";
import { connect } from "react-redux";
import get from "lodash/get";

import Button from "../../atoms/Button";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import "./social-login.m.css";

export const SocialLoginBase = ({ getCurrentUser, googleAppId, facebookAppId }) => {
  // const [error, setError] = useState("");
  const [currentLocation, setCurrentLocation] = useState("/");

  useEffect(() => {
    const location = new URL(window.location.href);
    const redirectUrl = `${location.origin}${location.pathname}`;
    location && setCurrentLocation(redirectUrl);
  }, []);

  const socialLogin = async (e, login) => {
    e.preventDefault();

    const res = await login();
    console.log(res, "res here");
  };

  // const googleOnClick = (e, serverSideLoginPath) => {
  //   window.location.href = serverSideLoginPath;
  // };

  const FaceBookLogin = () => {
    const { login } = withFacebookLogin(facebookAppId, "email", true, currentLocation);
    return (
      <Button color="#3b5998" flat onClick={e => socialLogin(e, login)}>
        <span styleName="icon">
          <SvgIconHandler type="facebook" iconStyle={{ color: "#3b5998" }} width="9" height="15" viewBox="0 0 12 21" />
        </span>{" "}
        Facebook
      </Button>
    );
  };

  const GoogleLogin = () => {
    const { login } = withGoogleLogin(googleAppId, "email", true, currentLocation);
    return (
      <Button color="#dd4b39" flat onClick={e => socialLogin(e, login)}>
        <span styleName="icon">
          <SvgIconHandler type="google" width="13" height="13" viewBox="0 0 13 13" />
        </span>{" "}
        Google
      </Button>
    );
  };

  const AppleLogin = () => {
    const { login } = withAppleLogin(currentLocation);
    return (
      <Button color="#dd4b39" flat onClick={e => socialLogin(e, login)}>
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
