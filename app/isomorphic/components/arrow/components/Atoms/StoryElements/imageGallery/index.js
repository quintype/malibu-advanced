import React from "react";
import PropTypes from "prop-types";
import { ResponsiveImage } from "@quintype/components";
import { withElementWrapper } from "../withElementWrapper";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";

import { shapeStory, shapeConfig, clientWidth } from "../../../../utils/utils";

import "./image-gallery.m.css";
import { HyperLink } from "../../Hyperlink";

const ImageGalleryBase = ({ element, template = "", opts = {}, story = {}, config = {}, ...restProps }) => {
  if (!element) return null;
  const isMobile = clientWidth("mobile");
  const imageArr = element["story-elements"];
  const imageBaseOnTemp = template === "template-2" && imageArr.length;
  const renderImageDesktop = imageBaseOnTemp > 6 ? imageArr.slice(0, 6) : imageArr;
  const renderMobile = imageBaseOnTemp > 4 ? imageArr.slice(0, 4) : imageArr;
  const renderImage = isMobile ? renderMobile : renderImageDesktop;
  const classes = template === "template-2" ? "template-2" : "";
  const hyperlinkClass = (hyperlink) => (hyperlink ? "hyperlink-gallery-image" : "");

/* eslint-disable eslint/no-unused-vars */
  const LeftImages = () => {
    const imageCountDesktop = imageBaseOnTemp > 6 && imageArr.length - 6;
    const imageCountMobile = imageBaseOnTemp > 4 && imageArr.length - 4;
    const imageCount = isMobile ? imageCountMobile : imageCountDesktop;
    return <div styleName="left-images">{imageCount}</div>;
  };

  const ImageGalleryImagesTemplate = ({ onClickHandler }) => {
    const images = renderImage.map((image, index) => (
      <div key={index} styleName={hyperlinkClass(image.hyperlink)}>
        <figure
          key={index}
          data-text-id={`image-${index}`}
          styleName={`image ${classes}`}
          onClick={() => onClickHandler && onClickHandler(index)}>
          <ResponsiveImage
            slug={image["image-s3-key"]}
            metadata={image["image-metadata"]}
            alt={image.title}
            aspectRatio={[1, 1]}
            defaultWidth={640}
            imgParams={{ auto: ["format", "compress"] }}
          />
        </figure>
        {image.hyperlink && <HyperLink hyperLink={image.hyperlink} />}
      </div>
    ));

    return (
      <div
        styleName="image-gallery"
        className=" arrow-component arr--image-element"
        {...restProps}
        data-test-id="image-gallery"
      >
        {images}
      </div>
    );
  };

  ImageGalleryImagesTemplate.propTypes = {
    onClickHandler: PropTypes.func,
  };

  return <FullScreenImages template={ImageGalleryImagesTemplate} element={element} />;
};

ImageGalleryBase.propTypes = {
  element: PropTypes.shape({
    "story-elements": PropTypes.array,
  }),
  opts: PropTypes.shape({ imageWidths: PropTypes.array }),
  story: shapeStory,
  config: shapeConfig,
  template: PropTypes.string,
};

export const ImageGallery = withElementWrapper(ImageGalleryBase);
