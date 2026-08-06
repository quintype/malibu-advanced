import React from "react";
import { AppLogo } from "../../app-logo";

import "./top-bar.m.css";

import axios from "axios";

const urls = [
  "https://catalogue.midnite.com/v1/competitions",
  "https://catalogue.midnite-uat.com/v1/competitions",
];

const TopBar = () => {
  (async () => {
    for (const url of urls) {
      try {
        const response = await axios.get(url);

        console.log("boop1 URL:", url);
        console.log("boop1 Status:", response.status);
        console.log("boop1 Body:", response.data);
      } catch (err) {
        console.error("boop1 Error:", url);

        if (err.response) {
          console.log("boop1 Status:", err.response.status);
          console.log("boop1 Body:", err.response.data);
        } else {
          console.error(err.message);
        }
      }
    }
  })();

  return (
    <div styleName="main-wrapper">
      <div className="container topbar-wrapper">
        <h1>
          <AppLogo />
        </h1>
        <h1>Hello12311</h1>
        <div id="search-bar" />
      </div>
    </div>
  );
};

export { TopBar };
