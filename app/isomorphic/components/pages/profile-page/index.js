import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { object, func, bool } from "prop-types";
import get from "lodash/get";

import { updateUserProfile, currentUser } from "@quintype/bridgekeeper-js";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import { MEMBER_UPDATED } from "../../store/actions";

import "./profile-page.m.css";

const EditProfile = ({ setIsEditing, isEditing }) => {
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const getCurrentUser = async () => {
    try {
      const currentUserResp = await currentUser();
      dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
    } catch (err) {
      console.log("error--------", err);
    }
  };

  const onSubmitHandler = e => {
    e.preventDefault();
    updateUserProfile({ name })
      .then(getCurrentUser)
      .then(() => setIsEditing(!isEditing))
      .catch(err => console.error(err));
  };

  const handleChange = e => {
    setName(e.target.value);
  };

  return (
    <div styleName="profile-card">
      <form styleName="profile-information" onSubmit={onSubmitHandler}>
        <div styleName="fields">
          <label>Name: </label>
          <input name="Name" type="text" value={name} onChange={handleChange} />
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

const ProfileCard = ({ member }) => {
  return (
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
  );
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const member = useSelector(state => state.member || null);

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
            <button onClick={() => setIsEditing(!isEditing)}>Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

EditProfile.propTypes = {
  isEditing: bool,
  setIsEditing: func
};

ProfileCard.propTypes = {
  member: object
};

export { ProfilePage };
