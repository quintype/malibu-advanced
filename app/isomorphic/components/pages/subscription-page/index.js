import get from "lodash/get";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { func } from "prop-types";
import { AccessType } from "@quintype/components";
import AccountModal from "../../login/AccountModal";
import { GroupsAndPlansModal, LoginModal, CheckoutModal, PaymentModal } from "./Modals";

import "./subscription-page.m.css";

const SubscriptionLayout = function ({ initAccessType, initRazorPayPayment, getSubscription, validateCoupon }) {
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [activeTab, setActiveTab] = useState("subscription");
  const [selectedPlan, setSelectedPlan] = useState({});
  const member = useSelector((state) => get(state, ["member"], null));

  useEffect(() => {
    !global.AccessType && initAccessType(() => console.log("Accesstype Initialized --->"));
  }, []);

  switch (activeTab) {
    case "subscription":
      return (
        <GroupsAndPlansModal
          member={member}
          setActiveTab={setActiveTab}
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          getSubscription={getSubscription}
        />
      );

    case "login":
      return (
        <LoginModal
          showAccountModal={showAccountModal}
          setShowAccountModal={setShowAccountModal}
          setActiveTab={setActiveTab}
          AccountModal={AccountModal}
          selectedPlan={selectedPlan}
        />
      );

    case "checkout":
      return (
        <CheckoutModal
          member={member}
          setActiveTab={setActiveTab}
          initRazorPayPayment={initRazorPayPayment}
          selectedPlan={selectedPlan}
          validateCoupon={validateCoupon}
        />
      );

    case "payment":
      return <PaymentModal setActiveTab={setActiveTab} />;

    default:
      return <GroupsAndPlansModal member={member} setActiveTab={setActiveTab} getSubscription={getSubscription} />;
  }
};

export const SubscriptionPage = function (props) {
  return (
    <>
      <AccessType
        enableAccesstype={true}
        isStaging={false}
        accessTypeKey={"yTKoDn8R1d4AY651ZPvGDUq4"}
        email={"abc@gmail.com"}
        phone={123456}
        prodHost="https://www.accesstype.com"
        stagingHost="https://staging.accesstype.com"
        accessTypeBkIntegrationId={"10"}
      >
        {({ initAccessType, initRazorPayPayment, getSubscription, validateCoupon }) => (
          <SubscriptionLayout
            initAccessType={initAccessType}
            initRazorPayPayment={initRazorPayPayment}
            getSubscription={getSubscription}
            validateCoupon={validateCoupon}
          />
        )}
      </AccessType>
    </>
  );
};

SubscriptionLayout.propTypes = {
  initAccessType: func,
  initRazorPayPayment: func,
  getSubscription: func,
  validateCoupon: func,
};
