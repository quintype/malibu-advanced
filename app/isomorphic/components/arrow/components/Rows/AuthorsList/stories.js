import React from "react";
import { withStore } from "../../../../storybook";
import AuthorsList from "./index";
import { color, boolean, text } from "@storybook/addon-knobs";
import { authorData } from "../../Fixture";
import Readme from "./README.md";

const AuthorsData = Array(8).fill(authorData);
AuthorsData.push({
  slug: "parvathi-mohan-2",
  name: "Lucy Douglas",
  social: {
    twitter: {
      url: "https://twitter.com/Reena00659364",
      handle: "Twitter"
    },
    youtube: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Youtube"
    },
    facebook: {
      url: "https://www.facebook.com/people/Reena-Singh/100005438855189",
      handle: "Facebook"
    }
  },
  bio: "",
  id: 94985,
  "avatar-url": "",
  "avatar-s3-key": "",
  "twitter-handle": "quintype_inc",
  stats: {
    contributions: null
  },
  metadata: {}
});

const getMoreData = () => {
  console.log("load more data");
};

withStore(
  "Rows/Author List",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("Default", () => {
  const config = {
    enableBio: boolean("Enable Bio", true),
    buttonText: text("Footer text", "Load More"),
    theme: color("color", "#ffffff"),
    enableSocialLinks: boolean("Enable Social Links", true),
    borderSupport: boolean("With Border", true)
  };
  return <AuthorsList data={AuthorsData} config={config} getMoreData={getMoreData} hideLoadmore={false} limit={9} />;
});
