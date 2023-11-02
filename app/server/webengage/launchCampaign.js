import fetch from "node-fetch";
async function launchCampaign({ res, url, webengageHeaders, logger }) {
  try {
    const launchCampaignResponse = await (
      await fetch(url, {
        method: "PUT",
        headers: webengageHeaders,
      })
    ).json();
    console.log("FROM launchCampaign Response:", launchCampaignResponse);
    await (await fetch(url, { method: "PUT", headers: webengageHeaders })).json();
    console.log("FROM LAUNCH RESPONSE:", await (await fetch(url, { method: "PUT", headers: webengageHeaders })).json());
  } catch (e) {
    logger.error("Error handling launch Campaign:", +e);
    res.status(503).send({ error: { message: "Campaign activation failure" } });
  }
}

export default launchCampaign;
