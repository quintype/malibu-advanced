import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect, collectionNameTemplates, footerButton } from "../../../../storybook";
import AstrologyCollection from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Readme from "./README.md";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { generateCollections, generateCollection } from "../../Fixture";

const mock = new MockAdapter(axios);

const API_REQUEST = new RegExp(`/api/v1/collections/*`);

const nestedCollection = generateCollection({ stories: 12 });

const collection = generateCollections(3);

const defaultvalue = "#ffffff";
const collectionNameDefaultValue = "#3a9fdd";

const CustomAdOrWidget = () => {
  return <AdPlaceholder width="300px" height="250px" />;
};

withStore(
  "Rows/Astrology Collection",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1172px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", collectionNameDefaultValue),
      theme: color("color", defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showButton: boolean("Show button", true),
      slotConfig: [
        {
          type: "ad",
          component: () => <CustomAdOrWidget />
        }
      ]
    };

    mock.onGet(API_REQUEST).reply(200, nestedCollection);

    return <AstrologyCollection collection={collection} config={contextConfig} />;
  });
