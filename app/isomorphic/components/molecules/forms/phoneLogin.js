import React, { useState } from "react";
import get from "lodash/get";
import { useDispatch } from "react-redux";
import { func } from "prop-types";

import { SocialLogin } from "../SocialLogin";
import { InputField } from "../../atoms/InputField";
import { sendOtp, currentUser } from "@quintype/bridgekeeper-js";
import { MEMBER_UPDATED } from "../../store/actions";

import "./forms.m.css";

const PhoneLogin = ({ onLogin, setLoginOption }) => {
  const [phoneNumber, setPhoneNumber] = useState("");

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

  const setData = (e) => {
    setPhoneNumber(e.target.value);
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (phoneNumber.length < 1) {
      setError({ message: "Please provide phone number" });
      return null;
    }

    sendOtp({ "phone-number": phoneNumber, "always-send": true })
      .then((res) => {
        onLogin({ "phone-number": phoneNumber, isPhoneLogin: true }, res);
      })
      .catch((error) => setError(error));
  };

  return (
    <React.Fragment>
      <form styleName="malibu-form" onSubmit={loginHandler}>
        <InputField name="Phone number" id="phone" type="tel" required onChange={setData} />
        {error && <p styleName="error">{error.message}</p>}
        <div styleName="actions">
          <button aria-label="login-button" onClick={loginHandler} styleName="btn-submit" className="malibu-btn-large">
            Get OTP
          </button>
        </div>
      </form>
      <SocialLogin getCurrentUser={getCurrentUser} loginOption={"Email"} setLoginOption={setLoginOption} />
    </React.Fragment>
  );
};

PhoneLogin.propTypes = {
  setLoginOption: func,
};

export default PhoneLogin;
