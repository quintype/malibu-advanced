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
  const storyUrl = get(webhookContent, ["story-url"], "");
  const slug = `${sketchesHost}/${get(webhookContent, ["slug"], "")}`;
  const STORY_PUBLISH_EVENT = "story-publish";
  const heroImage =
    eventType === STORY_PUBLISH_EVENT
      ? `${cdnName}${get(webhookContent, ["v1", "data", "hero-image-s3-key"])}`
      : get(webhookContent, ["hero-image-url"], "");

  const webRequestPayload = [
    {
      layoutEId: "i78egae",
      title,
      description: message || subheadline,
      sampling: 100,
      icon: `https://afiles.webengage.com/${licenseCode}/97bd14d8-58fe-4303-be6c-9a1c2b99787f.jpg`,
      requireInteraction: true,
      cta: { actionText: "NA", actionLink: storyUrl || slug, type: "EXTERNAL_URL", isPrime: true },
    },
  ];
  const appPushRequestPayload = [
    {
      sampling: 50,
      layoutEId: "2341ifc5",
      title,
      message: message || subheadline,
      androidDetails: {
        expandableDetails: {},
      },
      iosDetails: {
        expandableDetails: {},
      },
    },
    {
      sampling: 50,
      layoutEId: "~20cc49c5",
      experimentVariationStatus: "ACTIVE",
      title,
      message: message || subheadline,
      androidDetails: {
        expandableDetails: {
          image: heroImage,
        },
      },
      iosDetails: {
        expandableDetails: {
          image: heroImage,
        },
      },
    },
  ];
  try {
    await (
      await fetch(url, {
        method: "PUT",
        body: JSON.stringify(platform === "push-notifications" ? appPushRequestPayload : webRequestPayload),
        headers: webengageHeaders,
      })
    ).json();
  } catch (e) {
    logger.error("Error handling Variation Creation : " + e);
    res.status(503).send({ error: { message: "Variation creation failure" } });
  }
}

export default createVariation;
