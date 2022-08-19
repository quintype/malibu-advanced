/* eslint-disable no-case-declarations */
import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { shapeConfig, shapeStory, updateContentLinks, getTextColor } from "../../../../utils/utils";
import { withElementWrapper } from "../withElementWrapper";
import "./question-answer.m.css";
import { useStateValue } from "../../../SharedContext";

const supportedTemplates = (type, element) => {
  switch (type) {
    case "q-and-a":
      const { question: qaQuestion, answer: qaAnswer } = get(element, ["metadata"]);
      const qaQuestionAttribution = get(element, ["metadata", "interviewer", "avatar-url"]);
      const qaAnswerAttribution = get(element, ["metadata", "interviewee", "avatar-url"]);
      return {
        question: qaQuestion,
        answer: qaAnswer,
        questionAttribution: qaQuestionAttribution,
        answerAttribution: qaAnswerAttribution
      };
    case "question":
      const qQuestion = get(element, ["text"]);
      const qAttribution = get(element, ["metadata", "interviewer", "avatar-url"]);
      return {
        question: qQuestion,
        questionAttribution: qAttribution
      };
    case "answer":
      const aAnswer = get(element, ["text"]);
      const aAttribution = get(element, ["metadata", "interviewee", "avatar-url"]);
      return {
        answer: aAnswer,
        answerAttribution: aAttribution
      };
  }
};

const QuestionAnswerBase = ({
  element,
  template,
  css = {},
  story = {},
  config = {},
  opts = {},
  render,
  ...restProps
}) => {
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  if (!element) return null;
  const { type, defaultIconType, isExternalLink = true } = opts;
  const { iconColor } = css;
  const { question, answer, questionAttribution, answerAttribution } = supportedTemplates(type, element);

  const theme = getTextColor(iconColor);
  const questionData = question && ((isExternalLink && updateContentLinks(question)) || question);
  const answerData = answer && ((isExternalLink && updateContentLinks(answer)) || answer);
  const isAuthorImageTemplate = template === "withAuthorImage";
  const templateStyle = isAuthorImageTemplate ? "qa-withAuthorImage" : "qa-default";
  const iconType = defaultIconType === "curve" ? "curveIcon" : "edgeIcon";

  const supportQuestionElement = isAuthorImageTemplate ? (
    questionAttribution && (
      <>
        <div styleName="labelAttribution">
          <img src={questionAttribution} loading="lazy" />
        </div>
        <span styleName="hidden"></span>
      </>
    )
  ) : (
    <div styleName={`${iconType} ${theme}`} data-test-id={iconType} style={{ backgroundColor: iconColor }}>
      Q
    </div>
  );

  // EMPTY SPAN FOR EXTRA SPACE

  const supportAnswerElement = isAuthorImageTemplate ? (
    answerAttribution && (
      <>
        <div styleName="labelAttribution">
          <img src={answerAttribution} loading="lazy" />
        </div>
        <span styleName="hidden"></span>
      </>
    )
  ) : (
    <div styleName={`${iconType} ${theme}`} data-test-id={iconType} style={{ backgroundColor: iconColor }}>
      A
    </div>
  );

  return (
    <div
      className="arrow-component arr-custom-style arr--qa-element"
      data-test-id="question-answer"
      styleName={templateStyle}
      {...restProps}>
      {type !== "answer" && (
        <div styleName="q-element" data-test-id="question">
          {supportQuestionElement}
          <div styleName={`content ${textInvertColor}`} dangerouslySetInnerHTML={{ __html: questionData }} />
        </div>
      )}
      {type !== "question" && (
        <div styleName="a-element" data-test-id="answer">
          {supportAnswerElement}
          <div styleName={`content ${textInvertColor}`} dangerouslySetInnerHTML={{ __html: answerData }} />
        </div>
      )}
    </div>
  );
};

QuestionAnswerBase.propTypes = {
  element: PropTypes.shape({
    metadata: PropTypes.shape({
      interviewer: PropTypes.shape({ "avatar-url": PropTypes.string }),
      interviewee: PropTypes.shape({ "avatar-url": PropTypes.string }),
      question: PropTypes.string,
      answer: PropTypes.string
    }),
    text: PropTypes.string
  }),
  opts: PropTypes.shape({ type: PropTypes.string, defaultIconType: PropTypes.string, isExternalLink: PropTypes.bool }),
  template: PropTypes.string,
  css: PropTypes.object,
  config: shapeConfig,
  story: shapeStory,
  render: PropTypes.func
};

export const QuestionAnswer = withElementWrapper(QuestionAnswerBase);
