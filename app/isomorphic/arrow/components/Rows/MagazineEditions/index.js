import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { MagazineCoverImageCard } from "../../Atoms/MagazineCoverImage";
import { CollectionName } from "../../Atoms/CollectionName";
import {
  generateNavigateSlug,
  getTextColor,
  getTimeStamp,
  navigateTo,
  timestampToFormat,
  getTimeStampConfig,
} from "../../../utils/utils";
import "./magazine-editions.m.css";
import { StateProvider } from "../../SharedContext";
import get from "lodash/get";
import { LoadmoreButton } from "../../Atoms/Loadmore";

const MagazineEditions = ({ collection = [], config = {}, onClick, limit, showLoadmore = false }) => {
  if (!collection.length) return null;
  const {
    theme = "",
    collectionNameTemplate = "",
    showRowTitle = true,
    rowTitle = "Other Issues",
    editionNameFormat = "magazineDate",
    template = "NavigateToPage",
  } = config;
  const textColor = getTextColor(theme);
  const issues = collection.map((issue) => issue.collection) || [];
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const dispatch = useDispatch();
  const url = generateNavigateSlug(collection, { ...qtConfig, ...config });
  const timeStampConfig = getTimeStampConfig(qtConfig);

  return (
    <div
      className="full-width-with-padding arrow-component arr-magazine-issues"
      style={{ backgroundColor: theme || "initial" }}
      data-test-id="editions"
    >
      <div styleName={`container ${textColor}`}>
        {showRowTitle && (
          <CollectionName
            collection={issues}
            collectionNameTemplate={collectionNameTemplate}
            customCollectionName={rowTitle}
            navigate={false}
          />
        )}
        <div styleName="issues">
          {issues.slice(0, limit).map((issue, index) => {
            const { name, "created-at": createdAt, "collection-date": issueDate } = issue;
            const date = issueDate || createdAt;
            return (
              <div key={index} data-test-id={`current-issue-${index}`}>
                <MagazineCoverImageCard collection={issue} config={{ ...config, isArchivePage: false }} />
                <div styleName="date" data-test-id="issue-label">
                  {editionNameFormat === "magazineTitle"
                    ? name
                    : getTimeStamp(date, timestampToFormat, timeStampConfig)}
                </div>
              </div>
            );
          })}
        </div>
        {showLoadmore && (
          <LoadmoreButton
            onClick={onClick}
            template={template}
            config={config}
            qtConfig={qtConfig}
            navigate={() => navigateTo(dispatch, url)}
          />
        )}
      </div>
    </div>
  );
};

MagazineEditions.propTypes = {
  collection: PropTypes.array,
  config: PropTypes.shape({
    rowTitle: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    theme: PropTypes.string,
    editionNameFormat: PropTypes.string,
    showRowTitle: PropTypes.bool,
  }),
  onClick: PropTypes.func,
  limit: PropTypes.number,
  showLoadmore: PropTypes.bool,
};

export default StateProvider(MagazineEditions);
