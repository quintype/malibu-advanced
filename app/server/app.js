/* eslint-disable no-console, no-unused-vars, import/extensions, object-shorthand, global-require */
import createApp from "@quintype/framework/server/create-app";
import { getClient, Collection } from "@quintype/framework/server/api-client";
import logger from "@quintype/framework/server/logger";
import {
  upstreamQuintypeRoutes,
  isomorphicRoutes,
  staticRoutes,
  ampRoutes,
  getWithConfig,
} from "@quintype/framework/server/routes";
import { generateRoutes, STATIC_ROUTES } from "./routes";
import { renderLayout } from "./handlers/render-layout";
import { loadData, loadErrorData } from "./load-data";
import { pickComponent } from "../isomorphic/pick-component";
import { generateStaticData, generateStructuredData, SEO } from "@quintype/seo";
import axios from "axios";
export const app = createApp();

upstreamQuintypeRoutes(app, {});

const redirectCollectionHandler =
  () =>
   async (req, res, next, { client, config }) => {
    const response = await Collection.getCollectionBySlug(
      client,
      req.params.collectionSlug,
      { limit: 20 },
      { depth: 2 }
    );
    if (!response) {
      return next();
    }
    const collection = response && response.collection;
    if (collection.template === "section") {
      const sectionId = collection.metadata.section[0].id;
      const section = config.sections.find((section) => section.id === sectionId) || {};
      return res.redirect(301, `${section["section-url"]}`);
    }

    if (collection.template === "author") {
      return res.redirect(301, `/author/${req.params.collectionSlug}`);
      }
    return next();
  };

const logError = (error) => logger.error(error);

getWithConfig(app, "/collection/:collectionSlug", redirectCollectionHandler(), {
  logError,
});

function returnConfig(req) {
  return getClient(req.hostname)
    .getConfig()
    .then((res) => res.config || []);
}

const getCustomStoryList = async ({ offset = 0, limit = 10, type }) => {
  const customList = await axios.get(
        `https://1711-49-206-132-134.in.ngrok.io/customApi?offset=${offset}&limit=${limit}`
      );
  if(type === 'remoteConfig'){
    return JSON.stringify({ pages: customList.data });
  }
  return JSON.stringify(customList.data);
};

app.get("/amp/api/infinite-scroll", async (req, res, next) => {
  const response = await getCustomStoryList({ offset: 5, limit: 10, type: 'remoteConfig' });
  if (!response) {
    return next();
  }
  res.send(response);
});
app.get("*", (req, res, next) => {
  if (req.hostname.includes("auth")) {
    const whitelistedUrls = ["user-login", "route-data.json", "manifest.json"];
    const isPathPresent = (element) => req.params[0].includes(element);
    if (whitelistedUrls.some(isPathPresent)) {
      return next();
    } else {
      returnConfig(req).then((response) => {
        const sketchesHost = response["sketches-host"];
        res.redirect(301, sketchesHost);
      });
    }
  } else {
    return next();
  }
});

function generateSeo(config, pageType) {
  return new SEO({
    staticTags: Object.assign(generateStaticData(config)),
    structuredData: Object.assign(generateStructuredData(config), {
      enableLiveBlog: true,
      enableVideo: true,
      enableNewsArticle: true,
    }),
    enableTwitterCards: true,
    enableOgTags: true,
    enableNews: true,
  });
}
 /**
    * if source is empty (or infiniteScroll not passed ), then infinteScroll is powered by amp-infinite-scroll collection
    * if source is relatedStoriesApi, then infinteScroll is powered by relatedStoriesApi &
    * if source is custom , then we need to provide an async function for inlineConfig and Remote endpoint & handler
 */
ampRoutes(app, {
  seo: generateSeo,
  featureConfig: {
    infiniteScroll: {
      // source : "relatedStoriesApi",
      source: "custom",
      inlineConfig: getCustomStoryList,
      remoteConfigEndpoint: "/amp/api/infinite-scroll",
    },
  },
});

isomorphicRoutes(app, {
  appVersion: require("../isomorphic/app-version"),
  logError: (error) => logger.error(error),
  generateRoutes: generateRoutes,
  loadData: loadData,
  pickComponent: pickComponent,
  renderLayout: renderLayout,
  templateOptions: true,
  loadErrorData: loadErrorData,
  staticRoutes: STATIC_ROUTES,
  seo: generateSeo,
  preloadJs: true,
  oneSignalServiceWorkers: true,
  prerenderServiceUrl: "https://prerender.quintype.io",
});
