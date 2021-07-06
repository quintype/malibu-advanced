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
