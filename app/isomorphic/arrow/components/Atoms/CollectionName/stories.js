import React from "react";

import { CollectionName } from "./index.js";
import { withStore, optionalSelect } from "../../../../storybook";

import { generateCollection } from "../../Fixture";
import { color } from "@storybook/addon-knobs";

import Readme from "./README.md";
const collection = generateCollection();

const collectionTemplates = {
  default: "default",
  borderBottom: "borderBottom",
  borderLeft: "borderLeft",
  crossLine: "crossLine",
  borderBottomFull: "borderBottomFull",
};

withStore(
  "Atoms/collection Title",
  {
    qt: {
      config: {
        sections: [
          {
            "domain-slug": null,
            slug: "health",
            name: "Health",
            "section-url": "https://ace-web.qtstage.io/health",
            id: 11181,
            "parent-id": null,
            "display-name": "Health",
            collection: {
              slug: "health",
              name: "Health",
              id: 15603,
            },
            data: null,
          },
        ],
      },
    },
  },
  Readme
).add("default", () => (
  <CollectionName
    collection={collection}
    collectionNameTemplate={optionalSelect("templates", collectionTemplates)}
    collectionNameBorderColor={color("color for border", "#333")}
  />
));
