import get from "lodash/get";
import fetch from "node-fetch";

async function createWebPushCampaign({ res, webhookContent, url, webengageHeaders, logger }) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const TAGS = ["storypublish"];

  const requestPayload = {
    title,
    sdks: null,
    container: "ONETIME",
    tags: TAGS,
    experimentMetaData: { applyUCG: true },
    applyUCG: true,
  };

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
