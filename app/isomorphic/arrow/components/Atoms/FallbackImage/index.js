import React from "react";
import PropTypes from "prop-types";
import { ImageFallbackIcon } from "../../Svgs/fallbackImage";
import { Link } from "@quintype/components";

import "./fallback.m.css";

const imageFallback = (roundedCorners) => {
  const imageClassName = roundedCorners ? `arr--fallback-image ${roundedCorners}` : "arr--fallback-image";
  return (
    <div styleName="image" className={imageClassName}>
      <figure styleName="fallback-svg" className="arr--fallback-svg">
        <ImageFallbackIcon />
      </figure>
    </div>
  );
};

export const FallbackImage = ({ slug, roundedCorners = "" }) => {
  if (slug) {
    return (
      <Link href={slug} aria-label="image-fallback">
        {imageFallback(roundedCorners)}
      </Link>
    );
  } else {
    return imageFallback(roundedCorners);
  }
};

FallbackImage.propTypes = {
  slug: PropTypes.string,
  roundedCorners: PropTypes.string,
};
