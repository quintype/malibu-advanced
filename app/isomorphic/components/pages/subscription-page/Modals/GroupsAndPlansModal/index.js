import React, { useEffect, useState } from "react";
import { object, func } from "prop-types";

import "./group-and-plans.m.css";

const groups = [
  {
    id: 1087,
    account_id: 740,
    name: "Student",
    description:
      "Student success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
    subscription_type: "standard",
    public: true,
    created_at: "2023-03-06T12:06:07.555Z",
    updated_at: "2023-03-06T12:06:07.555Z",
    deleted_at: null,
    preferred_identity_provider: "email",
    metadata_fields: [],
    currency: "USD",
    target_amount: null,
    target_amount_validation_enabled: false,
    api_ordering: null,
    campaign_active: false,
    assets: [],
    display_assets: [],
    subscription_plans: [
      {
        id: 3056,
        subscription_group_id: 1087,
        duration_length: 3,
        price_cents: 59900,
        price_currency: "INR",
        created_at: "2023-03-06T12:08:09.790Z",
        updated_at: "2023-03-06T12:08:09.790Z",
        duration_unit: "months",
        description:
          "[Medium] success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
        title: "Medium",
        max_trial_period_length: null,
        max_trial_period_unit: null,
        recurring: true,
        metadata: {},
        deleted_at: null,
        enabled: true,
        trial_period_enabled: false,
        supported_payment_providers: [],
        user_limit: null,
        trial_period_type: null,
        assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        display_assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        paid_trial_price_cents: null,
      },
      {
        id: 3055,
        subscription_group_id: 1087,
        duration_length: 1,
        price_cents: 39900,
        price_currency: "INR",
        created_at: "2023-03-06T12:07:29.766Z",
        updated_at: "2023-03-06T12:07:29.766Z",
        duration_unit: "months",
        description:
          "[Small] Success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
        title: "Small",
        max_trial_period_length: null,
        max_trial_period_unit: null,
        recurring: true,
        metadata: {},
        deleted_at: null,
        enabled: true,
        trial_period_enabled: false,
        supported_payment_providers: [],
        user_limit: null,
        trial_period_type: null,
        assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        display_assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        paid_trial_price_cents: null,
      },
    ],
  },
  {
    id: 1088,
    account_id: 740,
    name: "Professional",
    description:
      "Professional success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
    subscription_type: "standard",
    public: true,
    created_at: "2023-03-06T12:10:36.237Z",
    updated_at: "2023-03-06T12:10:36.237Z",
    deleted_at: null,
    preferred_identity_provider: "email",
    metadata_fields: [],
    currency: "USD",
    target_amount: null,
    target_amount_validation_enabled: false,
    api_ordering: null,
    campaign_active: false,
    assets: [],
    display_assets: [],
    subscription_plans: [
      {
        id: 3058,
        subscription_group_id: 1088,
        duration_length: 3,
        price_cents: 79900,
        price_currency: "INR",
        created_at: "2023-03-06T12:16:10.165Z",
        updated_at: "2023-03-06T12:16:32.060Z",
        duration_unit: "months",
        description:
          "[Medium] success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
        title: "Medium",
        max_trial_period_length: null,
        max_trial_period_unit: null,
        recurring: true,
        metadata: {},
        deleted_at: null,
        enabled: true,
        trial_period_enabled: false,
        supported_payment_providers: [],
        user_limit: null,
        trial_period_type: null,
        assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        display_assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        paid_trial_price_cents: null,
      },
      {
        id: 3057,
        subscription_group_id: 1088,
        duration_length: 1,
        price_cents: 49900,
        price_currency: "INR",
        created_at: "2023-03-06T12:15:36.367Z",
        updated_at: "2023-03-06T12:15:36.367Z",
        duration_unit: "months",
        description:
          "[Small] success plan means a personalized education plan intended to assist students with achieving readiness for college, career, and community engagement.",
        title: "Small",
        max_trial_period_length: null,
        max_trial_period_unit: null,
        recurring: true,
        metadata: {},
        deleted_at: null,
        enabled: true,
        trial_period_enabled: false,
        supported_payment_providers: [],
        user_limit: null,
        trial_period_type: null,
        assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        display_assets: [
          {
            title: "full-site",
            metadata: {},
            type: "site",
            published_at: {},
          },
        ],
        paid_trial_price_cents: null,
      },
    ],
  },
];

export const GroupsAndPlansModal = function ({ member, setActiveTab, initAccessType }) {
  const [value, setValue] = useState("");
  useEffect(() => {}, []);

  const handleChange = function (e) {
    setValue(e.target.value);
  };

  return (
    <>
      <div styleName="title">Choose A Plan</div>
      <p styleName="description">
        From daily newsletters to monthly digests, our flexible subscription options cater to your information needs.
        Subscribe now for comprehensive coverage and expert insights.
      </p>
      <div styleName="groups">
        {groups.map((group, id) => {
          return (
            <div key={id} styleName="group-card">
              <div styleName="group-name">{group.groupName}</div>
              <div styleName="plan-name">
                <select styleName="select-option" value={value} onChange={handleChange}>
                  {group.subscription_plans.map((plan, id) => {
                    return (
                      // eslint-disable-next-line react/jsx-key
                      <option value={plan.title}>
                        {`${plan.duration_length} ${plan.duration_unit} ${plan.price_cents / 100} ${
                          plan.price_currency
                        }`}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div styleName="plan-description">
                Access to the ahead news, including thearchive and crossword puzzles using apps and the some text here
              </div>
              <button
                styleName="subscribe-btn"
                onClick={() => (member ? setActiveTab("checkout") : setActiveTab("login"))}
              >
                Subscribe
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

GroupsAndPlansModal.propTypes = {
  member: object,
  setActiveTab: func,
};
