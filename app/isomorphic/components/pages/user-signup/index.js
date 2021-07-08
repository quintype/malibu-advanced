import { get } from "lodash";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import wretch from "wretch";

import { MEMBER_UPDATED } from "../../store/actions";

import { getCookie, getQueryParam } from "../../utils";

export const UserSignupPage = () => {
  const dispatch = useDispatch();
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const code = getQueryParam(window.location.href, "code");
      wretch()
        .url("/user/update")
        .post({ code: code })
        .res(res => {
          Promise.resolve(res);
        })
        .catch(ex => Promise.reject(ex))
        .finally(async () => {
          const { currentUser } = await import("@quintype/bridgekeeper-js");
          try {
            const currentUserResp = await currentUser();
            dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
          } catch (err) {
            console.log("error--------", err);
          }
        });
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
