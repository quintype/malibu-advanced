import React, { useState } from "react";
import { func, bool } from "prop-types";
import { forgotPassword, sendOtp, resetPassword } from "@quintype/bridgekeeper-js";
import get from "lodash/get";
import { connect } from "react-redux";

// import { Button } from "../../atoms/button";
import { InputField } from "../../atoms/InputField";
// import { verifyEmailOTP, verifyEmail } from "../../helper/api";
import "./forms.m.css";

export function ForgotPasswordBase({ onBackdropClick, isEmailVerification, activeLoginTab }) {
  const [email, setEmail] = useState("");
  const [data, setOTPData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
    id: ""
  });
  // const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState({});
  const [showVerficationScreen, verificationScreenHandler] = useState(false);
  const [showMessage, setMessage] = useState(null);
  const [emailVerificationMessage, setVerificationMessage] = useState(null);
  const [otpMessage, setOtpMessage] = useState(null);
  const emailHandler = async e => {
    e.preventDefault();
    e.stopPropagation();

    const { message, error } = isEmailVerification ? await forgotPassword({ email }) : await sendOtp(email);
    if (error) {
      setError(error.message);
      return;
    }
    if (!isEmailVerification) {
      setVerificationMessage(false);
      verificationScreenHandler(true);
    } else {
      setVerificationMessage(true);
      setOtpMessage(false);
      setMessage(message);
      setTimeout(() => {
        setMessage(null);
        onBackdropClick();
      }, 5000);
    }
  };

  const setEmailData = e => {
    setEmail(e.target.value);
  };

  const setData = e => {
    const userObj = { ...data };
    const fieldName = e.target.id;
    userObj[fieldName] = e.target.value;
    setOTPData(userObj);
  };

  const changePassword = async e => {
    e.preventDefault();
    e.stopPropagation();

    if (data.password !== data.confirmPassword) {
      setError({ message: "Password does not match" });
      return null;
    }
    const resObj = {
      email: email,
      otp: data.otp.trim(),
      "new-password": data.password
    };
    const { message } = await resetPassword(resObj);
    setOtpMessage(true);
    verificationScreenHandler(false); // please remove this
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
      activeLoginTab();
    }, 5000);
  };
  if (showVerficationScreen) {
    return (
      <form styleName="malibu-form" key="otp" onSubmit={changePassword}>
        <p styleName="message">Please enter 6-digit verification code sent to {email} to reset your password.</p>
        <InputField name="Enter OTP" id="otp" type="text" value={data.otp} required onChange={setData} />
        <InputField
          name="Enter Password"
          id="password"
          type="password"
          value={data.password}
          required
          onChange={setData}
        />
        <InputField
          name="Confirm Password"
          id="confirmPassword"
          type="password"
          value={data.confirmPassword}
          required
          onChange={setData}
        />
        {/* {successMsg && <p>{successMsg}</p>} */}
        {error && <p styleName="error">{error.message}</p>}
        <div styleName="actions">
          <button aria-label="change-password-button" onClick={changePassword} className="malibu-btn-large">
            Verify OTP
          </button>
        </div>
      </form>
    );
  }
  if (emailVerificationMessage) {
    return <div styleName="success">A password reset link has been sent to your email address.</div>;
  }

  if (otpMessage) {
    return <div styleName="success">{showMessage}</div>;
  }

  return (
    <form styleName="malibu-form" onSubmit={emailHandler}>
      <InputField name="Email" id="email" type="email" required onChange={setEmailData} />
      <div styleName="actions">
        <button aria-label="forgot-password-submit" onClick={emailHandler} className="malibu-btn-large">
          Submit
        </button>
      </div>
    </form>
  );
}

ForgotPasswordBase.propTypes = {
  onBackdropClick: func,
  isEmailVerification: bool,
  activeLoginTab: func
};

const mapStateToProps = state => ({
  isEmailVerification: get(state, ["qt", "config", "publisher-attributes", "is_email_verification"], false)
});

export const ForgotPassword = connect(mapStateToProps, {})(ForgotPasswordBase);
