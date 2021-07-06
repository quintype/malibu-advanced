export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

export const getQueryParam = (url, query) => {
  const urlObj = new URL(url);
  const urlSubstring = urlObj.search;
  return new URLSearchParams(urlSubstring).get(query);
};

export const generateRedirect = async (integrationId, redirectUrl) => {
  const params = `client_id=${integrationId}&redirect_uri=${redirectUrl}&response_type=code&allow_ajax=true`;
  const url = `/api/auth/v1/oauth/authorize?${params}`;
  const res = await window.fetch(url, {
    method: "GET"
  });
  if (res) {
    if (res.status === 200) {
      const response = await res.json();
      return response.redirect_uri;
    } else {
      const response = await res.json();
      window.alert(response.error_description);
    }
  }
};
