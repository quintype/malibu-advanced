import React, { useState } from "react";
import { func, object } from "prop-types";

import "./checkout-modal.m.css";

const currencyLabels = {
  INR: "Rs.",
};

export const CheckoutModal = function ({ member, setActiveTab, initRazorPayPayment, selectedPlan, validateCoupon }) {
  const [couponCode, setCouponCode] = useState("");
  const [showCouponCode, setShowCouponCode] = useState(false);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  // const [paymentMethod, setPaymentMethod] = useState("")

  const { plan } = selectedPlan;

  return (
    <div styleName="modal">
      <div styleName="checkout-label">Checkout</div>
      <div styleName="secure">100% secure</div>
      <div styleName="current-step">Step 1 of 2</div>
      {member && (
        <div styleName="change-account">
          <div>
            Account <span>{"member.name"}</span>
          </div>
          <div onClick={() => setActiveTab("login")}>Not you?</div>
        </div>
      )}
      <div styleName="checkout-container">
        <div>
          <div styleName="label">Plan Details</div>
          <div styleName="plan-preview">
            <div styleName="plan-name-and-price">
              <div styleName="group-plan-name">{`${plan.title} - ${
                plan.recurring ? "Recurring Plan" : "One Time Plan"
              }`}</div>
              <div styleName="price">{`${currencyLabels[plan.price_currency]} ${plan.price_cents / 100}/-`}</div>
            </div>
          </div>
          <div styleName="validity">{`Valid for ${plan.duration_length} ${plan.duration_unit}`}</div>
          <div styleName="plan-and-coupon-btns">
            <div styleName="change-plan-btn" onClick={() => setActiveTab("subscription")}>
              Change Plan
            </div>
            <div styleName="add-coupon-code-btn" onClick={() => setShowCouponCode(true)}>
              Add Coupon Code
            </div>
          </div>
          {showCouponCode && (
            <div>
              <div styleName="coupon-code-label">Coupon code</div>
              <div styleName="coupon-apply">
                <input
                  styleName="coupon-code-input"
                  value={couponCode}
                  type="text"
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <div
                  onClick={() => {
                    validateCoupon(plan.id, couponCode)
                      .then((res) => {
                        console.log(
                          `Clicked Apply Coupon with ${plan.id} and ${couponCode} and the response is ${res}`
                        );
                        if (res.valid) {
                          setIsCouponApplied(true);
                        }
                      })
                      .catch((err) => console.error(`Razorpay coupon error: ${err}`));
                  }}
                  styleName="apply-coupon-btn"
                >
                  Apply
                </div>
              </div>
            </div>
          )}
          {isCouponApplied && <div styleName="amount-saved">You saved Rs. 350/-</div>}
        </div>
        <div styleName="total-payment">
          <div styleName="label">To Pay</div>
          <div styleName="price">{`${currencyLabels[plan.price_currency]} ${plan.price_cents / 100}/-`}</div>
        </div>
        <div>
          <div styleName="label">Payment Method</div>
          <input type={"radio"} id={"credit-debit-cards"} value={"razorpay"} checked />
          <label styleName="radio-label" htmlFor="credit-debit-cards">
            Credit/Debit Cards, UPI
          </label>
          <button
            styleName="proceed-to-payment-btn"
            onClick={() => {
              console.log("Plan selected is for payment is ---> ", selectedPlan.plan);
              global.AccessType.getPaymentOptions().then((paymentOptions) => {
                console.log("Payment Options --->", paymentOptions);
              });
              initRazorPayPayment(selectedPlan.plan, "standard");
              setActiveTab("payment");
            }}
          >
            Proceed to payment
          </button>
        </div>
      </div>
    </div>
  );
};

CheckoutModal.propTypes = {
  member: object,
  setActiveTab: func,
  initRazorPayPayment: func,
  selectedPlan: object,
  validateCoupon: func,
};
