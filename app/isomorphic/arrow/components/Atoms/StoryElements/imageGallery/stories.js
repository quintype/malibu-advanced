import React from "react";
import { withStore, optionalSelect } from "../../../../../storybook";
import { ImageGallery } from "./index";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";

const element = generateStoryElementData("image-gallery");
const imgaeGalleryTemplate = {
  default: "",
  template2: "template-2"
};

withStore(
  "Atoms/Story Elements/Image gallery",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
).add("Default", () => <ImageGallery element={element} template={optionalSelect("templates", imgaeGalleryTemplate)} />);
