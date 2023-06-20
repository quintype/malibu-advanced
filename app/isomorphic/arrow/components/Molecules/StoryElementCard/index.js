import React from "react";
import get from "lodash.get";
import { Text } from "../../Atoms/StoryElements/Text";
import { Blurb } from "../../Atoms/StoryElements/Blurb";
import "./story-element-card.m.css";
import { Summary } from "../../Atoms/StoryElements/Summary";
import { BlockQuote } from "../../Atoms/StoryElements/BlockQuote";
import { BigFact } from "../../Atoms/StoryElements/BigFact";
import { AlsoRead } from "../../Atoms/StoryElements/AlsoRead";
import { Image } from "../../Atoms/StoryElements/Image";
import PropTypes from "prop-types";
import { QuestionAnswer } from "../../Atoms/StoryElements/QuestionAnswer";
import { ImageGallery } from "../../Atoms/StoryElements/imageGallery";
import { StoryElement } from "../../Atoms/StoryElements/StoryElement";
import { Video } from "../../Atoms/StoryElements/Video";
import { Quote } from "../../Atoms/StoryElements/Quote";
import { Reference } from "../../Atoms/StoryElements/Reference";
import { CaptionAttribution } from "../../Atoms/CaptionAttribution";
import { Attachment } from "../../Atoms/StoryElements/Attachment";
import { SocialShare } from "@quintype/components";
import { SocialShareTemplate } from "../../Molecules/SocialShareTemplate";
import { facebookMobileVideoResizeFix, getTextColor } from "../../../utils/utils";
import { ImageSlideshow } from "../../Atoms/StoryElements/ImageSlideshow";
import { useStateValue } from "../../SharedContext";

