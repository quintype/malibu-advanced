import { get } from "lodash";
import React, { useEffect } from "react";
// import { useSelector } from "react-redux";
import axios from "axios";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;

  return new URLSearchParams(urlSubstring2);
}

const getAccessToken = async (authCode, brkeConfig) => {
  const { bridgekeeperIntegrationId, bridgekeeperIntegrationSecret, bridgekeeperHost, bridgekeeperApiKey } = brkeConfig;

  if (!bridgekeeperIntegrationId || !bridgekeeperIntegrationSecret || !bridgekeeperHost) {
    return Promise.reject(new Error("Unable to get accessToken: invalid bridgekeeper config"));
  }

  const tokenUrl = `${bridgekeeperHost}/api/auth/v1/oauth/token`;

  const form = new URLSearchParams();
  form.append("client_id", bridgekeeperIntegrationId);
  form.append("client_secret", bridgekeeperIntegrationSecret);
  form.append("grant_type", "authorization_code");
  form.append("code", authCode);

  try {
    const requestTokenResponse = await axios.post(tokenUrl, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-BK-AUTH": bridgekeeperApiKey }
    });
    const accessToken = get(requestTokenResponse, ["data", "access_token"]);
    return accessToken;
  } catch (err) {
    console.log(`Request for Access Token Failed:${err}`);
  }
};

const signupHandler = async code => {
  const bridgekeeperIntegrationId = 51;
  const bridgekeeperIntegrationSecret = "kcRFrsf89as8fHkfhHihbg3LMHjii8";
  const bridgekeeperHost = "http://bridgekeeper.alb.staging.quinpress.internal";
  const bridgekeeperApiKey = "mxdnwJFPrZUQDPuV";

  const brkeConfig = { bridgekeeperIntegrationId, bridgekeeperIntegrationSecret, bridgekeeperHost, bridgekeeperApiKey };

  try {
    const accessToken = await getAccessToken(code, brkeConfig);
    const cookieConf = { httpOnly: true };
    if (process.env.NODE_ENV !== "development") {
      cookieConf.secure = true;
    }
    console.log("fooooo accessToken", accessToken);

    // res.cookie("token", accessToken, cookieConf);
    // return res.send({});
  } catch (err) {
    console.log(err);
    // return res.send({ error: "User authentication failed" });
  }
};

export const UserSignupPage = () => {
  // const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const getUserStatus = async () => {
      const queryParams = useQuery();
      const code = queryParams.get("code");
      signupHandler(code);
      // await wretch(`/api/v1/accounts/signup`).post({ code });
    };

    getUserStatus();
  }, []);

  // useEffect(() => {
  //   if (member) {
  //     window.location.href = "/";
  //   }
  // }, [member]);
  return <div></div>;
};
