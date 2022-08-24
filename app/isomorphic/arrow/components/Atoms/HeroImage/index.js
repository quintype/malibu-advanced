import { Link, ResponsiveHeroImage } from "@quintype/components";
import get from "lodash/get";
import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import { clientWidth, isExternalStory, getStoryUrl, removeHtmlTags } from "../../../utils/utils";
import { useStateValue } from "../../SharedContext";
import { FallbackImage } from "../FallbackImage";
import { HyperLink } from "../Hyperlink";
import "./hero-image.m.css";

export const HeroImage = ({
  story,
  FullBleed,
  aspectRatio,
  defaultWidth,
  widths,
  isHorizontal,
  isHorizontalMobile,
  isHorizontalWithImageLast,
  defaultFallback,
  isStoryPageImage,
  config
}) => {
  const { fallbackImageUrl = "" } = useStateValue() || {};
  const { StoryTemplateIcon = () => null } = config;

  const showImagePlaceholder = useSelector((state) => get(state, ["qt", "config", "showPlaceholder"]));
  const getPlaceholderStyleName = showImagePlaceholder ? "placeholder" : "";

  const fullBleed = FullBleed ? "" : "with-padding";

  let heroImageClass = "hero-image";
  if (isHorizontal) heroImageClass = "right-padding";
  else if (isHorizontalWithImageLast) heroImageClass = "left-padding";

  const heroImageMobClasses = isHorizontalMobile ? "right-padding-mob" : "";

  const getPadding = (aspectRatio) => {
    const [height, width] = aspectRatio;
    if (height > 0 && width > 0) {
      const padding = (width / height) * 100;
      return padding;
    }
    return 0;
  };

  const [mobileAspectRatio, desktopAspectRatio = mobileAspectRatio] = aspectRatio;
  const isMobile = clientWidth("mobile");

  const imageAspectRatio = isMobile ? mobileAspectRatio : desktopAspectRatio;
  const imagePadding = isMobile ? getPadding(mobileAspectRatio) : getPadding(desktopAspectRatio);
  const slug =
    get(story, ["hero-image-s3-key"]) ||
    get(story, ["alternative", "home", "default", "hero-image", "hero-image-s3-key"]);
  const hyperLink = get(story, ["hero-image-hyperlink"], "");
  const imageCaption = get(story, ["hero-image-caption"], "");
  const imageAltText = imageCaption ? removeHtmlTags(imageCaption) : get(story, ["headline"], "");

  const fallbackImage = () => {
    if (!slug) {
      if (fallbackImageUrl && !isStoryPageImage) {
        return (
          <figure
            styleName={`image ${getPlaceholderStyleName}`}
            className="arr--responsive-hero-image"
            style={{
              paddingTop: imagePadding + `%`
            }}>
            <img className="qt-image" data-src={`${fallbackImageUrl}`} alt="image-fallback"></img>
          </figure>
        );
      }

      return (
        <>
          {defaultFallback ? (
            <div
              styleName={`image ${getPlaceholderStyleName}`}
              className="arr--fallback-hero-image"
              data-test-id="arr--fallback-hero-image"
              style={{
                paddingTop: imagePadding + `%`
              }}>
              <StoryTemplateIcon storyTemplate={story["story-template"]} />
              <FallbackImage />
            </div>
          ) : null}
        </>
      );
    }
    return (
      <>
        <figure
          styleName={`image ${getPlaceholderStyleName}`}
          className="arr--responsive-hero-image"
          style={{ paddingTop: imagePadding + `%` }}>
          <StoryTemplateIcon storyTemplate={story["story-template"]} />
          <ResponsiveHeroImage
            story={story}
            aspectRatio={imageAspectRatio}
            defaultWidth={defaultWidth}
            widths={widths}
            imgParams={{ auto: ["format", "compress"], fit: "max" }}
            alt={imageAltText}
          />
        </figure>
        {isStoryPageImage && hyperLink && <HyperLink hyperLink={hyperLink} />}
      </>
    );
  };

  return (
    story &&
    (isStoryPageImage ? (
      <div
        className="arr--hero-image"
        data-test-id="arr--hero-image"
        styleName={`${heroImageClass} ${fullBleed} ${heroImageMobClasses}`}>
        {fallbackImage()}
      </div>
    ) : (
      <Link
        className="arr--hero-image"
        data-test-id="arr--hero-image"
        href={getStoryUrl(story, `/${story.slug}`)}
        externalLink={isExternalStory(story)}
        styleName={`${heroImageClass} ${fullBleed} ${heroImageMobClasses}`}
        aria-label="fallback-hero-image">
        {fallbackImage()}
      </Link>
    ))
  );
};

HeroImage.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  /** Removes the Hero Image padding for the image to bleed over the margin */
  FullBleed: PropTypes.bool,
  /** The default width for the image, in case the browser does not support srcset */
  defaultWidth: PropTypes.number,
  /** The list of available widths */
  widths: PropTypes.array,
  // fatch the correct hero image
  aspectRatio: PropTypes.array,

  //  Hints for the browser to choose the best size
  /** This prop is responsible for adding padding-right of the image and remove padding bottom of the image  */
  isHorizontal: PropTypes.bool,
  /** This prop is responsible for adding padding-bottom in desktop and padding-right in mobile */
  isHorizontalMobile: PropTypes.bool,
  // this prop is responsive for rendering fallback image on story page
  defaultFallback: PropTypes.bool,
  isHorizontalWithImageLast: PropTypes.bool,
  isStoryPageImage: PropTypes.bool,
  config: PropTypes.object
};

HeroImage.defaultProps = {
  FullBleed: true,
  aspectRatio: [[1, 1], [16, 9]],
  defaultWidth: 480,
  widths: [250, 480, 640],
  isHorizontal: false,
  isHorizontalMobile: false,
  defaultFallback: true,
  isStoryPageImage: false,
  isHorizontalWithImageLast: false,
  config: {}
};
