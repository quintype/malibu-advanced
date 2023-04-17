import React, { useState } from "react";
import { useSelector } from "react-redux";
import { AccessType } from "@quintype/components";
import { object, func } from "prop-types";
import get from "lodash/get";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import { ProfileCard } from "./ProfileCard";
import { EditProfile } from "./EditProfile";
import "./profile-page.m.css";

const ProfilePageBase = ({ member, getSubscriptionForUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  getSubscriptionForUser().then((res) => {
    console.log("--->", res);
  });
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

  return (
    <AccessType
      enableAccesstype={true}
      isStaging={true}
      accessTypeKey={"Aw4ujaqhpn8aVMT7yzQawSyZ"}
      email={email}
      phone={phone}
      id={1170884}
      accessTypeBkIntegrationId={455}
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
};

export { ProfilePage };
