/* eslint-disable prefer-regex-literals */
import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import AlternateCollectionFilter from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Readme from "./README.md";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { generateCollections, generateCollection } from "../../Fixture";

const mock = new MockAdapter(axios);

const API_REQUEST = new RegExp(`/api/v1/collections/*`);

const nestedCollection = generateCollection({ stories: 10 });

const collection = generateCollections(15); // will have to reduce this number post testing

const defaultvalue = "#ffffff";
const collectionNameDefaultValue = "#3a9fdd";
const sectionTagDefaultvalue = "#3a9fdd";

const borderTemplate = {
  default: "",
  border: "full",
};

const footerSlot = () => {
  return <AdPlaceholder />;
};

withStore(
  "Rows/Alternate Collection Filter",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", collectionNameDefaultValue),
      borderColor: color("Section Tag Border Color", sectionTagDefaultvalue),
      theme: color("color", defaultvalue),
      border: optionalSelect("Border", borderTemplate),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };

    mock.onGet(API_REQUEST).reply(200, nestedCollection);

    return <AlternateCollectionFilter collection={collection} config={contextConfig} />;
  });
