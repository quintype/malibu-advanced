import get from "lodash/get";
import fetch from "node-fetch";

async function createCampaign({ res, webhookContent, platform, url, webengageHeaders, logger }) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const TAGS = ["storypublish"];

  const webRequestPayload = {
    title,
    sdks: null,
    container: "ONETIME",
    tags: TAGS,
    experimentMetaData: { applyUCG: true },
    applyUCG: true,
  };

  const appRequestPayload = {
    title,
    sdks: [2, 3],
    container: "ONETIME",
    tags: TAGS,
    appIds: {},
  };
  const requestPayload = platform === "push-notifications" ? appRequestPayload : webRequestPayload;
  try {
    const apiResponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify(requestPayload),
      headers: webengageHeaders,
    });
    const audienceCreationResponse = await apiResponse.json();
    return get(audienceCreationResponse, ["response", "data", "id"]);
  } catch (e) {
    logger.error("Error handling Audience/Campaign Creation : " + e);
    res.status(503).send({ error: { message: "Audience/Campaign creation failure" } });
  }
}
export default createCampaign;
