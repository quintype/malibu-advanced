/* eslint-disable no-console, no-unused-vars, import/extensions, object-shorthand, global-require */
import createApp from "@quintype/framework/server/create-app";
import logger from "@quintype/framework/server/logger";
import {
  upstreamQuintypeRoutes,
  isomorphicRoutes,
  staticRoutes,
  getWithConfig
} from "@quintype/framework/server/routes";
import { generateRoutes, STATIC_ROUTES } from "./routes";
import { renderLayout } from "./handlers/render-layout";
import { loadData, loadErrorData } from "./load-data";
import { pickComponent } from "../isomorphic/pick-component";
import { SEO } from "@quintype/seo";
import { Collection } from "@quintype/framework/server/api-client";
import { get } from "lodash";
import axios from "axios";

// import wretch from "wretch";

export const app = createApp();

const logError = error => logger.error(error);

const signupHandler = async (req, res) => {
  console.log("fooooooo inside signupHandler11111", req.query.code);
  const code = req.query.code;

  const getAccessToken = async (authCode, brkeConfig) => {
    const {
      bridgekeeperIntegrationId,
      bridgekeeperIntegrationSecret,
      bridgekeeperHost,
      bridgekeeperApiKey
    } = brkeConfig;

    if (!bridgekeeperIntegrationId || !bridgekeeperIntegrationSecret || !bridgekeeperHost) {
      return Promise.reject(new Error("Unable to get accessToken: invalid bridgekeeper config"));
    }

    const tokenUrl = `${bridgekeeperHost}/api/auth/v1/oauth/token`;

    const form = new URLSearchParams();
    form.append("client_id", bridgekeeperIntegrationId);
    form.append("client_secret", bridgekeeperIntegrationSecret);
    form.append("grant_type", "authorization_code");
    form.append("code", authCode);

    try {
      const requestTokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "X-BK-AUTH": bridgekeeperApiKey },
        body: JSON.stringify(form)
      });
      const accessToken = get(requestTokenResponse, ["data", "access_token"]);
      console.log("foooooo accesstoken newwwwwww", accessToken);
      return accessToken;
    } catch (err) {
      return await Promise.reject(err);
    }
  };

  if (!code) {
    return res.status(400).send({ error: "no auth code provided" });
  }

  const bridgekeeperIntegrationId = 51;
  const bridgekeeperIntegrationSecret = "kcRFrsf89as8fHkfhHihbg3LMHjii8";
  const bridgekeeperHost = "http://bridgekeeper.alb.staging.quinpress.internal";
  const bridgekeeperApiKey = "mxdnwJFPrZUQDPuV";

  const brkeConfig = { bridgekeeperIntegrationId, bridgekeeperIntegrationSecret, bridgekeeperHost, bridgekeeperApiKey };

  try {
    const accessToken = await getAccessToken(code, brkeConfig);
    const cookieConf = { httpOnly: true };
    if (process.env.NODE_ENV !== "development") {
      cookieConf.secure = true;
    }
    res.cookie("qt-auth", accessToken, cookieConf);
    return res.send(accessToken);
  } catch (err) {
    console.log(err);
    return res.send({ error: "User authentication failed" });
  }
};

app.post("/user/update", signupHandler);

upstreamQuintypeRoutes(app, { forwardAmp: true });

const STATIC_TAGS = {
  "twitter:site": "Quintype",
  "twitter:app:name:ipad": undefined,
  "twitter:app:name:googleplay": undefined,
  "twitter:app:id:googleplay": undefined,
  "twitter:app:name:iphone": undefined,
  "twitter:app:id:iphone": undefined,
  "apple-itunes-app": undefined,
  "google-play-app": undefined,
  "fb:app_id": undefined,
  "fb:pages": undefined,
  "og:site_name": "Quintype"
};

const STRUCTURED_DATA = {
  organization: {
    name: "Quintype",
    url: "http://www.quintype.com/",
    logo: "https://quintype.com/logo.png",
    sameAs: [
      "https://www.facebook.com/quintype",
      "https://twitter.com/quintype_in",
      "https://plus.google.com/+quintype",
      "https://www.youtube.com/user/Quintype"
    ]
  },
  enableLiveBlog: true,
  enableVideo: true,
  enableNewsArticle: true
};

const redirectCollectionHandler = () => async (req, res, next, { client, config }) => {
  const response = await Collection.getCollectionBySlug(client, req.params.collectionSlug, { limit: 20 }, { depth: 2 });
  if (!response) {
    return next();
  }
  const collection = response && response.collection;
  if (collection.template === "section") {
    const sectionId = collection.metadata.section[0].id;
    const section = config.sections.find(section => section.id === sectionId) || {};
    return res.redirect(301, `${section["section-url"]}`);
  }

  if (collection.template === "author") {
    return res.redirect(301, `/author/${req.params.collectionSlug}`);
  }
  return next();
};

getWithConfig(app, "/collection/:collectionSlug", redirectCollectionHandler(), {
  logError
});

isomorphicRoutes(app, {
  appVersion: require("../isomorphic/app-version"),
  logError: error => logger.error(error),
  generateRoutes: generateRoutes,
  loadData: loadData,
  pickComponent: pickComponent,
  renderLayout: renderLayout,
  templateOptions: true,
  loadErrorData: loadErrorData,
  staticRoutes: STATIC_ROUTES,
  seo: new SEO({
    staticTags: STATIC_TAGS,
    enableTwitterCards: true,
    enableOgTags: true,
    enableNews: true,
    structuredData: STRUCTURED_DATA
  }),
  preloadJs: true,
  oneSignalServiceWorkers: true,
  prerenderServiceUrl: "https://prerender.quintype.io"
});
