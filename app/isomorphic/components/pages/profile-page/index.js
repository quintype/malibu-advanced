import React from "react";
import { useSelector } from "react-redux";
import get from "lodash/get";
import "./profile-page.m.css";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler/index";

const ProfilePage = () => {
  const member = useSelector(state => get(state, ["member"], null));
  if (!member) {
    return <div>Please Login</div>;
  }

  return (
    <div styleName="profile-page">
      <div styleName="avatar">
        {member["avatar-url"] ? (
          <img src={member["avatar-url"]} alt="avatar" styleName="avatar-image" />
        ) : (
          <SvgIconHandler type="user" styleName="avatar-image" />
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
      <div>
        <button styleName="button">Edit Profile</button>
      </div>
    </div>
  );
};

export { ProfilePage };
