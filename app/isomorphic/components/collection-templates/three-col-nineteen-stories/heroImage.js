import React from "react";
import { array, object, string, number } from "prop-types";
import { ResponsiveHeroImage } from "@quintype/components";
import "./three-col-nineteen-stories.m.css";

export const HeroImage = ({ story, headline, aspectRatio, widths, defaultWidth, styles }) => {
  return (
    <figure styleName={styles}>
      <ResponsiveHeroImage
        story={story}
        aspectRatio={aspectRatio}
        defaultWidth={defaultWidth}
        widths={widths}
        imgParams={{ auto: ["format", "compress"], fit: "max" }}
        alt={headline}
      />
    </figure>
  );
};

HeroImage.propTypes = {
  story: object.isRequired,
  headline: string,
  aspectRatio: array,
  widths: array,
  defaultWidth: number,
  styles: string,
};

HeroImage.defaultProps = {
  aspectRatio: [4, 3],
  widths: [250, 480, 640],
  defaultWidth: 480,
};
