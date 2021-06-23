import React from "react";
import { useSelector } from "react-redux";
import get from "lodash/get";

const ProfilePage = () => {
  const member = useSelector(state => get(state, ["member"], null));
  console.log("fooooo", member);
  if (!member) {
    return <div>Please Login</div>;
  }

  return (
    <div>
      <h2>Profile page</h2>
      <div>Name: {member.name}</div>
      <div>Username: {member.username}</div>
      <div>Email: {member.email}</div>
    </div>
  );
};

export { ProfilePage };
