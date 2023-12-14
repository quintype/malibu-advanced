import React, { useState, useEffect } from "react";
import { object, func } from "prop-types";
import get from "lodash/get";
import "./group-and-plans.m.css";

export const GroupsAndPlansModal = ({ member, setActiveTab, setSelectedPlan, getSubscription }) => {
  const [subscriptionsData, setSubscriptionsData] = useState([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    getSubscription().then((res) => setSubscriptionsData(res));
  }, []);

  useEffect(() => {
    const defaultSelectedOptions = {};
    subscriptionsData.forEach((group) => {
      const firstPlan = get(group, ["subscription_plans", "0"]);
      defaultSelectedOptions[group.name] = firstPlan;
    });
    setSelectedSubscriptions(defaultSelectedOptions);
  }, [subscriptionsData]);

  const handlePlanSelection = (groupName) => {
    setSelectedPlan({ plan: selectedSubscriptions[groupName] });
    member ? setActiveTab("checkout") : setActiveTab("login");
  };

  const handleOptionClick = (groupName, plan) => {
    setSelectedOption(plan);
    setSelectedSubscriptions({ ...selectedSubscriptions, [groupName]: plan });
  };

  return (
    <>
      <div styleName="title">Choose A Plan</div>
      <p styleName="description">
        From daily newsletters to monthly digests, our flexible subscription options cater to your information needs.
        Subscribe now for comprehensive coverage and expert insights.
      </p>
      <div styleName="groups">
        {subscriptionsData.map((group, id) => {
          const renderRichText = (richText) => {
            return <div dangerouslySetInnerHTML={{ __html: richText }} />;
          };
          const groupName = selectedSubscriptions[group.name];
          const groupDurationLength = groupName && groupName.duration_length;
          const groupDurationUnit = groupName && groupName.duration_unit;
          const planDurationLength = group.subscription_plans.map((plan, index) => get(plan, ["duration_length"], ""));
          const planDurationUnit = group.subscription_plans.map((plan, index) => get(plan, ["duration_unit"], ""));
          const planCustomAttributes = group.subscription_plans.map((plan, index) =>
            get(plan, ["custom_attributes"], "")
          );
          return (
            <div key={id} styleName="group-card">
              <div styleName="group-name">{group.name}</div>
              <div styleName="plan-name">
                <div>
                  {groupName && (
                    <div styleName="selected-option" onClick={() => handleOptionClick(group.name, groupName)}>
                      {groupDurationLength}&nbsp;
                      {groupDurationLength === 1
                        ? groupDurationUnit.substring(0, groupDurationUnit.length - 1)
                        : groupDurationUnit}
                      &nbsp;
                      {groupName.price_cents / 100}&nbsp;
                      {groupName.price_currency}
                    </div>
                  )}
                  <div>
                    {group.subscription_plans.map((plan, index) => (
                      <>
                        <div
                          key={index}
                          styleName={`option ${selectedOption === plan ? "option-select" : ""}`}
                          onClick={() => handleOptionClick(group.name, plan)}
                        >
                          {1 + index})&nbsp;
                          {planDurationLength}&nbsp;
                          {planDurationLength === 1
                            ? planDurationUnit.substring(0, planDurationUnit.length - 1)
                            : planDurationUnit}
                          &nbsp;
                          {plan.price_cents / 100}&nbsp;
                          {plan.price_currency} &nbsp;
                          {planCustomAttributes &&
                            planCustomAttributes.map((attribute, index) => (
                              <div key={index}>{attribute.value && renderRichText(attribute.value)}</div>
                            ))}
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              </div>
              <div styleName="plan-description">{group.description}</div>
              <button styleName="subscribe-btn" onClick={() => handlePlanSelection(group.name)}>
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
  initAccessType: func,
  subscriptionsData: object,
  setSelectedPlan: func,
  getSubscription: func,
};
