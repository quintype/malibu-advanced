import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
import wretch from "wretch";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;

  return new URLSearchParams(urlSubstring2);
}

export const UserSignupPage = () => {
  // const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const queryParams = useQuery();
      const code = queryParams.get("code");
      wretch()
        .url(`/user/update?code=${code}`)
        .post({ code: code })
        .res(res => {
          console.log("res-------", res);
          Promise.resolve(res);
        })
        .catch(ex => Promise.reject(ex));
    };

    getUserStatus();
  });

  // useEffect(() => {
  //   if (member) {
  //     window.location.href = "/";
  //   }
  // }, [member]);
  return <div></div>;
};
