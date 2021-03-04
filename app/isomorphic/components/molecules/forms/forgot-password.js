import React, { useState } from "react";
import PT from "prop-types";
import { forgotPassword } from "@quintype/bridgekeeper-js";

// import { Button } from "../../atoms/button";
import { InputField } from "../../atoms/InputField";
// import { verifyEmailOTP, verifyEmail } from "../../helper/api";

import "./forms.m.css";

export function ForgotPassword({ onBackdropClick }) {
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
  const emailHandler = async e => {
    e.preventDefault();
    e.stopPropagation();
    const emailObj = { email };
    const { message, error } = await forgotPassword(emailObj);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage(message);
    setTimeout(() => {
      setMessage(null);
      onBackdropClick();
    }, 5000);
    // const verifiedData = await verifyEmail(email);
    // if (verifiedData) {
    //   data.id = verifiedData["email-token"];
    //   verificationScreenHandler(true);
    // } else {
    //   setError({ message: "error" });
    // }
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

  const changePassword = e => {
    e.preventDefault();
    e.stopPropagation();

    if (data.password !== data.confirmPassword) {
      setError({ message: "Password does not match" });
      return null;
    }
    verificationScreenHandler(false); // please remove this
    console.log("need to write verify email otp logic");
    // verifyEmailOTP(data.otp.trim(), data.id, data.password)
    //   .then(() => {
    //     setSuccessMsg("Your Password has been changed");
    //     setTimeout(() => {
    //       onBackdropClick(); // hinding modal after 3 second
    //     }, 3000);
    //   })
    //   .catch(error => {
    //     console.log("error", error);
    //     setError({ message: `Invalid OTP or member not found` });
    //   });
  };
  if (showVerficationScreen) {
    return (
      <form styleName="malibu-form" key="otp" onSubmit={changePassword}>
        <p styleName="message">
          Please check your spam and promotions, and if you still don&apost write to contact@newslaundry
        </p>
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
  if (showMessage) {
    return <div styleName="success">A password reset link has been sent to your email address.</div>;
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

ForgotPassword.propTypes = {
  onBackdropClick: PT.func
};
