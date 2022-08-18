import React from "react";
import { withStore } from "../../../../storybook";
import { BulletPoint } from "./index";
import Readme from "./README.md";

withStore("Atoms/Bullet Point", {}, Readme).add("Default", () => <BulletPoint bulletValue={"1"} />);
