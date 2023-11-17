import logger from "@quintype/framework/server/logger";
import { getClient } from "@quintype/framework/server/api-client";
import createCampaign from "./createCampaign";
import scheduleCampaign from "./scheduleCampaign";
import createVariation from "./createVariation";
import launchCampaign from "./launchCampaign";
import get from "lodash/get";
import { licenseCode, apiKey } from "../../../config/webengage-config";
import createConversion from "./createConversion";

const BASE_URL = "https://api.webengage.com";

const WEB_PUSH_PLATFORM = "web-push";
const APP_PUSH_PLATFORM = "push-notifications";

const webengageHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiKey}`,
};

const sendWebPushNotification = async ({ res, webhookContent, cdnName, sketchesHost, eventType }) => {
  // Step 1 : AUDIENCE Selection
  const campaignId = await createCampaign({
    res,
    webhookContent,
    platform: WEB_PUSH_PLATFORM,
    url: `${BASE_URL}/api/v2/accounts/${licenseCode}/${WEB_PUSH_PLATFORM}`,
    webengageHeaders,
    logger,
  });

  // Step 2: Schedule campaign  -- WHEN
  await scheduleCampaign({
    res,
    url: `${BASE_URL}/api/v1/accounts/${licenseCode}/${WEB_PUSH_PLATFORM}/${campaignId}/targetingRule/schedule`,
    webengageHeaders,
    logger,
  });

  // Step 3: Create variation either Text / Banner -- MESSAGE
  await createVariation({
    res,
    webhookContent,
    platform: WEB_PUSH_PLATFORM,
    url: `${BASE_URL}/api/v1/accounts/${licenseCode}/${WEB_PUSH_PLATFORM}/${campaignId}/variations`,
    sketchesHost,
    eventType,
    cdnName,
    webengageHeaders,
    logger,
  });

  // Step 4: Conversion Tracking
  await createConversion({
    res,
    webhookContent,
    url: `${BASE_URL}/api/v1/accounts/${licenseCode}/conversions`,
    campaignId,
    webengageHeaders,
    logger,
  });

  // Step 5: Activate / Launch
  await launchCampaign({
    res,
    url: `${BASE_URL}/api/v1/accounts/${licenseCode}/${WEB_PUSH_PLATFORM}/${campaignId}/activate`,
    webengageHeaders,
    logger,
  });
};

const sendAppPushNotification = async ({ res, webhookContent, cdnName, sketchesHost, eventType }) => {
  // Step 1 : AUDIENCE Selection
  const campaignId = await createCampaign({
    res,
    webhookContent,
    platform: APP_PUSH_PLATFORM,
    url: `${BASE_URL}/v2/accounts/${licenseCode}/${APP_PUSH_PLATFORM}`,
    webengageHeaders,
    logger,
  });

  // Step 2: Schedule campaign  -- WHEN
  await scheduleCampaign({
    res,
    url: `${BASE_URL}/v1/accounts/${licenseCode}/${APP_PUSH_PLATFORM}/${campaignId}/targetingRule/schedule`,
    webengageHeaders,
    logger,
  });

  // Step 3: Create variation either Text / Banner -- MESSAGE
  await createVariation({
    res,
    webhookContent,
    platform: APP_PUSH_PLATFORM,
    url: `${BASE_URL}/v1/accounts/${licenseCode}/${APP_PUSH_PLATFORM}/${campaignId}/variations`,
    sketchesHost,
    eventType,
    cdnName,
    webengageHeaders,
    logger,
  });

  // Step 4: Conversion Tracking
  await createConversion({
    res,
    webhookContent,
    url: `${BASE_URL}/v1/accounts/${licenseCode}/conversions`,
    webengageHeaders,
    logger,
  });

  // Step 5: Activate / Launch
  await launchCampaign({
    res,
    url: `${BASE_URL}/v1/accounts/${licenseCode}/${APP_PUSH_PLATFORM}/${campaignId}/activate`,
    webengageHeaders,
    logger,
  });
};

export const handleWebEngageNotifications = async (req, res, next) => {
  const config = await getClient(req.hostname).getConfig();
  const sketchesHost = get(config, ["sketches-host"]);
  const cdnName = get(config, ["cdn-name"]);
  const webhookContent = get(req, ["body"], {});
  const eventType = get(webhookContent, "type");

  const targetHandlers = {
    web: sendWebPushNotification,
    mobile: sendAppPushNotification,
  };

  let targetMapping = [];
  const targets = get(webhookContent, "targets", []);

  targetMapping = targets.map((target) =>
    targetHandlers[target]({ res, webhookContent, cdnName, sketchesHost, eventType })
  );

  try {
    await Promise.all(targetMapping);
    res.status(201).send({ status: "success" });
  } catch (e) {
    logger.error("Error handling Push Notification: ", +e);
    res.status(503).send({ error: { message: "Notification failure" } });
  }
};
