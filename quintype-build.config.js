const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const customConfig = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer"
    }
  },
  entryFiles: {
    arrowHomePageStyles: "./app/assets/stylesheets/arrow/arrow-home-page.scss"
  }
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...customConfig };

module.exports = modifiedBuildConfig;
