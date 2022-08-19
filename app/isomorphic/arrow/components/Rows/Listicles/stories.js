/* eslint-disable prefer-regex-literals */
import React from "react";
import { color, boolean } from "@storybook/addon-knobs";
import { withStore, optionalSelect, collectionNameTemplates } from "../../../../storybook";
import Listicles from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Readme from "./README.md";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { generateCollections, generateCollection } from "../../Fixture";

const mock = new MockAdapter(axios);

const API_REQUEST = new RegExp(`/api/v1/collections/*`);

const nestedCollection = generateCollection({ stories: 10 });

const collection = generateCollections(5);

const defaultvalue = "#ffffff";
const collectionNameDefaultValue = "#3a9fdd";

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Listicles",
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
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", collectionNameDefaultValue),
      theme: color("color", defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      slotConfig: configurableSlot,
      showRowTitle: boolean("Row title", true)
    };

    mock.onGet(API_REQUEST).reply(200, nestedCollection);

    return <Listicles collection={collection} config={contextConfig} />;
  })
  .add("with localized numbers", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", collectionNameDefaultValue),
      theme: color("color", defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      slotConfig: configurableSlot,
      showRowTitle: boolean("Row title", true),
      localizedNumbers: ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    };

    mock.onGet(API_REQUEST).reply(200, nestedCollection);

    return <Listicles collection={collection} config={contextConfig} />;
  });
