import React from "react";
import { bool, func } from "prop-types";

import "./login-modal.m.css";

export const LoginModal = function ({ showAccountModal, setShowAccountModal, setActiveTab, AccountModal }) {
  return (
    <div styleName="modal">
      <div styleName="login-modal">
        {showAccountModal && <AccountModal isPopup={false} onClose={() => setShowAccountModal(false)} />}
      </div>
      <div styleName="plan-preview">You have chosen basic plan for 499/-</div>
      <button styleName="proceed-to-payment-btn" onClick={() => setActiveTab("checkout")}>
        Click here for dummy login
      </button>
    </div>
  );
};

LoginModal.propTypes = {
  showAccountModal: bool,
  setShowAccountModal: func,
  setActiveTab: func,
  AccountModal: func,
};
