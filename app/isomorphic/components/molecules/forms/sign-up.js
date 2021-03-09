import React, { useState } from "react";
import { func, string } from "prop-types";
import { register } from "@quintype/bridgekeeper-js";
import wretch from "wretch";

import { InputField } from "../../atoms/InputField";

import "./forms.m.css";
import { get } from "lodash";
import { connect } from "react-redux";

const SignUpBase = ({ onSignup, onLogin, loginType }) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMsg, setError] = useState("");
  const [ifUserExists, setUserExists] = useState(false);

  // const sendEmail = user => {
  //   const data = {
  //     event: "signup",
  //     mail: user.email,
  //     name: user.name
  //   };
  //   wretch("/send-email").post(data);
  // };

  const sendVerificationLink = async (email, redirectUrl) => {
    try {
      wretch()
        .options({ credentials: "same-origin" })
        .url("/api/auth/v1/users/send-verification-link")
        .post({
          email: email,
          "redirect-url": redirectUrl
        })
        .json(() => Promise.resolve())
        .catch(ex => Promise.reject(ex));
    } catch (err) {
      return await Promise.reject(err);
    }
  };

  const signUpHandler = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (!userInfo.name && !userInfo.email && !userInfo.password) {
      setError("Please provide your name, email and password");
      return;
    } else if (!userInfo.name) {
      setError("Please provide your name");
      return;
    } else if (!userInfo.email) {
      setError("Please provide your email");
      return;
    } else if (!userInfo.password) {
      setError("Please provide password");
      return;
    }

    const userObj = {
      name: userInfo.name,
      email: userInfo.email,
      username: userInfo.email,
      password: userInfo.password,
      "dont-login": false
    };

    try {
      const { user, message } = await register(userObj);

      if (!user && message === "User Already exists") {
        console.log("fooooooo", message);
        return setUserExists(true);
      }

      if (loginType === "otp") {
        onSignup(user);
      } else {
        console.log("foooooooooo");
        sendVerificationLink(userInfo.email, "/");
        setError(`We have sent an activation email to you at ${userInfo.email}. Please check your email inbox.`);
      }
    } catch (err) {
      if (err.status === 409) {
        setError(`The email '${userObj.email}' already exists`);
      } else {
        setError("Oops! Something went wrong");
      }
    }
  };

  const setData = e => {
    const userObj = { ...userInfo };
    const fieldName = e.target.id;
    userObj[fieldName] = e.target.value;
    setUserInfo(userObj);
  };

  return (
    <form styleName="malibu-form" onSubmit={signUpHandler}>
      <InputField name="Name" id="name" required onChange={setData} />
      <InputField name="Email" type="email" id="email" onChange={setData} required />
      <InputField name="Password" type="password" id="password" onChange={setData} required />
      {ifUserExists && (
        <p styleName="error">
          The email ID is already registered. Please <button onClick={() => onSignup(userInfo)}>verify</button> or{" "}
          <button onClick={onLogin}>login</button>.
        </p>
      )}
      {errorMsg && <p styleName="error">{errorMsg}</p>}
      <button aria-label="signup-button" onClick={signUpHandler} className="malibu-btn-large malibu-btn-right">
        Sign up
      </button>
    </form>
  );
};

SignUpBase.propTypes = {
  onSignup: func,
  setMember: func,
  onLogin: func,
  loginType: string
};

const mapStateToProps = state => ({
  loginType: get(state, ["qt", "config", "publisher-attributes", "loginType"], "")
});

export const SignUp = connect(mapStateToProps, null)(SignUpBase);
