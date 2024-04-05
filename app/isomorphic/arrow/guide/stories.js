import React from "react";
import { addReadme } from "storybook-readme";
import readme from "../../README.md";
import { storiesOf } from "@storybook/react";

storiesOf("Introduction", module)
  .addDecorator(addReadme)
  .addDecorator((story) => <div style={{ maxWidth: "900px", margin: "auto" }}>{story()}</div>)
  .addParameters({
    options: {
      showPanel: false,
    },
    readme: {
      content: readme,
      codeTheme: "a11y-dark",
    },
  })
  .add("Getting Started", () => <div />);
