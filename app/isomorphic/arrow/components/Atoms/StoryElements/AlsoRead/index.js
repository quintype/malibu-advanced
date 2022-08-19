import React from "react";
import get from "lodash.get";
import { LazyLoadImages, Link, ResponsiveImage } from "@quintype/components";
import { withElementWrapper } from "../withElementWrapper";
import PropTypes from "prop-types";
import { FallbackImage } from "../../FallbackImage";
import { clientWidth, isEmpty, shapeConfig, getTextColor } from "../../../../utils/utils";
import { useStateValue } from "../../../SharedContext";
import "./also-read.m.css";

const DisplayImage = ({ story, linkedImage, template, isRightAlign }) => {
  const isLeftAlign = template === "textLeftAlign";
  const isMobile = clientWidth("mobile");
  const rightAlignAspectRatio = isRightAlign && isMobile ? [4, 3] : [16, 9];
  const imageAspectRatio = isLeftAlign ? [16, 9] : rightAlignAspectRatio;
  const alternateText = story["hero-image-caption"] || story.headline;

  return (
    <div styleName="card-image-wrapper">
      {!isEmpty(linkedImage) ? (
        <figure styleName="card-image">
          <LazyLoadImages>
            <ResponsiveImage
              slug={linkedImage}
              aspect-ratio={imageAspectRatio}
              defaultWidth={480}
              widths={[250, 480, 640]}
              imgParams={{ auto: ["format", "compress"] }}
              alt={alternateText}
            />
          </LazyLoadImages>
        </figure>
      ) : (
        <div styleName="image" className="arr--fallback-also-read">
          <FallbackImage />
        </div>
      )}
    </div>
  );
};

DisplayImage.propTypes = {
  story: PropTypes.shape({ "hero-image-caption": PropTypes.string, headline: PropTypes.string }),
  linkedImage: PropTypes.string,
  template: PropTypes.string,
  isRightAlign: PropTypes.bool,
};

const AlsoReadBase = ({
  story = {},
  element,
  template = "",
  opts = {},
  css = {},
  config = {},
  render,
  ...restProps,
}) => {
  const content = element.text;
  if (!content) return null;

  const linkedStories = get(story, ["linked-stories"], {});
  const linkedStoryId = get(element, ["metadata", "linked-story-id"]);
  const linkedStorySlug = get(linkedStories, [linkedStoryId, "url"]);
  const linkedImage = get(linkedStories, [linkedStoryId, "hero-image-s3-key"], "");
  const storyUrl = linkedStorySlug && linkedStorySlug;
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const { title = "" } = opts;
  const { textColor } = css;

  const displayTitle = title || "Also Read";
  const isDefault = template === "" || template === "default";
  const isRightAlign = template === "imageRightAlign";
  const templateStyle = template ? `alsoread-${template}` : "alsoread-default";

  return (
    <Link
      className="arrow-component arr--also-read-element"
      styleName={templateStyle}
      data-test-id="also-read"
      href={storyUrl}
      aria-label="also-read"
      {...restProps}>
      {!isDefault && <div styleName={`default-text ${textInvertColor}`}>{displayTitle}</div>}
      {isDefault && (
        <DisplayImage story={story} linkedImage={linkedImage} template={template} isRightAlign={isRightAlign} />
      )}
      <div styleName="content-wrapper">
        <div
          styleName="headline"
          style={textColor ? { color: textColor } : { color: textInvertColor }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        {isRightAlign && <DisplayImage story={story} linkedImage={linkedImage} template={template} />}
      </div>
    </Link>
  );
};

AlsoReadBase.propTypes = {
  /**  template can be default, textLeftAlign or imageRightAlign */
  template: PropTypes.string,
  story: PropTypes.shape({ "linked-stories": PropTypes.object }),
  element: PropTypes.shape({
    text: PropTypes.string,
    metadata: PropTypes.shape({
      linkedStoryId: PropTypes.shape({ url: PropTypes.string, "hero-image-s3-key": PropTypes.string }),
    }),
  }),
  opts: PropTypes.shape({ title: PropTypes.string }),
  config: shapeConfig,
  render: PropTypes.func,
  css: PropTypes.object,
};

export const AlsoRead = withElementWrapper(AlsoReadBase);
