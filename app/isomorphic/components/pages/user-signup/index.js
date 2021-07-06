import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import wretch from "wretch";

import { getCookie, getQueryParam } from "../../utils";

export const UserSignupPage = () => {
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const code = getQueryParam(window.location.href, "code");
      wretch()
        .url(`/user/update?code=${code}`)
        .post({ code: code })
        .res(res => {
          Promise.resolve(res);
        })
        .catch(ex => Promise.reject(ex));
    };

    getUserStatus();
  });

  useEffect(() => {
    const originUrl = getCookie("origin_url");
    console.log("foooooo", originUrl);
    if (member && originUrl) {
      window.location.href = originUrl;
    }
  }, [member]);
  return <div></div>;
};
