import { LazyLoadImages, ResponsiveImage } from "@quintype/components";
import get from "lodash.get";
import PropTypes from "prop-types";
import React from "react";
import { shapeStory } from "../../../../utils/utils";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";
import { withElementWrapper } from "../withElementWrapper";
import { ScrollSnap } from "../../ScrollSnap";
import "./image-slideshow.m.css";
import { HyperLink } from "../../Hyperlink";

const ImageSlideshowBase = (props) => {
  if (!props.element) return null;

  const Slide = (image, index, onClickHandler) => {
    const { id, "image-s3-key": imageS3Key, metadata, title, hyperlink = "" } = image;
    return (
      <div styleName="slide" key={id}>
        <figure key={id} styleName="image-container" onClick={() => onClickHandler(index)}>
          <LazyLoadImages margin={"0px"}>
            <ResponsiveImage
              slug={imageS3Key}
              metadata={metadata}
              aspect-ratio={[16, 9]}
              defaultWidth={480}
              widths={[250, 480, 640]}
              imgParams={{ auto: ["format", "compress"] }}
              styleName="image"
              alt={title}
            />
          </LazyLoadImages>
        </figure>
        {hyperlink && <HyperLink hyperLink={hyperlink} />}
        <p styleName="caption" dangerouslySetInnerHTML={{ __html: title }} />
      </div>
    );
  };

  const ImageSlideshowTemplate = ({ onClickHandler }) => {
    const storyElements = get(props, ["element", "story-elements"], []);

    return (
      <div className="arr--image-slideshow-element" styleName="slideshow" data-test-id="image-slideshow">
        <ScrollSnap slideIndicator={"none"}>
          {storyElements.map((image, index) => Slide(image, index, onClickHandler))}
        </ScrollSnap>
      </div>
    );
  };

  ImageSlideshowTemplate.propTypes = {
    onClickHandler: PropTypes.func,
  };

  return <FullScreenImages template={ImageSlideshowTemplate} element={props.element} />;
};

ImageSlideshowBase.propTypes = {
  element: PropTypes.shape({
    "story-elements": PropTypes.array,
  }),
  story: shapeStory,
};

export const ImageSlideshow = withElementWrapper(ImageSlideshowBase);
