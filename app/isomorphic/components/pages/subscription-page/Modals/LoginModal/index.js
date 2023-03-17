import React from "react";
import { bool, func, object } from "prop-types";

import "./login-modal.m.css";

const currencyLabels = {
  INR: "Rs.",
};

export const LoginModal = function ({
  showAccountModal,
  setShowAccountModal,
  setActiveTab,
  AccountModal,
  selectedPlan,
}) {
  const { plan } = selectedPlan;
  console.log("Selected Plan inside login modal is --->", plan);
  return (
    <div styleName="modal">
      <div styleName="checkout-label">Checkout</div>
      <div styleName="secure">100% secure</div>
      <div styleName="current-step">Step 1 of 2</div>
      <div styleName="login-modal">
        {showAccountModal && (
          <AccountModal
            isPopup={false}
            onClose={() => {
              setShowAccountModal(false);
              setActiveTab("checkout");
            }}
          />
        )}
      </div>
      <div styleName="plan-preview">
        <div styleName="label">Plan Details</div>
        <div styleName="plan-details">
          <div styleName="plan-name-and-price">
            <div styleName="group-plan-name">{`${plan.title} - ${
              plan.recurring ? "Recurring Plan" : "One Time Plan"
            }`}</div>
            <div styleName="price">{`${currencyLabels[plan.price_currency]} ${plan.price_cents / 100}/-`}</div>
          </div>
        </div>
        <div styleName="validity">{`Valid for ${plan.duration_length} ${plan.duration_unit}`}</div>
      </div>
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
  selectedPlan: object,
};
