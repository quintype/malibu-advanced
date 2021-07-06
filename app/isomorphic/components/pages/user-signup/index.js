import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
import wretch from "wretch";

import { getQueryParam } from "../../utils";

export const UserSignupPage = () => {
  // const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const code = getQueryParam(window.location.href, "code");
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
