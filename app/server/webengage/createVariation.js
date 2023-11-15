import get from "lodash/get";
import { licenseCode } from "../../../config/webengage-config";
import fetch from "node-fetch";

async function createVariation({ res, webhookContent, url, sketchesHost, webengageHeaders, logger }) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const message = get(webhookContent, ["message"], "");
  const subheadline = get(webhookContent, ["subheadline"], "");
  const storyUrl = get(webhookContent, ["story-url"], "");
  const slug = `${sketchesHost}/${get(webhookContent, ["slug"], "")}`;

  const webRequestPayload = [
    {
      layoutEId: "1af576ba",
      title,
      description: message || subheadline,
      sampling: 100,
      icon: `https://afiles.webengage.com/${licenseCode}/44091f7c-c5ce-4f9f-8a9a-511c540c29a4.jpg`,
      requireInteraction: true,
      cta: { actionText: "NA", actionLink: storyUrl || slug, type: "EXTERNAL_URL", isPrime: true },
    },
  ];

  console.log("webRequestPayload: CreateVariation >>>", webRequestPayload);

  try {
    const createVariationResponse = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(webRequestPayload),
      headers: webengageHeaders,
    });
    console.log("FROM createVariation Response VVV:", createVariationResponse);
    await (
      await fetch(url, {
        method: "PUT",
        body: JSON.stringify(webRequestPayload),
        headers: webengageHeaders,
      })
    ).json();
  } catch (e) {
    logger.error("Error handling Variation Creation : " + e);
    res.status(503).send({ error: { message: "Variation creation failure" } });
  }
}

export default createVariation;
