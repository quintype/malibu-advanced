import fetch from "node-fetch";
async function launchCampaign({ res, url, webengageHeaders, logger }) {
  try {
    const response = await fetch(url, { method: "PUT", headers: webengageHeaders });
    await response.json();
  } catch (e) {
    logger.error("Error handling launch Campaign:", +e);
    res.status(503).send({ error: { message: "Campaign activation failure" } });
  }
}

export default launchCampaign;
