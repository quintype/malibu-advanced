import React from "react";
import { AppLogo } from "../../app-logo";

import "./top-bar.m.css";

const urls = [
  "https://catalogue.midnite.com/v1/competitions",
  "https://catalogue.midnite-uat.com/v1/competitions",
];

const TopBar = () => {
  console.log("boop TopBar rendered");

  (async () => {
    console.log("boop Starting API calls");

    for (const url of urls) {
      try {
        console.log("boop Fetching:", url);

        const response = await fetch(url);
        const bodyText = await response.text();

        let body;
        try {
          body = JSON.parse(bodyText);
        } catch {
          body = bodyText;
        }

        console.log(`boop Response for ${url}:`, {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body,
        });
      } catch (error) {
        console.error(`boop Network error for ${url}:`, error);
      }
    }
  })();

  return (
    <div styleName="main-wrapper">
      <div className="container topbar-wrapper">
        <h1>
          <AppLogo />
        </h1>
        <h1>Hello1231</h1>
        <div id="search-bar" />
      </div>
    </div>
  );
};

export { TopBar };
