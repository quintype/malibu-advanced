import React, { useState } from "react";
import { func, object } from "prop-types";

import { InputField } from "../../atoms/InputField";
import { sendOtp, updateWithOtp } from "@quintype/bridgekeeper-js";
import Modal from "../../login/modal";

import "./profile-page.m.css";
import { useTimer } from "../../atoms/timer";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";

const LinkProfile = ({ onClose, member }) => {
  const [input, setInput] = useState("");
  const [otp, setOTP] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState({});
  const { start, time } = useTimer();

  const { email, "login-phone-number": loginPhoneNumber } = member;

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
      body["email"] = input;
    } else {
      body["phone-number"] = input;
    }

    sendOtp(body)
      .then((res) => {
        if (res.status === 200) {
          setShowOtp(true);
          start(30);
          setError({});
        } else {
          setError(res.error || res);
        }
      })
      .catch((error) => {
        setError(error);
      });
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let user = {};
      if (!loginPhoneNumber) {
        user = {
          "login-phone-number": input,
          "phone-number": Number(input.slice(3)),
          "verification-status": "phone-number",
        };
      } else {
        user = {
          email: input,
          "verification-status": "email",
        };
      }

      const response = await updateWithOtp(otp, user);

      if (response.status === 200) {
        onClose();
      } else {
        setError({ message: "error" });
      }
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
                <span onClick={() => setShowOtp(false)} styleName="edit-icon">
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
