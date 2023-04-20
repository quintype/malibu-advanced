import get from "lodash/get";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { func, object } from "prop-types";
import { AccessType } from "@quintype/components";
import AccountModal from "../../login/AccountModal";
import { GroupsAndPlansModal, LoginModal, CheckoutModal, PaymentModal } from "./Modals";

import "./subscription-page.m.css";

const SubscriptionLayout = function ({ initAccessType, initRazorPayPayment, getSubscription, validateCoupon, member }) {
  const [showAccountModal, setShowAccountModal] = useState(true);
  const [activeTab, setActiveTab] = useState("subscription");
  const [selectedPlan, setSelectedPlan] = useState({});

  useEffect(() => {
    !global.AccessType && initAccessType(() => console.log("Accesstype is initialized"));
    if (global.AccessType) {
      global.AccessType.getPaymentOptions().then((res) => console.log("Payment options are: ", res));
    }
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

SubscriptionLayout.propTypes = {
  initAccessType: func,
  initRazorPayPayment: func,
  getSubscription: func,
  validateCoupon: func,
  member: object,
};

export const SubscriptionPage = function ({ config }) {
  const member = useSelector((state) => get(state, ["member"], null));
  const email = get(member, ["email"], "abc@email.com");
  const phone = get(member, ["metadata", "phone-number"], "1234");
  const { key, accessTypeBkIntegrationId } = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
  );

  return (
    <>
      <AccessType
        enableAccesstype={true}
        isStaging={true}
        accessTypeKey={key}
        email={email}
        phone={phone}
        accessTypeBkIntegrationId={accessTypeBkIntegrationId}
      >
        {({ initAccessType, initRazorPayPayment, getSubscription, validateCoupon }) => (
          <SubscriptionLayout
            initAccessType={initAccessType}
            initRazorPayPayment={initRazorPayPayment}
            getSubscription={getSubscription}
            validateCoupon={validateCoupon}
            member={member}
          />
        )}
      </AccessType>
    </>
  );
};

SubscriptionPage.propTypes = {
  config: object,
};
