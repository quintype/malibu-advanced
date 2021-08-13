import wretch from "wretch";
export function oauthAuthorize(integrationId, redirectUrl, callbackUrl) {
  return wretch()
    .options({ credentials: "include" })
    .url(`/api/auth/v1/oauth/authorize`)
    .query({ client_id: integrationId, redirect_uri: redirectUrl, response_type: "code", allow_ajax: true })
    .get()
    .json(res => {
      return res;
    })
    .catch(ex => Promise.reject(new Error(ex.message)));
}
