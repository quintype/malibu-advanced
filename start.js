const { startApp } = require("@quintype/framework/server/start");
const elasticApm = require("elastic-apm-node");

process.env.NODE_ENV === "production" &&
  process.env.TOGGLE_APM &&
  elasticApm.start({
    serviceName: process.env.APM_SERVICE_NAME,
    secretToken: process.env.APM_SECRET_TOKEN,
    serverUrl: process.env.APM_SERVER_URL,
    environment: process.env.APM_ENVIRONMENT
  });

startApp(() => require("./app/server/app.js").app);