const getElementType = (element) => element["subtype"] || element["type"] || "";
const getElement = (story, element, config = {}, AdComponent, WidgetComp, index, cardId, enableDarkMode) => {
  const {
    text = {},
    summary = {},
    blurb = {},
    blockquote = {},
    quote = {},
    "also-read": alsoRead = {},
    "q-and-a": qaElement = {},
    question: questionElement = {},
    answer: answerElement = {},
    references = {},
    jsEmbed = {}
  } = config;

  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);

  let elementType = getElementType(element);

  if (elementType === "image-gallery") {
    elementType = element.metadata["type"];
  }

  const storyElementId = get(element, ["id"]);
  const targetId = element.targetId ? `widget-${element.targetId}-${story.id}` : `widget-${index}_${cardId}`;
  switch (elementType) {
    case "ad":
      return <AdComponent {...element} id={`ad-${index}_${cardId}`} />;

    case "widget":
      return <WidgetComp widgetCode={element.config.customCode} id={targetId} />;

    case "text":
    case "cta":
      const {
        css: {
          textColor: textElementColor = "#000",
          darkTextColor: darkTextElementColor = "#fff",
          hyperlinkColor = "#2f81cd"
        } = {}
      } = text;

      return (
        <Text
          element={element}
          css={{ textColor: enableDarkMode ? darkTextElementColor : textElementColor, hyperlinkColor: hyperlinkColor }}
        />
      );

    case "summary":
      const {
        template: summaryTemplate = "",
        css: { headerBgColor = "", darkHeaderBgColor } = {},
        opts: { headline = "", hideHeadline = false } = {}
      } = summary;
      return (
        <Summary
          element={element}
          template={summaryTemplate}
          opts={{
            headline: headline || "Summary",
            hideHeadline: hideHeadline
          }}
          css={{ headerBgColor: enableDarkMode ? darkHeaderBgColor : headerBgColor || "" }}
        />
      );

    case "blurb":
      const {
        template: blurbTemplate = "default",
        css: { borderColor = "#3cab92", darkBorderColor = "#3cab92" } = {}
      } = blurb;
      return (
        <Blurb
          element={element}
          template={blurbTemplate}
          css={{ borderColor: enableDarkMode ? darkBorderColor : borderColor }}
        />
      );

    case "blockquote":
      const {
        template: blockQuoteTemplate = "default",
        css: {
          iconType = "edgeIcon",
          blockQuoteColor = "",
          darkBlockQuoteColor = "",
          backgroundShade = "",
          darkBackgroundShade = ""
        } = {}
      } = blockquote;
      return (
        <BlockQuote
          element={element}
          template={blockQuoteTemplate}
          css={{
            iconType: iconType,
            blockQuoteColor: enableDarkMode ? darkBlockQuoteColor : blockQuoteColor,
            backgroundShade: enableDarkMode ? darkBackgroundShade : backgroundShade
          }}
        />
      );

    case "quote":
      const {
        template: quoteTemplate = "borderNone",
        css: { borderColor: quoteBorderColor = "#2f81cd", darkBorderColor: darkQuoteBorderColor = "#2f81cd" } = {}
      } = quote;
      return (
        <Quote
          element={element}
          template={quoteTemplate}
          css={{ borderColor: enableDarkMode ? darkQuoteBorderColor : quoteBorderColor }}
        />
      );

    case "bigfact":
      return <BigFact element={element} />;

    case "also-read":
      const {
        template: alsoReadTemplate = "default",
        css: { textColor = "", darkTextColor = "" } = {},
        opts: { title = "" } = {}
      } = alsoRead;
      return (
        <AlsoRead
          story={story}
          element={element}
          template={alsoReadTemplate}
          css={{ textColor: enableDarkMode ? darkTextColor : textColor }}
          opts={{ title }}
        />
      );

    case "image":
      return <Image element={element} />;

    case "q-and-a":
      const {
        template: qaTemplate = "default",
        css: { iconColor = "" } = {},
        opts: { defaultIconType = "edge" } = {}
      } = qaElement;
      return (
        <QuestionAnswer
          element={element}
          opts={{
            type: "q-and-a",
            defaultIconType: defaultIconType
          }}
          template={qaTemplate}
          css={{
            iconColor: iconColor
          }}
        />
      );

    case "question":
      const {
        template: questionTemplate = "default",
        css: { questionIconColor = "" } = {},
        opts: { defaultQuestionIconType = "edge" } = {}
      } = questionElement;
      return (
        <QuestionAnswer
          element={element}
          opts={{
            type: "question",
            defaultIconType: defaultQuestionIconType
          }}
          template={questionTemplate}
          css={{
            iconColor: questionIconColor
          }}
        />
      );

    case "answer":
      const {
        template: answerTemplate = "default",
        css: { answerIconColor = "" } = {},
        opts: { defaultAnswerIconType = "edge" } = {}
      } = answerElement;
      return (
        <QuestionAnswer
          element={element}
          opts={{
            type: "answer",
            defaultIconType: defaultAnswerIconType
          }}
          template={answerTemplate}
          css={{
            iconColor: answerIconColor
          }}
        />
      );

    case "gallery":
      return (
        <div className="content-style" id={`image-gallery-${storyElementId}`}>
          <ImageGallery element={element} />
        </div>
      );

    case "slideshow":
      return (
        <div className="content-style" id={`image-slideshow-${storyElementId}`}>
          <ImageSlideshow element={element} />
        </div>
      );

    case "youtube-video":
    case "dailymotion-video":
    case "dailymotion-embed-script":
    case "brightcove-video":
      const lazyLoad = get(jsEmbed, ["lazyLoad"], true);
      return (
        <div className="content-style" id={`video-${storyElementId}`}>
          <Video element={element} story={story} loadIframeOnClick={lazyLoad} />
        </div>
      );
    case "attachment":
      return <Attachment element={element} />;
    case "tweet":
    case "jsembed":
      return (
        <div className="content-style" id={`jsembed-${storyElementId}`}>
          <StoryElement element={element} />
        </div>
      );
    case "references":
      const { opts: { showHeadline = true, headlineText = "" } = {} } = references;
      return (
        <Reference
          element={element}
          opts={{
            showHeadline: showHeadline,
            headlineText: headlineText
          }}
        />
      );
    default:
      return (
        <div className="content-style" id={`element-${storyElementId}`} styleName={`${textInvertColor}`}>
          <StoryElement element={element} story={story} />
        </div>
      );
  }
};

