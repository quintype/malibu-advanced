import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import AccountModal from "../../login/AccountModal";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;
  return new URLSearchParams(urlSubstring2).get("redirect-urii");
}

const foo = async () => {
  const integrationId = 51;
  const redirectUri = `https://malibu-advanced-web.qtstage.io/user/signup`;

  const params = `client_id=${integrationId}&redirect_uri=${redirectUri}&response_type=code&allow_ajax=true`;
  const url = `/api/auth/v1/oauth/authorize?${params}`;
  const res = await window.fetch(url, {
    method: "GET"
  });
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

const UserLoginPage = () => {
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const redirectUrl = useQuery();
    console.log("fooooooo redirectUrl", redirectUrl);
    if (redirectUrl || member) {
      foo();
    }
  }, []);

  useEffect(() => {
    if (member) {
      foo();
    }
  }, [member]);
  return <AccountModal isPopup={false} />;
};

export { UserLoginPage };
