import React, { useState } from "react";
import get from "lodash/get";
import { connect, useDispatch, useSelector } from "react-redux";
import { func, bool } from "prop-types";
import { parseUrl } from "query-string";

import { SocialLogin } from "../SocialLogin";
import { InputField } from "../../atoms/InputField";
import { login, sendOtp, currentUser } from "@quintype/bridgekeeper-js";
import { IS_OPEN_LOGIN_FORM, MEMBER_UPDATED } from "../../store/actions";

import { oauthAuthorize } from "../../layouts/header/nav-bar/api";

import "./forms.m.css";

const LoginBase = ({ onLogin, forgotPassword, manageLoginForm }) => {
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const publisherAttributes =  useSelector(state => get(state, ["qt", "config", "publisher-attributes"], {}));
  const currentPath =  useSelector(state => get(state, ["qt", "currentPath"], ""));

  const dispatch = useDispatch();

  const getCurrentUser = async () => {
    try {
      const currentUserResp = await currentUser();
      dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
    } catch (err) {
      console.log("error--------", err);
    }
  };

  const [error, setError] = useState({});

  const setData = e => {
    const userObj = { ...user };
    const fieldName = e.target.id;
    userObj[fieldName] = e.target.value;
    setUser(userObj);
  };

  const loginHandler = async e => {
    e.preventDefault();
    e.stopPropagation();
    const userObj = {
      username: user.email,
      email: user.email,
      password: user.password
    };

    if (user.email.length < 1 || user.password.length < 1) {
      setError({ message: "Please provide username and password" });
      return null;
    }

    login(userObj)
      .then(async ({ user, message }) => {
        if (!user) {
          setError({ message });
          return;
        }
        if (user["verification-status"]) {
          // User email is verified
          await getCurrentUser();
          await manageLoginForm(false);
          console.log("loged in successfully");
          console.log("currentPath ----------111", currentPath );
          const params = parseUrl(currentPath);
          console.log("params-----------111", params)
          const callbackUrl = get(params, ["query", "callback_uri"], global.location && global.location.origin);
          const redirectUrl = get(params, ["query", "redirect_uri"]) || get(publisherAttributes, ["sso_login", "redirect_Url"], "");
          console.log("redirectUrl -------------- 22222", redirectUrl);
          console.log("callbackUrl-----------222222", callbackUrl);
          const oauthResponse = await oauthAuthorize(51, redirectUrl, callbackUrl);
          console.log("oauthResponse--------- login", oauthResponse);
          if (oauthResponse.redirect_uri) window.location.href = oauthResponse.redirect_uri;
        } else {
          // User needs to validate the email account so send out an email to verify
          return sendOtp(user.email)
            .then(res => onLogin(user, res))
            .catch(error => setError(error));
        }
      })
      .catch(error => console.log("error msg", error.message));
  };

  return (
    <React.Fragment>
      <form styleName="malibu-form" onSubmit={loginHandler}>
        <InputField name="Email" id="email" type="email" required onChange={setData} />
        <InputField name="Password" id="password" type="password" required onChange={setData} />
        {error && <p styleName="error">{error.message}</p>}
        <div styleName="actions">
          <div styleName="malibu-link" onClick={forgotPassword}>
            Forgot Password?
          </div>
          <button aria-label="login-button" onClick={loginHandler} className="malibu-btn-large">
            Login
          </button>
        </div>
      </form>
      <SocialLogin getCurrentUser={getCurrentUser} />
    </React.Fragment>
  );
};

LoginBase.propTypes = {
  onLogin: func,
  forgotPassword: func,
  manageLoginForm: func,
  isLoginOpen: bool
};

const mapStateToProps = state => ({
  isLoginOpen: get(state, ["isLoginOpen"], false)
});

const mapDispatchToProps = dispatch => ({
  manageLoginForm: function(payload) {
    dispatch({
      type: IS_OPEN_LOGIN_FORM,
      payload: payload
    });
  }
});

export const Login = connect(mapStateToProps, mapDispatchToProps)(LoginBase);
