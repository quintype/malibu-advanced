import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { collectionToStories } from "@quintype/components";
import { StateProvider } from "../../SharedContext";
import { CollectionName } from "../../Atoms/CollectionName";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { HeroImage } from "../../Atoms/HeroImage";
import { getTextColor, rgbToHex } from "../../../utils/utils";
import "./fortune500-ranking.m.css";

const Fortune500Ranking = ({ collection, config }) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;

  const {
    theme = "#ffffff",
    collectionNameTemplate = "default",
    collectionNameBorderColor = "",
    borderColor = "",
    showRanking = true,
    showCompanyLogo = true,
    showRevenue = true,
    showRank = true,
  } = config;

  const textColor = getTextColor(theme);
  const sectionTagBorderColor = rgbToHex(borderColor);

  const renderRankingItem = (story, index) => {
    const rank = index + 1;
    const companyName = get(story, ["headline"], "");
    const revenue = get(story, ["metadata", "revenue"], "");
    const logoUrl = get(story, ["hero-image-s3-key"], "");
    const companyDescription = get(story, ["subheadline"], "");

    return (
      <div key={story.id || index} className="fortune-ranking-item" styleName="ranking-item">
        <div className="ranking-number" styleName="ranking-number">
          {showRank && <span className="rank">{rank}</span>}
        </div>

        <div className="company-info" styleName="company-info">
          {showCompanyLogo && logoUrl && (
            <div className="company-logo" styleName="company-logo">
              <HeroImage
                config={config}
                story={story}
                aspectRatio={[[1, 1]]}
                className="logo-image"
              />
            </div>
          )}

          <div className="company-details" styleName="company-details">
            <h3 className="company-name" styleName="company-name">
              {companyName}
            </h3>
            {companyDescription && (
              <p className="company-description" styleName="company-description">
                {companyDescription}
              </p>
            )}
            {showRevenue && revenue && (
              <div className="revenue" styleName="revenue">
                Revenue: {revenue}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component fortune500-ranking"
      data-test-id="fortune500-ranking"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName="fortune500-ranking-container">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel={2}
        />

        <div className="rankings-list" styleName="rankings-list">
          {stories.map((story, index) => renderRankingItem(story, index))}
        </div>
      </div>
    </div>
  );
};

Fortune500Ranking.propTypes = {
  collection: PropTypes.object,
  config: PropTypes.shape({
    theme: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    borderColor: PropTypes.string,
    showRanking: PropTypes.bool,
    showCompanyLogo: PropTypes.bool,
    showRevenue: PropTypes.bool,
    showRank: PropTypes.bool,
  }),
};

Fortune500Ranking.defaultProps = {
  collection: {},
  config: {
    theme: "#ffffff",
    collectionNameTemplate: "default",
    showRanking: true,
    showCompanyLogo: true,
    showRevenue: true,
    showRank: true,
  },
};

export { Fortune500Ranking };
export default StateProvider(Fortune500Ranking);

