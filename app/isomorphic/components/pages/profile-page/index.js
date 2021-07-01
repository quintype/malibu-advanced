import React from "react";
import { useSelector } from "react-redux";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";

import "./profile-page.m.css";

const ProfilePage = () => {
  const member = useSelector(state => state.member || null);
  if (!member) {
    return <div styleName="not-logged-in">Please Login</div>;
  }

  return (
    <div styleName="profile-page">
      <div styleName="avatar">
        {member["avatar-url"] ? (
          <img src={member["avatar-url"]} alt="avatar" height="160px" width="160px" styleName="avatar-image" />
        ) : (
          <SvgIconHandler type="user" styleName="user-icon" />
        )}
        <p styleName="full-name">{member.name}</p>
      </div>
      <div styleName="profile-information">
        <p styleName="fields">
          <strong>Name: </strong>
          {member.name}
        </p>
        <p styleName="fields">
          <strong>Email: </strong>
          {member.email}
        </p>
      </div>
    </div>
  );
};

export { ProfilePage };
