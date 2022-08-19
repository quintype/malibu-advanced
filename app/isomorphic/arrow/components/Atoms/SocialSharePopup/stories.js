import React from "react";
import { withStore } from "../../../../storybook";
import { SocialSharePopup } from "./index";
import Readme from "./README.md";

const props = {
  fbUrl: "https://www.facebook.com",
  fullUrl:
    "https://ace-web.qtstage.io/anything/recent-stories/newsready-player-one-review-spielberg-spins-a-dizzying-vr-yarn",
  iconType: "plain-svg",
  linkedinUrl: "https://www.linkedin.com",
  mailtoUrl:
    "mailto:?subject=Ready%20Player%20One%20review%20%E2%80%93%20Spielberg%C2%A0&body=https%3A%2F%2Face-web.qtstage.io%2Fanything%2Frecent-stories%2Fnews%2Fready-player-one-review-spielberg-spins-a-dizzying-vr-yarn",
  publisherUrl: undefined,
  theme: "#ffffff",
  title: "Ready Player One review – Spielberg ",
  twitterUrl: "https://twitter.com"
};
withStore("Atoms/Social Share Popup", {}, Readme).add("default", () => <SocialSharePopup {...props} />);
