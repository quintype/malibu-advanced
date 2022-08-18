import React from "react";
import { withStore } from "../../../../storybook";
import AuthorImage from "./index";
import Readme from "./README.md";
import { authorData } from "../../Fixture";

withStore(
  "Atoms/AuthorImage",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .add("Default", () => <AuthorImage author={authorData} />)
  .add("Square Image", () => <AuthorImage author={authorData} template="square" />)
  .add("Small Circle Image", () => <AuthorImage author={authorData} template="smallCircle" />);
