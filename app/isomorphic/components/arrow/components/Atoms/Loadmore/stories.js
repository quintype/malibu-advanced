import React from "react";
import { withStore, optionalSelect } from "../../../../storybook";
import { LoadmoreButton } from "./index";
import Readme from "./README.md";
import { generateCollection } from "../../Fixture";

const collection = generateCollection();

const buttonOptions = {
  NavigateToPage: "NavigateToPage",
  SubsequentLoadCount: "SubsequentLoadCount",
  CustomUrlPath: "CustomUrlPath",
};

withStore("Atoms/Button", {}, Readme).add("Buttons Options", () => (
  <LoadmoreButton collection={collection} template={optionalSelect("Button Options", buttonOptions)} />
));
