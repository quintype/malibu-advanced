import React from "react";
import { withStore } from "../../../../storybook";
import { MagazineCoverImageCard } from "./index";
import Readme from "./README.md";
import { generateCollection } from "../../Fixture";
import { config } from "@storybook/addon-actions";

const collection = generateCollection({ stories: 4 });

withStore(
  "Atoms/Magazine CoverImage",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("MagazineCoverImage", () => <MagazineCoverImageCard collection={collection} config={config} />);
