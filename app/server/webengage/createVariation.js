import get from "lodash/get";
import { licenseCode } from "../../../config/webengage-config";
import fetch from "node-fetch";

async function createVariation({
  res,
  webhookContent,
  platform,
  url,
  sketchesHost,
  eventType,
  cdnName,
  webengageHeaders,
  logger,
}) {
  const headline = get(webhookContent, ["headline"], "");
  const title = get(webhookContent, ["title"], headline);
  const message = get(webhookContent, ["message"], "");
  const subheadline = get(webhookContent, ["subheadline"], "");
  // const storyUrl = get(webhookContent, ["story-url"], "");
  // const slug = `${sketchesHost}/${get(webhookContent, ["slug"], "")}`;
  // const publicIdentifier = get(webhookContent, ["public-identifier"]) || storyUrl.split("-").pop();
  const heroImage =
    eventType === "story-publish"
      ? `${cdnName}${get(webhookContent, ["v1", "data", "hero-image-s3-key"])}`
      : get(webhookContent, ["hero-image-url"], "");

  console.log("3. createCampaignVariations: LOGS ", licenseCode, webhookContent, eventType, heroImage);

  const getLayout = async () => {
    try {
      console.log("am ENTRING GETLAYOUT!!!", licenseCode);
      const creationVariationResponse = await (
        await fetch(`https://api.webengage.com/api/accounts/${licenseCode}/cta-templates?layoutId=text`)
      ).json();
      console.log("Layouts: LOGS 222 >>>", creationVariationResponse);
      const layoutId = get(creationVariationResponse, ["response", "data", "0", "id"]);
      console.log("Layouts: LOGS 333 >>>", layoutId);
      return layoutId;
    } catch (e) {
      logger.error("Error handling layoutList  : " + e);
      res.status(503).send({ error: { message: "Error handling layoutList!!" } });
    }
  };

  const webRequestPayload = [
    {
      layoutEId: await getLayout(),
      title,
      description: message || subheadline,
      sampling: 100,
      icon: `https://afiles.webengage.com/${licenseCode}/44091f7c-c5ce-4f9f-8a9a-511c540c29a4.jpg`,
    },
  ];
  console.log("webRequestPayload: CreateVariation >>>", webRequestPayload, webRequestPayload[0].layoutEId);

  try {
    const createVariationResponse = await (
      await fetch(url, {
        method: "PUT",
        body: JSON.stringify(webRequestPayload),
        headers: webengageHeaders,
      })
    ).json();
    console.log("FROM createVariation Response:", createVariationResponse);
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
