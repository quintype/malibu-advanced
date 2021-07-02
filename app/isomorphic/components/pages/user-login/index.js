import React, { useEffect } from "react";
import AccountModal from "../../login/AccountModal";

function useQuery() {
  const urlObj2 = new URL(window.location.href);
  const urlSubstring2 = urlObj2.search;
  console.log("fooooo urlSubstring2", urlSubstring2);

  console.log("foooooo usequery", new URLSearchParams(urlSubstring2).get("redirect_urii"));

  return new URLSearchParams(urlSubstring2).get("redirect_urii");
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
      console.log("fooooooo", response);
      window.location.href = response.redirect_uri;
    } else {
      const response = await res.json();
      window.alert(response.error_description);
    }
  }
};

const UserLoginPage = () => {
  useEffect(() => {
    const redirectUrl = useQuery();
    if (redirectUrl) {
      foo();
    }
  }, []);
  return <AccountModal isPopup={false} />;
};

export { UserLoginPage };
