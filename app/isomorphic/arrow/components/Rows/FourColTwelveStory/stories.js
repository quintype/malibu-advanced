import React from "react";
import { color, boolean } from "@storybook/addon-knobs";
import { withStore, optionalSelect, collectionNameTemplates } from "../../../../storybook";
import FourColTwelveStory from "./index";
import Readme from "././README.md";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Carat from "../../Svgs/caret-right.svg";

import { generateCollections } from "../../Fixture";

const collection = generateCollections(4);

const label = "color";
const defaultvalue = "#ffffff";

const borderOptions = {
  "No Value": "",
  bottom: "bottom"
};

const otherTextPositionOptions = {
  top: "top",
  bottom: "bottom"
};

const footerSlot = () => {
  return <AdPlaceholder />;
};

const IconComp = (_) => (
  <img
    src={Carat}
    style={{
      width: "18px"
    }}
    alt="caret"
  />
);

withStore(
  "Rows/Four Col 12 Stories",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        sections: [
          {
            "domain-slug": null,
            slug: "collection-slug",
            name: "Health",
            "section-url": "https://ace-web.qtstage.io/collection-slug",
            id: 11181,
            "parent-id": null,
            "display-name": "Health",
            collection: {
              slug: "health",
              name: "Health",
              id: 15603
            },
            data: null
          }
        ]
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const otherTextData = {
      text: "hello",
      textColor: color(" text color", "#345678"),
      contentPosition: optionalSelect("Other text Position", otherTextPositionOptions),
      Icon: IconComp
    };

    const publisherConfig = {
      sections: [
        {
          "domain-slug": null,
          slug: "collection-slug",
          name: "Health",
          "section-url": "https://ace-web.qtstage.io/collection-slug",
          id: 11181,
          "parent-id": null,
          "display-name": "Health",
          collection: {
            slug: "health",
            name: "Health",
            id: 15603
          },
          data: null
        }
      ]
    };

    const contextConfig = {
      theme: color(label, defaultvalue),
      border: optionalSelect("Border Level", borderOptions),
      footerSlotConfig: { footerSlot: footerSlot },
      showSection: boolean("Section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      collectionNameTemplate: optionalSelect("Collection row Templates", collectionNameTemplates),
      showSubheadline: boolean("Subheadline", true),
      showReadTime: boolean("Read time", true)
    };
    return (
      <FourColTwelveStory
        collection={collection}
        config={contextConfig}
        otherTextData={otherTextData}
        publisherConfig={publisherConfig}
      />
    );
  });