const MainImageWrapper = ({ imageElement, story, children, config, card }) => {
  return (
    <>
      <div style={{ backgroundColor: config.theme || "initial" }}>
        <Image element={imageElement} caption={false} />
        <div styleName="image-share">
          <CaptionAttribution element={imageElement} config={config} />
          <SocialShare
            template={SocialShareTemplate}
            title={story.headline}
            theme={config.theme}
            fullUrl={encodeURI(`${get(story, ["url"], "")}?cardId=${get(card, ["id"], -1)}`)}
          />
        </div>
      </div>
    </>
  );
};

MainImageWrapper.propTypes = {
  story: PropTypes.object,
  imageElement: PropTypes.object,
  config: PropTypes.object,
  children: PropTypes.node,
  card: PropTypes.shape({
    id: PropTypes.string
  })
};

export const StoryElementCard = ({
  story,
  card,
  heroVideoElementId = -1,
  config,
  isLive,
  theme,
  adComponent,
  widgetComp,
  enableDarkMode
}) => {
  const textColor = getTextColor(theme);
  const isLiveBlog = isLive ? "live-blog" : "";
  let shouldRunFBMobileVideoFix = true;

  return (
    <div className="arr--story-page-card-wrapper">
      {get(card, ["story-elements"], []).map((element, index) => {
        if (element.id === heroVideoElementId) return false;
        if (element.subtype && element.subtype === "facebook-post" && shouldRunFBMobileVideoFix) {
          facebookMobileVideoResizeFix();
          shouldRunFBMobileVideoFix = false;
        }
        const tableStyle = element && element.subtype === "table" ? "table" : "";
        const cardId = get(card, ["id"], "");
        return (
          <div
            key={element.id}
            className="arr--element-container"
            styleName={`element-container ${isLiveBlog} ${tableStyle} ${textColor}`}>
            {getElement(story, element, config, adComponent, widgetComp, index, cardId, enableDarkMode)}
          </div>
        );
      })}
    </div>
  );
};
StoryElementCard.propTypes = {
  story: PropTypes.object,
  card: PropTypes.array,
  heroVideoElementId: PropTypes.number,
  config: PropTypes.object,
  isLive: PropTypes.bool,
  theme: PropTypes.string,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool
};

export const PhotoStoryElement = ({ card = {}, config, story, adComponent, widgetComp, enableDarkMode, theme }) => {
  let shouldRunFBMobileVideoFix = true;
  const textColor = getTextColor(theme);
  return (
    <div styleName={`story-card ${textColor}`}>
      {get(card, ["story-elements"], []).map((element, index) => {
        const cardId = get(card, ["id"], "");
        if (element.type === "image") {
          return <MainImageWrapper imageElement={element} story={story} config={config} card={card} />;
        } else {
          if (element.subtype && element.subtype === "facebook-post" && shouldRunFBMobileVideoFix) {
            facebookMobileVideoResizeFix();
            shouldRunFBMobileVideoFix = false;
          }
          return (
            <div styleName="element-container" key={index}>
              {getElement(story, element, config, adComponent, widgetComp, index, cardId, enableDarkMode)}
            </div>
          );
        }
      })}
    </div>
  );
};

PhotoStoryElement.propTypes = {
  story: PropTypes.object,
  card: PropTypes.object,
  config: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  theme: PropTypes.string
};

export const SlotAfterStory = ({ id = "", element = {}, AdComponent, WidgetComp }) => {
  const targetId = element.targetId ? `widget-after-story-${element.targetId}-${id}` : `widget-after-story-${id}`;
  switch (element.type) {
    case "ad":
      return <AdComponent {...element} id={`ad-after-story-${id}`} />;
    case "widget":
      return <WidgetComp widgetCode={element.config.customCode} id={targetId} />;
    default:
      return null;
  }
};

SlotAfterStory.propTypes = {
  id: PropTypes.string,
  element: PropTypes.object,
  AdComponent: PropTypes.func,
  WidgetComp: PropTypes.func
};
