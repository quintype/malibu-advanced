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

  try {
    const audienceCreationResponse = await (
      await fetch(url, {
        method: "POST",
        body: JSON.stringify(platform === "push-notifications" ? appRequestPayload : webRequestPayload),
        headers: webengageHeaders,
      })
    ).json();
    const campaignId = get(audienceCreationResponse, ["response", "data", "id"]);
    return campaignId;
  } catch (e) {
    logger.error("Error handling Audience Creation : " + e);
    res.status(503).send({ error: { message: "Audience creation failure" } });
  }
}
export default createCampaign;
