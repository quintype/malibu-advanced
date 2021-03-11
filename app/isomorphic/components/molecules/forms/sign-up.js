import React, { useState, useEffect } from "react";
import { func, string } from "prop-types";
import { register, sendVerificationLink } from "@quintype/bridgekeeper-js";
import { get } from "lodash";
import { connect } from "react-redux";

import { InputField } from "../../atoms/InputField";

import "./forms.m.css";

const SignUpBase = ({ onSignup, onLogin, isVerificationLinkflow }) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [errorMsg, setError] = useState("");
  const [verficationSuccessMessage, setSuccessMessage] = useState("");
  const [ifUserExists, setUserExists] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("/");

  // const sendEmail = user => {
  //   const data = {
  //     event: "signup",
  //     mail: user.email,
  //     name: user.name
  //   };
  //   wretch("/send-email").post(data);
  // };

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
        return setUserExists(true);
      }

      if (isVerificationLinkflow) {
        onSignup(user);
      } else {
        sendVerificationLink(userInfo.email, currentLocation);
        !ifUserExists &&
          setSuccessMessage(
            `We have sent an activation email to you at ${userInfo.email}. Please check your email inbox.`
          );
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

  const onVerify = () => {
    if (isVerificationLinkflow) {
      return onSignup(userInfo);
    }

    return sendVerificationLink(userInfo.email, currentLocation);
  };

  const onResendVerification = () => {
    sendVerificationLink(userInfo.email, currentLocation);
    setSuccessMessage("We have resend the verification link");
  };

  useEffect(() => {
    setCurrentLocation(window.location.href);
  }, []);

  return (
    <form styleName="malibu-form" onSubmit={signUpHandler}>
      <InputField name="Name" id="name" required onChange={setData} />
      <InputField name="Email" type="email" id="email" onChange={setData} required />
      <InputField name="Password" type="password" id="password" onChange={setData} required />
      {!verficationSuccessMessage && ifUserExists && (
        <p styleName="error">
          The email ID is already registered. Please <button onClick={onVerify}>verify</button> or{" "}
          <button onClick={onLogin}>login</button>.
        </p>
      )}
      {errorMsg && <p styleName="error">{errorMsg}</p>}
      <button aria-label="signup-button" onClick={signUpHandler} className="malibu-btn-large malibu-btn-right">
        Sign up
      </button>
      {verficationSuccessMessage && (
        <>
          <p styleName="error">
            {verficationSuccessMessage} If you have not received a email, click{" "}
            <button onClick={onResendVerification}>resend</button>{" "}
          </p>
        </>
      )}
    </form>
  );
};

SignUpBase.propTypes = {
  onSignup: func,
  setMember: func,
  onLogin: func,
  isVerificationLinkflow: string
};

const mapStateToProps = state => ({
  isVerificationLinkflow: get(state, ["qt", "config", "publisher-attributes", "is_verification_link_flow"], true)
});

export const SignUp = connect(mapStateToProps, null)(SignUpBase);
