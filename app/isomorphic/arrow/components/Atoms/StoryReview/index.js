import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { ReviewRating } from "@quintype/components";
import { getTextColor } from "../../../utils/utils";
import "./story-review.m.css";

export const StoryReview = (props) => {
  const storyTemplate = get(props, ["story", "story-template"], "");
  if (storyTemplate !== "review") return null;

  const reviewTitle = get(props, ["story", "metadata", "review-title"], "");
  const ratingValue = get(props, ["story", "metadata", "review-rating", "value"], "0");
  const theme = get(props, ["theme"], "");
  const textColor = getTextColor(theme);

  return (
    <div className="arrow-component arr--story-review" styleName="wrapper" data-test-id="story-review">
      <h5 styleName={`title ${textColor}`}>
        {reviewTitle}
        <span styleName="value">({ratingValue} / 5)</span>
      </h5>
      <ReviewRating value={ratingValue} />
    </div>
  );
};

StoryReview.propTypes = {
  story: PropTypes.shape({
    "story-template": PropTypes.string,
    metadata: PropTypes.shape({
      "review-title": PropTypes.string,
      "review-rating": PropTypes.shape({
        value: PropTypes.string,
      }),
    }),
  }),
  theme: PropTypes.string,
};
