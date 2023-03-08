import get from "lodash/get";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { getOauthAuthorizeUrl } from "@quintype/bridgekeeper-js";
import AccountModal from "../../login/AccountModal";

import "./subscription-page.m.css";

export const SubscriptionPage = function (props) {
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [activeTab, setActiveTab] = useState("subscription");
  const member = useSelector((state) => get(state, ["member"], null));
  const getState = useSelector((state) => state);
  const publisherAttributes = get(getState, ["qt", "config", "publisher-attributes"], {});
  const clientId = get(publisherAttributes, ["sso_login", "client_id"], "");
  const domainSlug = get(getState, ["qt", "config", "domainSlug"], "");
  const redirectUrl = domainSlug
    ? get(publisherAttributes, ["sso_login", "subdomain", domainSlug, "redirect_Url"], "")
    : get(publisherAttributes, ["sso_login", "redirect_Url"], "");

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
        if (window) {
          const oauthAuthorizeUrl = getOauthAuthorizeUrl(clientId, redirectUrl, window.location.href);
          window.location.replace(oauthAuthorizeUrl);
        }
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
            <button onClick={() => setActiveTab("checkout")}>Subscribe</button>
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
