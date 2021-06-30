import { get } from "lodash";
import React, { useEffect, useState } from "react";
import wretch from "wretch";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;

  return new URLSearchParams(urlSubstring2);
}

export const UserSignupPage = () => {
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    const getUserStatus = async () => {
      const queryParams = useQuery();
      const code = queryParams.get("code");
      const signupReq = await wretch(`/api/v1/accounts/signup`).post({ code });
      setUserStatus(signupReq.data);
    };
    !userStatus && getUserStatus();

    if (userStatus && get(userStatus, ["status"]) === "success") {
      window.location.href = "/";
    }
  });
  return <div></div>;
};
