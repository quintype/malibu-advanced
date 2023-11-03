import fetch from "node-fetch";
async function scheduleCampaign({ res, url, webengageHeaders, logger }) {
  const requestPayload = {
    trafficSegmentDto: {},
    scheduler: {
      sendNow: true,
      sendInTz: "ACCOUNT",
      sendIntelligently: false,
      time: null,
    },
    triggerSet: null,
    oneTime: true,
    queueMessage: true,
    ttl: 86400,
    applyFrequencyCapping: false,
    incrementFrequencyCappingCount: false,
    applyDnd: false,
    startDate: null,
    endDate: null,
  };

  try {
    const scheduleCampaignResponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify(requestPayload),
      headers: webengageHeaders,
    });
    console.log("FROM scheduleCampaign Response VVV:", scheduleCampaignResponse);
    await (
      await fetch(url, { method: "POST", body: JSON.stringify(requestPayload), headers: webengageHeaders })
    ).json();
  } catch (e) {
    logger.error("Error handling ScheduleCampaign Creation : " + e);
    res.status(503).send({ error: { message: "Notification campaign creation failure" } });
  }
}

export default scheduleCampaign;
