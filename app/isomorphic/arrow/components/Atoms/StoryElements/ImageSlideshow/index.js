import { LazyLoadImages, ResponsiveImage } from "@quintype/components";
import get from "lodash.get";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { shapeStory, getTextColor } from "../../../../utils/utils";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";
import { withElementWrapper } from "../withElementWrapper";
import { ScrollSnap } from "../../ScrollSnap";
import "./image-slideshow.m.css";
import { HyperLink } from "../../Hyperlink";
import { useStateValue } from "../../../SharedContext";

const ImageSlideshowBase = (props) => {
  if (!props.element) return null;

  const config = useStateValue() || {};
  const textColor = getTextColor(config.theme);

  const Slide = (image, index, onClickHandler) => {
    const {
      id,
      "image-s3-key": imageS3Key,
      metadata,
      title,
      hyperlink = "",
      "image-attribution": attribution = "",
    } = image;
    return (
      <div styleName="slide" key={id}>
        <figure key={id} onClick={() => onClickHandler(index)}>
          <LazyLoadImages margin={"0px"}>
            <ResponsiveImage
              slug={imageS3Key}
              metadata={metadata}
              aspectRatio={[16, 9]}
              defaultWidth={480}
              widths={[250, 480, 640]}
              imgParams={{ auto: ["format", "compress"] }}
              styleName="image"
              alt={title}
            />
          </LazyLoadImages>
          {hyperlink && <HyperLink hyperLink={hyperlink} />}
        </figure>
        {(title || attribution) && (
          <div styleName="captionAttributionWrapper">
            {title && <span styleName={`caption ${textColor}`} dangerouslySetInnerHTML={{ __html: title }} />}
            {title && attribution && <span styleName="separator" />}
            {attribution && (
              <span styleName={`attribution ${textColor}`} dangerouslySetInnerHTML={{ __html: attribution }} />
            )}
          </div>
        )}
      </div>
    );
  };

  const ImageSlideshowTemplate = ({ onClickHandler }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const storyElements = get(props, ["element", "story-elements"], []);
    const scrollContainerRef = useRef(null);
    useEffect(() => {
      if (scrollContainerRef.current) {
        const _width = (9 / 16) * scrollContainerRef.current.offsetWidth;
        setContainerWidth(_width);
      }
    }, [scrollContainerRef]);

    return (
      <div
        ref={scrollContainerRef}
        className="arr--image-slideshow-element"
        styleName="slideshow"
        data-test-id="image-slideshow"
      >
        <ScrollSnap slideIndicator={"none"} sliderArrowStyles={{ top: `${Math.round(containerWidth / 2)}px` }}>
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
