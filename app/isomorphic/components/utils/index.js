export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

export const getQueryParams = (url, requiredParam) => {
  const urlObj = new URL(url);
  const urlSubstring = urlObj.search.substring(1);
  var getQuery = new URLSearchParams(urlSubstring);
  const queryObj = {};

  if (requiredParam.length < 1) {
    return null;
  }

  requiredParam.forEach(param => {
    Object.assign(queryObj, {
      [param]: getQuery.get(param)
    });
  });
  return queryObj;
};
