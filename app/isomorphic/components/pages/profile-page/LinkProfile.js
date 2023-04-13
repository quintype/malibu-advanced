import React, { useState } from "react";
import { func, object } from "prop-types";

import { InputField } from "../../atoms/InputField";
import { sendOtp, updateWithOtp, updateUserProfile } from "@quintype/bridgekeeper-js";
import Modal from "../../login/modal";

import "./profile-page.m.css";
import { useTimer } from "../../atoms/timer";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import { useDispatch } from "react-redux";
import { MEMBER_UPDATED } from "../../store/actions";
import get from "lodash.get";

const LinkProfile = ({ onClose, member }) => {
  const [input, setInput] = useState("");
  const [otp, setOTP] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState({});
  const { start, time } = useTimer();

  const { email, "login-phone-number": loginPhoneNumber } = member;

  const dispatch = useDispatch();
  const setData = (e) => {
    if (e.target.id === "otp") {
      setOTP(e.target.value);
    } else {
      setInput(e.target.value);
    }
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (input.length < 1) {
      setError({ message: `Please provide ${!email ? "email" : "phone number"}` });
      return null;
    }

    const body = { "always-send": true };
    if (!email) {
      body.email = input;
    } else {
      body["phone-number"] = input;
    }

    try {
      const response = await sendOtp(body);
      if (response.status === 200) {
        setShowOtp(true);
        start(30);
        setError({});
      } else {
        setError(response.error || response);
      }
    } catch (error) {
      setError(error);
    }
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let user = {};
      if (!loginPhoneNumber) {
        user = {
          email: user.email,
          "login-phone-number": input,
          "phone-number": Number(input.slice(3)),
          "verification-status": "phone-number",
        };
      } else {
        user = {
          email: input,
          "verification-status": "email",
          "login-phone-number": loginPhoneNumber,
          "phone-number": Number(user["phone-number"].slice(3)),
        };
      }
      await updateWithOtp(otp, user);
      const currentUserResp = await updateUserProfile(user);
      dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
    } catch (err) {
      setError(err);
      console.warn("error", err);
    }
  };

  return (
    <Modal onClose={onClose}>
      <form styleName="malibu-form-link" onSubmit={loginHandler}>
        <>
          <div styleName="modal-title">{`${
            showOtp ? "Enter OTP" : `Link your ${!email ? "Email" : "Phone number"}`
          }`}</div>
          {showOtp ? (
            <>
              <p styleName="fields">
                Please enter the otp we have sent to your
                {`${!email ? " email" : " phone number"} ${input}`}
                <span
                  onClick={() => {
                    setError({});
                    setShowOtp(false);
                  }}
                  styleName="edit-icon"
                >
                  <SvgIconHandler type="edit" height="20" width="20" iconStyle={{ color: "#000" }} />
                </span>
              </p>
              <InputField name="OTP" id="otp" type="number" required onChange={setData} />
              {error && <p styleName="otp-error">{error.message}</p>}
              <button
                aria-label="login-button"
                onClick={updateHandler}
                styleName="btn-submit"
                className="malibu-btn-large"
              >
                Verify and Link
              </button>
              <button
                disabled={time > 0}
                aria-label="resend-otp-button"
                onClick={loginHandler}
                styleName="resend-otp-btn"
              >
                Resend OTP
              </button>
              {time > 0 && (
                <p styleName="resend-otp">
                  Resend OTP in <span>{`0.${time}`}</span>
                </p>
              )}
            </>
          ) : (
            <>
              {!email ? (
                <InputField name="Email" id="email" type="string" required onChange={setData} />
              ) : (
                <InputField name="Phone number" id="phone" type="tel" required onChange={setData} />
              )}
              {error && <p styleName="otp-error">{error.message}</p>}
              <button
                aria-label="login-button"
                onClick={loginHandler}
                styleName="btn-submit"
                className="malibu-btn-large"
              >
                Get OTP
              </button>
            </>
          )}
        </>
      </form>
    </Modal>
  );
};

LinkProfile.propTypes = {
  onClose: func,
  member: object,
};

export default LinkProfile;
