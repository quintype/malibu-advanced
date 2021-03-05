import React from "react";
import { Link } from "@quintype/components";

import "./app-logo.m.css";

const AppLogo = () => (
  <h1>
    <Link href="/">
      <img
        height="66"
        width="178"
        loading="lazy"
        styleName="publisher-logo"
        srcSet="https://qtstage-01.gumlet.io/malibu/2021-03/554af9ae-cbfd-4cf7-9aed-759fc96217f1/Malibu_ullLogo.svg?auto=format%2Ccompress&format=webp&w=66&dpr=2.0"
        src="https://qtstage-01.gumlet.io/malibu/2021-03/554af9ae-cbfd-4cf7-9aed-759fc96217f1/Malibu_ullLogo.svg?auto=format%2Ccompress&format=webp&w=66&dpr=2.0"
        alt="Logo"
      />
    </Link>
  </h1>
);

export { AppLogo };
