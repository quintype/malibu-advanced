import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import AccountModal from "../../login/AccountModal";

const UserLoginPage = () => {
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const redirectUrl = useQuery("redirect-urii");
    console.log("foooooo redirectUrl11111", redirectUrl);
    if (redirectUrl) {
      foo(redirectUrl);
    }
  }, []);

  useEffect(() => {
    const redirectUrl = useQuery("redirect_uri");
    console.log("foooooo redirectUrl2222222", redirectUrl);
    if (redirectUrl && member) {
      foo(redirectUrl);
    }
  }, [member]);

  return <AccountModal isPopup={false} />;
};

export { UserLoginPage };

function useQuery(params) {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;
  return new URLSearchParams(urlSubstring2).get(params);
}

const foo = async redirectUrl => {
  const integrationId = 51;

  const params = `client_id=${integrationId}&redirect_uri=${redirectUrl}&response_type=code&allow_ajax=true`;
  const url = `/api/auth/v1/oauth/authorize?${params}`;
  const res = await window.fetch(url, {
    method: "GET"
  });
  console.log("foooooo params", params);
  console.log("foooooo res", res);
  if (res) {
    if (res.status === 200) {
      const response = await res.json();
      window.location.href = response.redirect_uri;
    } else {
      const response = await res.json();
      window.alert(response.error_description);
    }
  }
};
