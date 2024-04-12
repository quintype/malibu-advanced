import React from "react";
import { array, object, string, number } from "prop-types";
import { ResponsiveHeroImage } from "@quintype/components";

export const HeroImage = ({ story, headline, aspectRatio, widths, defaultWidth }) => {
  return (
    <figure>
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
};

HeroImage.defaultProps = {
  aspectRatio: [4, 3],
  widths: [250, 480, 640],
  defaultWidth: 480,
};
