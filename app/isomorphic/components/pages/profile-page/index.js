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
  switch (subscription.status) {
    case "active":
      if (subscription.cancelled) {
        return (
          <p styleName="end-date-text">
            Subscription has been cancelled and will end on:
            <span styleName="highlighted-date primary-highlighted-text">
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
          <p styleName="end-date-text">
            {subscription.recurring ? "Renews on:" : "Expires on:"}{" "}
            <span styleName="highlighted-date">
              {new Date(subscription.end_timestamp).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        );
      }
    case "pending":
      return (
        <p styleName="end-date-text">
          Subscription starts from:{" "}
          <span styleName="highlighted-date">
            {new Date(subscription.start_timestamp).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>{" "}
          and will {subscription.recurring ? "renew on:" : "expire on:"}{" "}
          <span styleName="highlighted-date">
            {new Date(subscription.end_timestamp).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </p>
      );
    case "cancelled":
      return (
        <p styleName="end-date-text">
          {new Date(subscription.cancelled_at) > new Date() ? "Cancels" : "Cancelled"} on:{" "}
          <span styleName="highlighted-date">
            {new Date(subscription.cancelled_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </p>
      );
    case "expired":
      return (
        <p styleName="end-date-text">
          {new Date(subscription.end_timestamp) > new Date() ? "Expires" : "Expired"} on:{" "}
          <span styleName="highlighted-date">
            {new Date(subscription.end_timestamp).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </p>
      );
    default:
      return <p styleName="end-date-text"></p>;
  }
};

EndDateText.propTypes = {
  subscription: object,
};

const ProfilePageBase = ({ member, getSubscriptionForUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSubscriptions, setActiveSubscriptions] = useState([]);

  useEffect(() => {
    getSubscriptionForUser()
      .then((res) => {
        const subscriptions = res.subscriptions;
        const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "active");
        setActiveSubscriptions(activeSubscriptions);
      })
      .catch((err) => console.error("Error occurred inside profile page --->", err));
  }, []);

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
        <>
          {activeSubscriptions && activeSubscriptions.length ? (
            <div>
              <div className="active-plan-label">{activeSubscriptions.length === 1 ? "Your Plan" : "Your Plans"}</div>
              {activeSubscriptions.map((subscription, id) => {
                return (
                  <div key={id}>
                    <span>{`${subscription.plan_name} - ${subscription.status}`}</span>
                    <EndDateText subscription={subscription} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div>No Active Subscriptions</div>
          )}
        </>
        {isEditing ? (
          <EditProfile member={member} setIsEditing={setIsEditing} isEditing={isEditing} />
        ) : (
          <div>
            <ProfileCard member={member} />
            <div styleName="buttons-container">
              <button styleName="button" onClick={() => setIsEditing(!isEditing)}>
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
      {({ getSubscriptionForUser }) => (
        <ProfilePageBase member={member} getSubscriptionForUser={getSubscriptionForUser} />
      )}
    </AccessType>
  );
};

ProfilePageBase.propTypes = {
  member: object,
  getSubscriptionForUser: func,
  checkAccess: func,
};

export { ProfilePage };
