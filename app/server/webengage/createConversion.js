import fetch from "node-fetch";
import get from "lodash/get";

async function createConversion({ res, webhookContent, url, webengageHeaders, logger }) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const requestPayload = {
    deadline: "+7d",
    controlGroup: 0,
    name: title,
    triggerSet: {
      triggers: [
        {
          name: "Trigger ",
          category: "application",
          type: "EVENT",
          timeDifference: "",
          timeAttribute: {
            name: "event_time",
            category: "system",
          },
          filters: null,
        },
      ],
    },
    version: 2,
    status: "ACTIVE",
  };

  console.log("4.createConversion: LOGS ", url, requestPayload);

  try {
    console.log(
      "FROM Create Conversion:",
      await fetch(url, { method: "POST", body: JSON.stringify(requestPayload), headers: webengageHeaders })
    );
    await (
      await fetch(url, { method: "POST", body: JSON.stringify(requestPayload), headers: webengageHeaders })
    ).json();
  } catch (e) {
    logger.error("Error handling createConversion Creation : " + e);
    res.status(503).send({ error: { message: "Notification campaign creation failure" } });
  }
}

export default createConversion;
