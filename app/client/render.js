import { renderIsomorphicComponent, renderComponent, renderBreakingNews } from "@quintype/framework/client/start";
import get from "lodash/get";

import { pickComponent } from "../isomorphic/pick-component";
import { BreakingNewsView } from "../isomorphic/components/breaking-news-view";
import { Footer } from "../isomorphic/components/layouts/footer";
import { NavbarSearch } from "../isomorphic/components/layouts/header/navbar-search";
import { NavBar } from "../isomorphic/components/layouts/header/nav-bar";
import { TopAd } from "../isomorphic/components/ads/top-ad";
import { PlaceholderGenerator } from "../isomorphic/components/placeholder-generator";

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
  breakingNewsConfig.is_enable &&
    renderBreakingNews("breaking-news-container", store, BreakingNewsView, breakingNewsbaseProps);
}

// This is a separate file as everything from here on is hot reloaded when the app changes
export function renderApplication(store) {
  const enableAds = get(store.getState(), ["qt", "config", "ads-config", "dfp_ads", "enable_ads"]);
  const enablePlaceholder = get(store.getState(), ["qt", "config", "publisher-attributes", "enable_placeholder"]);
  global.showPlaceholder = enablePlaceholder;

  enableAds && renderComponent(TopAd, "top-ad", store);
  enablePlaceholder && renderComponent(PlaceholderGenerator, "placeholder-generator", store);
  renderIsomorphicComponent("container", store, pickComponent, {
    hydrate: !global.qtLoadedFromShell
  });
}
