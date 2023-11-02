import get from "lodash/get";
import fetch from "node-fetch";

async function createWebPushCampaign({ res, requestPayload, url, webengageHeaders, logger }) {
  try {
    const audienceCreationResponse = await (
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(requestPayload),
        headers: webengageHeaders,
      })
    ).json();
    const campaignId = get(audienceCreationResponse, ["response", "data", "id"]);
    console.log("audienceCreationResponse:", url, audienceCreationResponse, campaignId);
    return campaignId;
  } catch (e) {
    logger.error("Error handling Audience Creation : " + e);
    res.status(503).send({ error: { message: "Audience creation failure" } });
  }
}
export default createWebPushCampaign;
