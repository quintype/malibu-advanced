import { useEffect, useState } from "react";

/* eslint-disable no-unused-vars */
const WithSSO = ({ ssoHost, redirectUrl, callbackUrl, signInPath, signUpPath, children }) => {
  const [redirectUrl1, setRedirectUrl1] = useState(null);

  const foo = async () => {
    const integrationId = 51;
    const redirectUri = `${callbackUrl}/user/signup`;
    console.log("fooooo redirectUri", redirectUri);
    const params = `client_id=${integrationId}&redirect_uri=${redirectUri}&response_type=code&allow_ajax=true`;
    const url = `/api/auth/v1/oauth/authorize?${params}`;
    const res = await window.fetch(url, {
      method: "GET"
    });

    if (res) {
      if (res.status === 200) {
        const response = await res.json();
        setRedirectUrl1(response.redirect_uri);
      } else {
        const response = await res.json();
        window.alert(response.error_description);
      }
    }
  };

  useEffect(() => {
    if (callbackUrl) {
      foo();
    }
  }, []);

  const formUrl = path => {
    if (!path) {
      return null;
    }

    const url = new URL(ssoHost);

    url.searchParams.set("redirect-url", redirectUrl);
    url.searchParams.set("callback-url", callbackUrl);
    path && url.searchParams.set("auth-page", `${ssoHost}${path}`);

    return url.href;
  };

  console.log("fooooooo redirectUrl1", redirectUrl1);

  return children({
    signInHref: redirectUrl1,
    signUpHref: formUrl(signUpPath)
  });
};

WithSSO.defaultProps = {
  signUpRedirectPath: "",
  redirectUrl: global.location && global.location.href,
  callbackUrl: global.location && global.location.origin
};

export default WithSSO;
