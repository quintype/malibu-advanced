import React from "react";
import { object } from "prop-types";
import "./profile-page.m.css";

const ProfileCard = ({ member }) => {
  return (
    <div styleName="fields-container">
      <p styleName="fields">
        <b>Name: </b>
        {member.name}
      </p>
      <p styleName="fields">
        <b>Email: </b>
        {member.email}
      </p>
    </div>
  );
};

ProfileCard.propTypes = {
  member: object
};

export { ProfileCard };
