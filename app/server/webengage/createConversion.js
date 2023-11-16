import fetch from "node-fetch";
import get from "lodash/get";
import { licenseCode } from "../../../config/webengage-config";

async function createConversion({ res, webhookContent, url, campaignId, webengageHeaders, logger }) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const requestPayload = {
    deadline: "+7d",
    experiment: `${campaignId}`,
    licenseCode: `${licenseCode}`,
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

  try {
    await (
      await fetch(url, { method: "POST", body: JSON.stringify(requestPayload), headers: webengageHeaders })
    ).json();
  } catch (e) {
    logger.error("Error handling createConversion Creation : " + e);
    res.status(503).send({ error: { message: "Notification campaign creation failure" } });
  }
}

export default createConversion;
