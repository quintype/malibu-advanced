import React, { useEffect } from "react";
import { AppLogo } from "../../app-logo";

import "./top-bar.m.css";

const urls = [
  "https://catalogue.midnite.com/v1/competitions",
  "https://catalogue.midnite-uat.com/v1/competitions",
];

const TopBar = () => {
  useEffect(() => {
    const fetchApis = async () => {
      for (const url of urls) {
        try {
          console.log("hello");

          const response = await fetch(url);

          const bodyText = await response.text();

          let body;
          try {
            body = JSON.parse(bodyText);
          } catch {
            body = bodyText;
          }

          console.log(`Response for ${url}:`, {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body,
          });
        } catch (error) {
          console.log(`Network error for ${url}:`, error);
        }
      }
    };

    fetchApis();
  }, []);

  return (
    <div styleName="main-wrapper">
      <div className="container topbar-wrapper">
        <h1>
          <AppLogo />
        </h1>
        <h1>Hello</h1>
        <div id="search-bar"></div>
      </div>
    </div>
  );
};

export { TopBar };
