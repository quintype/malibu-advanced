import get from "lodash/get";
import {
  webPushTextLayoutId,
  appPushTextLayoutId,
  appPushBannerLayoutId,
  icon,
} from "../../../config/webengage-config";
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
      layoutEId: webPushTextLayoutId,
      title,
      description: message || subheadline,
      sampling: 100,
      icon,
      requireInteraction: true,
      cta: { actionText: "NA", actionLink: storyUrl || slug, type: "EXTERNAL_URL", isPrime: true },
    },
  ];
  const appPushRequestPayload = [
    {
      sampling: 50,
      layoutEId: appPushTextLayoutId,
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
      layoutEId: appPushBannerLayoutId,
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
  const requestPayload = platform === "push-notifications" ? appPushRequestPayload : webRequestPayload;

  try {
    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(requestPayload),
      headers: webengageHeaders,
    });
    await response.json();
  } catch (e) {
    logger.error("Error handling Variation Creation : " + e);
    res.status(503).send({ error: { message: "Variation creation failure" } });
  }
}

export default createVariation;
