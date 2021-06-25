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
  let queryObj;
  if (requiredParam.length) {
    return requiredParam.map(param => {
      Object.assign(queryObj, {
        param: getQuery.get(param)
      });
    });
  }
};
