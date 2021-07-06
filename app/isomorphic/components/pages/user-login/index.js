import { get } from "lodash";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import AccountModal from "../../login/AccountModal";

const UserLoginPage = () => {
  const member = useSelector(state => get(state, ["member"], null));

  useEffect(() => {
    const redirectUrl = useQuery("post-login-redirect-uri");
    if (redirectUrl) {
      generateRedirect(redirectUrl);
    }
  }, []);

  useEffect(() => {
    const redirectUrl = useQuery("redirect_uri");
    if (redirectUrl && member) {
      generateRedirect(redirectUrl);
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

const generateRedirect = async redirectUrl => {
  const integrationId = 51;

  const params = `client_id=${integrationId}&redirect_uri=${redirectUrl}&response_type=code&allow_ajax=true`;
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
