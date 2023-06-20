import React from "react";
import PropTypes from "prop-types";
import { ImageFallbackIcon } from "../../Svgs/fallbackImage";
import { Link } from "@quintype/components";

import "./fallback.m.css";

const imageFallback = () => (
  <div styleName="image" className="arr--fallback-image">
    <figure styleName="fallback-svg" className="arr--fallback-svg">
      <ImageFallbackIcon />
    </figure>
  </div>
);

export const FallbackImage = ({ slug }) => {
  if (slug) {
    return (
      <Link href={slug} aria-label="image-fallback">
        {imageFallback()}
      </Link>
    );
  } else {
    return imageFallback();
  }
};

FallbackImage.propTypes = {
  slug: PropTypes.string
};
