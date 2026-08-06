import React from "react";
import { AppLogo } from "../../app-logo";

import "./top-bar.m.css";

import axios from "axios";

const urls = [
  "https://catalogue.midnite.com/v1/matches?competition_id=54291382",
  "https://catalogue.midnite.com/v1/matches/57965075",
];

const TopBar = () => {
  (async () => {
    for (const url of urls) {
      try {
        const response = await axios.get(url);

        console.log("boop2 URL:", url);
        console.log("boop2 Status:", response.status);
        console.log("boop2 Body:", response.data);
      } catch (err) {
        console.error("boop2 Error:", url);

        if (err.response) {
          console.log("boop2 Status:", err.response.status);
          console.log("boop2 Body:", err.response.data);
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
