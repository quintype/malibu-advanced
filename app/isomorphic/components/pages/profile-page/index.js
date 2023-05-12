import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AccessType } from "@quintype/components";
import { object, func } from "prop-types";
import get from "lodash/get";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import { ProfileCard } from "./ProfileCard";
import { EditProfile } from "./EditProfile";
import "./profile-page.m.css";

const EndDateText = ({ subscription }) => {
  if (subscription.cancelled) {
    return (
      <p>
        Subscription has been cancelled and will end on:
        <span>
          {new Date(subscription.end_timestamp).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </p>
    );
  } else {
    return (
      <p>
        {subscription.recurring ? "Renews on:" : "Expires on:"}{" "}
        <span>
          {new Date(subscription.end_timestamp).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </p>
    );
  }
};

EndDateText.propTypes = {
  subscription: object,
};

const ProfilePageBase = ({ member, getSubscriptionForUser, cancelSubscription }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [subscriptions, setSubscriptions] = useState(null);

  useEffect(() => {
    if (global.AccessType) {
      getSubscriptionForUser()
        .then((res) => {
          setSubscriptions(res.subscriptions);
        })
        .catch((err) => console.error("Error occurred inside profile page --->", err));
    }
  }, [global.AccessType, member]);

  const cancelSubscriptionHandler = function (subscriptionId) {
    const subscriptionIndex = subscriptions.findIndex((subscription) => subscription.id === subscriptionId);
    cancelSubscription(subscriptionId)
      .then((res) => {
        console.log("cancel subscription response is --->", res, subscriptionId);
        const updatedSubscriptions = [
          ...subscriptions.slice(0, subscriptionIndex),
          ...subscriptions.slice(subscriptionIndex + 1),
        ];
        setSubscriptions(updatedSubscriptions);
      })
      .catch((err) => console.error("Error from cancelSubscription is --->", err));
  };

  const getActiveSubscriptions = function (subscriptions = []) {
    const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "active");

    if (activeSubscriptions.length === 0) {
      return <div styleName="active-plan-label">No Active Subscriptions</div>;
    }

    return (
      <div>
        <div styleName="active-plan-label">{activeSubscriptions.length === 1 ? "Active Plan" : "Active Plans"}</div>
        {activeSubscriptions.map((subscription, id) => {
          return (
            <div key={id}>
              <span styleName="plan-name">{`${subscription.plan_name}`}</span>
              <EndDateText subscription={subscription} />
              <button styleName="button" onClick={() => cancelSubscriptionHandler(subscription.id)}>
                Cancel Subscription
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (!member) {
    return <div styleName="not-logged-in">Please Login</div>;
  }

  return (
    <div styleName="profile-page">
      <div styleName="my-account">My Account</div>
      <div styleName="profile-card">
        <div styleName="avatar">
          {member["avatar-url"] ? (
            <img src={member["avatar-url"]} alt="avatar" height="160px" width="160px" styleName="avatar-image" />
          ) : (
            <SvgIconHandler type="user" styleName="user-icon" />
          )}
        </div>

        {isEditing ? (
          <EditProfile member={member} setIsEditing={setIsEditing} isEditing={isEditing} />
        ) : (
          <div>
            <ProfileCard member={member} />
            <div styleName="buttons-container">
              <button styleName="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </div>
            {subscriptions === null ? (
              <div>
                <b>Loading...</b>
                <p>We are finding your subscriptions, Please wait</p>
              </div>
            ) : (
              getActiveSubscriptions(subscriptions)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ProfilePageBase.propTypes = {
  member: object,
  getSubscriptionForUser: func,
  cancelSubscription: func,
};

const ProfilePage = () => {
  const member = useSelector((state) => get(state, ["member"], null));
  const email = get(member, ["email"], "abc@gmail.com");
  const phone = get(member, ["metadata", "phone-number"], "1234");
  const { key, accessTypeBkIntegrationId } = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
  );

  return (
    <AccessType
      enableAccesstype={true}
      isStaging={true}
      accessTypeKey={key}
      email={email}
      phone={phone}
      accessTypeBkIntegrationId={accessTypeBkIntegrationId}
    >
      {({ getSubscriptionForUser, cancelSubscription }) => (
        <ProfilePageBase
          member={member}
          getSubscriptionForUser={getSubscriptionForUser}
          cancelSubscription={cancelSubscription}
        />
      )}
    </AccessType>
  );
};

export { ProfilePage };
