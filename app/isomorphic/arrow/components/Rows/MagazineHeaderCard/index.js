import React from "react";
import PropTypes from "prop-types";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { generateNavigateSlug, getTextColor, getTimeStamp, navigateTo, timestampToFormat } from "../../../utils/utils";
import "./magazine-cards.m.css";
import { StateProvider } from "../../SharedContext";
import { MagazineCoverImageCard } from "../../Atoms/MagazineCoverImage";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import upperCase from "lodash/upperCase";

const MagazineHeaderCard = ({ collection = {}, config = {} }) => {
  const { "created-at": createdAt, "collection-date": issueDate, summary } = collection;
  const { theme = "", customUrlPath = "", magazineTitle = "", magazinePageUrl = "", magazineSlug = "" } = config;
  const textColor = getTextColor(theme);
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig, customUrlPath);
  const date = issueDate || createdAt;
  const timeStampConfig = {
    isUpperCase: true,
    disableMeridiem: true
  };
  return (
    <div
      className="full-width-with-padding arrow-component"
      style={{ backgroundColor: theme || "initial" }}
      data-test-id="magazine-header-card">
      <div className="arr-magazine-card" styleName="magazine-header intro-button">
        <MagazineCoverImageCard collection={collection} config={{ ...config, magazineSlug }} />
        <div styleName="content">
          <div styleName={`time ${textColor}`} data-test-id="title-time">
            <a href={magazinePageUrl} data-test-id="magazine-title" aria-label="magazine-title">
              {upperCase(magazineTitle)}
            </a>
            &nbsp; | &nbsp;
            {getTimeStamp(date, timestampToFormat, timeStampConfig)}
          </div>
          <CollectionName collection={collection} headerLevel="2" navigate={false} />
          <div styleName={`summary ${textColor}`} data-test-id="magazine-summary">
            {summary}
          </div>
          <LoadmoreButton
            collection={collection}
            template="customUrlPath"
            config={config}
            navigate={() => navigateTo(dispatch, url)}
            qtConfig={qtConfig}
          />
        </div>
      </div>
    </div>
  );
};

MagazineHeaderCard.propTypes = {
  collection: PropTypes.shape({
    "created-at": PropTypes.number,
    summary: PropTypes.string,
    items: PropTypes.array
  }),
  config: PropTypes.shape({
    theme: PropTypes.string,
    footerButton: PropTypes.string,
    magazineTitle: PropTypes.string,
    magazinePageUrl: PropTypes.string,
    customUrlPath: PropTypes.string
  })
};

export default StateProvider(MagazineHeaderCard);
