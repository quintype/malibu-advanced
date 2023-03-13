import get from "lodash/get";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AccessType } from "@quintype/components";
import AccountModal from "../../login/AccountModal";
import { GroupsAndPlansModal, LoginModal } from "./Modals";

import "./subscription-page.m.css";

export const SubscriptionPage = function (props) {
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [activeTab, setActiveTab] = useState("subscription");
  const member = useSelector((state) => get(state, ["member"], null));

  const getScreen = function (initAccessType, initRazorPayPayment) {
    switch (activeTab) {
      case "subscription":
        return (
          <GroupsAndPlansModal
            initAccessType={initAccessType}
            initRazorPayPayment={initRazorPayPayment}
            member={member}
            setActiveTab={setActiveTab}
          />
        );

      case "login":
        return (
          <LoginModal
            showAccountModal={showAccountModal}
            setShowAccountModal={setShowAccountModal}
            setActiveTab={setActiveTab}
            AccountModal={AccountModal}
          />
        );

      case "checkout":
        initAccessType(() => console.log("Accesstype Initialized"));
        if (global.AccessType) {
          console.log("Response from initAccessType is --->", global.AccessType.getSubscriptions());
        } else {
          console.log("globalAccessType Not Found --->");
        }
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
      {/* <div>{getScreen()}</div> */}
      <AccessType
        enableAccesstype={true}
        isStaging={false}
        accessTypeKey={"yTKoDn8R1d4AY651ZPvGDUq4"}
        email={"abc@gmail.com"}
        phone={123456}
        prodHost="https://www.accesstype.com"
        stagingHost="https://staging.accesstype.com"
        accessTypeBkIntegrationId={"8"}
      >
        {({ initAccessType, initRazorPayPayment }) => <div>{getScreen(initAccessType, initRazorPayPayment)}</div>}
      </AccessType>
    </>
  );
};
