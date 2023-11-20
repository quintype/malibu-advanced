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
    applyFrequencyCapping: true,
    incrementFrequencyCappingCount: true,
    applyDnd: true,
    startDate: null,
    endDate: null,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(requestPayload),
      headers: webengageHeaders,
    });
    await response.json();
  } catch (e) {
    logger.error("Error handling ScheduleCampaign  : " + e);
    res.status(503).send({ error: { message: "ScheduleCampaign failure" } });
  }
}

export default scheduleCampaign;
