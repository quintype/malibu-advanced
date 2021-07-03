import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import wretch from "wretch";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;

  return new URLSearchParams(urlSubstring2);
}

export const UserSignupPage = () => {
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const queryParams = useQuery();
      const code = queryParams.get("code");
      await wretch(`/api/v1/accounts/signup`).post({ code });
    };

    getUserStatus();
  }, []);

  useEffect(() => {
    if (member) {
      window.location.href = "/";
    }
  }, [member]);
  return <div></div>;
};
