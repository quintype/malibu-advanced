import React from "react";
import PropTypes from "prop-types";
import { ResponsiveImage } from "@quintype/components";
import { withElementWrapper } from "../withElementWrapper";
import { roundedCornerClass } from "../../../../constants";
import "./image.m.css";
import { shapeStory, shapeConfig } from "../../../../utils/utils";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";
import { useStateValue } from "../../../SharedContext";
import { useSelector } from "react-redux";
import get from "lodash.get";

import { CaptionAttribution } from "../../CaptionAttribution";
import { HyperLink } from "../../Hyperlink";

const ImageBase = ({ element, opts = {}, story = {}, config = {}, caption = true, ...restProps }) => {
  if (!element) return null;
  const configData = useStateValue() || {};

  const enableRoundedCorners = useSelector((state) =>
    get(state, ["qt", "config", "pagebuilder-config", "general", "enableRoundedCorners"], false)
  );

  const roundedCorners = enableRoundedCorners ? roundedCornerClass : "";

  const ImageTemplate = ({ onClick }) => (
    <div styleName="image-template">
      <figure styleName="element" className={`${roundedCorners}`} onClick={() => onClick()}>
        <ResponsiveImage
          slug={element["image-s3-key"]}
          metadata={element["image-metadata"]}
          alt={element.title}
          aspectRatio={null}
          defaultWidth={640}
          widths={opts.imageWidths || [360, 640]}
          imgParams={{ auto: ["format", "compress"] }}
        />
      </figure>
      {element.hyperlink && <HyperLink hyperLink={element.hyperlink} />}
    </div>
  );

  ImageTemplate.propTypes = {
    onClick: PropTypes.func,
  };

  return (
    <div className="arrow-component arr--image-element" {...restProps} data-test-id="image-element">
      <FullScreenImages template={ImageTemplate} element={element} imageSlug={element["image-s3-key"]} story={story} />
      {caption && <CaptionAttribution element={element} config={configData} />}
    </div>
  );
};

ImageBase.propTypes = {
  element: PropTypes.shape({
    "image-s3-key": PropTypes.string,
    "image-metadata": PropTypes.object,
    "image-attribution": PropTypes.string,
    title: PropTypes.string,
    hyperlink: PropTypes.string,
  }),
  caption: PropTypes.bool,
  opts: PropTypes.shape({ imageWidths: PropTypes.array }),
  story: shapeStory,
  config: shapeConfig,
};

export const Image = withElementWrapper(ImageBase);
