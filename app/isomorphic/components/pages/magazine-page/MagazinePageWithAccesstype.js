import { object, func, bool } from "prop-types";
import React, { useEffect, useState } from "react";

export const MagazinePageWithAccesstype = ({ member, getSubscriptionForUser, isATGlobal, initAccessType }) => {
  const [subscriptions, setSubscriptions] = useState(null);

  useEffect(() => {
    initAccessType(() => {
      getSubscriptionForUser()
        .then((res) => {
          setSubscriptions(res.subscriptions);
        })
        .catch((err) => console.error("Error occurred inside profile page --->", err));
    });
  }, [global.AccessType, member, isATGlobal]);

  const getActiveSubscriptions = (subscriptions = []) => {
    const activeSubscriptions = subscriptions
      .filter((plan) => plan.subscription_type === "standard" || plan.subscription_type === "group_access")
      .filter((plan) => plan.status === "active");

    if (activeSubscriptions.length === 0) return null;

    return (
      <div>
        <div>{activeSubscriptions.length === 1 ? "ACTIVE PLAN" : "ACTIVE PLANS"}</div>
        {activeSubscriptions.map((subscription, id) => {
          return (
            <div key={id}>
              <span>{`${subscription.plan_name}`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ol>
      {subscriptions === null ? (
        <div>
          <b>Loading...</b>
          <p>We are finding your subscriptions, Please wait</p>
        </div>
      ) : (
        <>{getActiveSubscriptions(subscriptions)}</>
      )}
    </ol>
  );
};

MagazinePageWithAccesstype.propTypes = {
  initAccessType: func,
  member: object,
  getSubscriptionForUser: func,
  isATGlobal: bool,
};
