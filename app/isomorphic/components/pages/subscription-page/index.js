import get from "lodash/get";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import AccountModal from "../../login/AccountModal";

import "./subscription-page.m.css";

export const SubscriptionPage = function (props) {
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [activeTab, setActiveTab] = useState("subscription");
  const member = useSelector((state) => get(state, ["member"], null));

  const getScreen = function () {
    switch (activeTab) {
      case "subscription":
        return (
          <>
            <div>This is a subscription page</div>
            <button onClick={() => (member ? setActiveTab("checkout") : setActiveTab("login"))}>subscribe</button>
          </>
        );

      case "login":
        return (
          <div styleName="modal">
            <div styleName="login-modal">
              {showAccountModal && <AccountModal isPopup={false} onClose={() => setShowAccountModal(false)} />}
            </div>
            <div styleName="plan-preview">You have chosen basic plan for 499/-</div>
            <button styleNam="proceed-to-payment-btn" onClick={() => setActiveTab("checkout")}>
              Click here for dummy login
            </button>
          </div>
        );

      case "checkout":
        return (
          <>
            <div styleName="plan-preview">This is a checkout page</div>
            <button styleNam="proceed-to-payment-btn" onClick={() => setActiveTab("payment")}>
              Proceed to payment
            </button>
          </>
        );

      case "payment":
        return (
          <>
            <div>This is a payment page</div>
            <button onClick={() => setActiveTab("subscription")}>Restart the flow</button>
          </>
        );
      default:
        return (
          <>
            <div>This is a subscription page</div>
            <button onClick={() => setActiveTab("checkout")}>Subscribe1</button>
          </>
        );
    }
  };

  return (
    <>
      <div>{getScreen()}</div>
    </>
  );
};
