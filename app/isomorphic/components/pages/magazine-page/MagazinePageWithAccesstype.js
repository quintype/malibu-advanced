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

    return activeSubscriptions;
  };

  return (
    <ol>
      {getActiveSubscriptions(subscriptions).map((subscription, id) => (
        <li key={id}>{subscription}</li>
      ))}
      {subscriptions.length === 0 && <p>No Subscriptions found</p>}
    </ol>
  );
};

MagazinePageWithAccesstype.propTypes = {
  initAccessType: func,
  member: object,
  getSubscriptionForUser: func,
  isATGlobal: bool,
};
