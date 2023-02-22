import React, { useState } from "react";
import { func, object } from "prop-types";

import { InputField } from "../../atoms/InputField";
import { sendOtp, updateWithOtp } from "@quintype/bridgekeeper-js";
import Modal from "../../login/modal";

import "./profile-page.m.css";

const LinkProfile = ({ onClose, member }) => {
  const [input, setInput] = useState("");
  const [otp, setOTP] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState({});

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
      setError({ message: `Please provide ${email ? "email" : "phone number"}` });
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
        } else {
          setError({ message: res.message });
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
        onClose;
      } else {
        console.log(response, "error");
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
          {!email ? (
            <InputField name="Email" id="email" type="string" required onChange={setData} />
          ) : (
            <InputField name="Phone number" id="phone" type="tel" required onChange={setData} />
          )}
          {showOtp ? (
            <>
              <InputField name="OTP" id="otp" type="number" required onChange={setData} />
              <button
                aria-label="login-button"
                onClick={updateHandler}
                styleName="btn-submit"
                className="malibu-btn-large"
              >
                Verify and Link
              </button>
            </>
          ) : (
            <button
              aria-label="login-button"
              onClick={loginHandler}
              styleName="btn-submit"
              className="malibu-btn-large"
            >
              Get OTP
            </button>
          )}
          {error && <p styleName="error">{error.message}</p>}
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
