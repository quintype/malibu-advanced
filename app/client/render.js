import { renderIsomorphicComponent, renderComponent, renderBreakingNews } from "@quintype/framework/client/start";
import get from "lodash/get";

import { pickComponent } from "../isomorphic/pick-component";
import { BreakingNewsView } from "../isomorphic/components/breaking-news-view";
import { Footer } from "../isomorphic/components/layouts/footer";
import { NavbarSearch } from "../isomorphic/components/layouts/header/navbar-search";
import { NavBar } from "../isomorphic/components/layouts/header/nav-bar";
import { TopAd } from "../isomorphic/components/ads/top-ad";
import { gumletScriptGenerator } from "../isomorphic/components/gumlet-script-generator";
import { gtmScriptGenerator } from "../isomorphic/components/gtm-script-generator";
import { gaScriptGenerator } from "../isomorphic/components/ga-script-generator";

export function preRenderApplication(store) {
  const hydrate = { hydrate: !global.qtLoadedFromShell };
  const breakingNewsConfig = get(store.getState(), ["qt", "config", "publisher-attributes", "breaking_news"], {});
  const breakingNewsInterval =
    breakingNewsConfig.interval && breakingNewsConfig.interval <= 60 ? 60 : breakingNewsConfig.interval;
  const breakingNewsbaseProps = {
    hydrate,
    updateInterval: breakingNewsInterval * 1000
  };

  global.qtLoadedFromShell && renderComponent(Footer, "footer", store, hydrate);
  renderComponent(NavbarSearch, "search-bar", store, hydrate);
  renderComponent(NavBar, "nav-bar", store, hydrate);

  const pageType = get(store.getState(), ["qt", "pageType"], null);
  breakingNewsConfig.is_enable &&
    pageType !== "profile-page" &&
    renderBreakingNews("breaking-news-container", store, BreakingNewsView, breakingNewsbaseProps);
}

// This is a separate file as everything from here on is hot reloaded when the app changes
export function renderApplication(store) {
  const enableAds = get(store.getState(), ["qt", "config", "ads-config", "dfp_ads", "enable_ads"]);
  const pageType = get(store.getState(), ["qt", "pageType"], null);
  const placeholderDelay = parseInt(
    get(store.getState(), ["qt", "config", "publisher-attributes", "placeholder_delay"])
  );
  const gtmScriptDelay = parseInt(
    get(store.getState(), ["qt", "config", "publisher-attributes", "google_tag_manager", "script_delay"])
  );
  const gaScriptDelay = parseInt(
    get(store.getState(), ["qt", "config", "publisher-attributes", "google_analytics", "script_delay"])
  );

  enableAds && pageType !== "profile-page" && renderComponent(TopAd, "top-ad", store);
  placeholderDelay && renderComponent(gumletScriptGenerator, "gumlet-script-generator", store);
  gtmScriptDelay && renderComponent(gtmScriptGenerator, "gtm-script-generator", store);
  gaScriptDelay && renderComponent(gaScriptGenerator, "ga-script-generator", store);
  renderIsomorphicComponent("container", store, pickComponent, {
    hydrate: !global.qtLoadedFromShell
  });
}
