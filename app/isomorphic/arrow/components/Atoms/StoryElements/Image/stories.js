import React from "react";
import { withStore } from "../../../../../storybook";
import { Image } from "./index";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";

const element = generateStoryElementData("image");

withStore(
  "Atoms/Story Elements/Image",
  {
    qt: {
      config: {
        "cdn-image": "gumlet.assettype.com",
      },
    },
  },
  Readme
)
  .add("Default", () => <Image element={element} />)
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <p>{element.title}</p>;
    return <Image element={element} render={customTemplate} />;
  });
