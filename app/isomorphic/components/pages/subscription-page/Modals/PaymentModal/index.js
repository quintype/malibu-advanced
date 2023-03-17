import React from "react";
import { func } from "prop-types";


export const PaymentModal = function ({ setActiveTab }) {
  return (
    <>
      <div>This is a payment page</div>
      <button onClick={() => setActiveTab("subscription")}>Restart the flow</button>
    </>
  );
};

PaymentModal.propTypes = {
  setActiveTab: func,
};
