import React from "react";
import { withStore } from "../../../storybook";
import { Typography } from "./index";
import Readme from "./README.md";

withStore("Introduction", {}, Readme)
  .addDecorator((story) => <div style={{ maxWidth: "900px", margin: "auto", padding: "10px" }}>{story()}</div>)
  .add("Typography", () => {
    return <Typography />;
  });
