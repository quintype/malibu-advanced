export function oauthAuthorize(integrationId, redirectUrl, callbackUrl) {
  return wretch()
    .options({ credentials: "include" })
    .url(`${authHost}/sso-login`)
    .query({
      "callback-url": callbackUrl,
      "redirect-url": redirectUrl
    })
    .post(body)
    .json(res => {
      return res;
    })
    .catch(ex => Promise.reject(new Error(ex.message)));
}
