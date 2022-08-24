import React from "react";
import { LazyLoadImages, ResponsiveImage, Link } from "@quintype/components";
import PropTypes from "prop-types";
import get from "lodash/get";
import { getSlug } from "../../../utils/utils";
import "./magazine-cover-image.m.css";
import { FallbackImage } from "../FallbackImage";

export const MagazineCoverImageCard = ({ collection, config = {} }) => {
  const imgAltText = get(collection, ["metadata", "magazine", "name"], "cover-image");
  const coverImageData = get(collection, ["metadata", "cover-image"]) || {};
  const { magazineSlug = "" } = config;
  const {
    "cover-image-url": coverUrl,
    "cover-image-s3-key": covers3Key,
    "cover-image-metadata": coverImageMetaData
  } = coverImageData;

  const slug = magazineSlug && collection && getSlug(collection, config);

  return (
    <div className="arr--magazine-cover-img" styleName="cover-image">
      {covers3Key || coverUrl ? (
        <figure styleName="image">
          {covers3Key ? (
            <Link href={slug} aria-label="magazine-cover-image">
              <LazyLoadImages>
                <ResponsiveImage
                  slug={covers3Key}
                  aspectRatio={[1, 2]}
                  metadata={{ coverImageMetaData }}
                  defaultWidth={400}
                  imgParams={{ auto: ["format", "compress"] }}
                  alt={imgAltText}
                />
              </LazyLoadImages>
            </Link>
          ) : (
            <img src={coverUrl} alt="cover-image" loading="lazy" />
          )}
        </figure>
      ) : (
        <div styleName="fallback-img">
          <FallbackImage slug={slug} />
        </div>
      )}
    </div>
  );
};

MagazineCoverImageCard.propTypes = {
  collection: PropTypes.shape({
    "cover-image-url": PropTypes.string,
    "cover-image-s3-key": PropTypes.string,
    "cover-image-metadata": PropTypes.string,
    slug: PropTypes.string
  }),
  config: PropTypes.shape({
    magazineSlug: PropTypes.string
  })
};
