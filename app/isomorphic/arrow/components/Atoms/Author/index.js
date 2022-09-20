import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { useStateValue } from "../../SharedContext";
import { ResponsiveImage, Link } from "@quintype/components";
import { getTextColor } from "../../../utils/utils";
import { connect } from "react-redux";

import "./author.m.css";

const AuthorBase = ({ story, hideAuthorImage, isBottom, prefix = "", config = {} }) => {
  const configData = useStateValue() || {};
  const isAuthor = get(configData, ["showAuthor"], true);
  const {
    "avatar-url": avatarUrl,
    "avatar-s3-key": avatarS3Key,
    name: authorName,
    slug,
  } = get(story, ["authors", "0"], "");
  const isBottomClasses = isBottom ? "bottom-fix" : "";
  const textColor = getTextColor(configData.theme);
  const mountAt = get(config, ["mountAt"], "");

  const authorImage = (dir) => {
    if (!avatarUrl && !avatarS3Key) {
      return null;
    }
    return (
      <div styleName={`author-image ${dir}-image`} data-test-id="author-image">
        <figure>
          {avatarS3Key ? (
            <ResponsiveImage
              slug={avatarS3Key}
              aspect-ratio={[1, 1]}
              defaultWidth={400}
              imgParams={{ auto: ["format", "compress"] }}
              alt={authorName}
            />
          ) : (
            <img src={avatarUrl} />
          )}
        </figure>
      </div>
    );
  };
  const isPrefix = (dir) => {
    if (prefix) {
      return (
        <div className="arr-author-prefix" styleName={`prefix ${textColor}`}>
          {prefix}
        </div>
      );
    }
    return !hideAuthorImage && authorImage(dir);
  };
  return (
    <>
      {isAuthor && (
        <Link
          className="author-name arr-author-name arrow-component"
          href={`${mountAt}/author/` + slug}
          styleName={`author ${isBottomClasses}`}
          aria-label="author-name"
        >
          {isPrefix("ltr")}
          <div className="author-name" styleName={`author-name ${textColor}`} data-test-id="author-name">
            {authorName || story["author-name"]}
          </div>
          {!prefix && isPrefix("rtl")}
        </Link>
      )}
    </>
  );
};

function mapStateToProps(state) {
  return {
    config: get(state, ["qt", "config"], {}),
  };
}

export const Author = connect(mapStateToProps)(AuthorBase);

AuthorBase.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  /** Hide Author Avatar Image */
  hideAuthorImage: PropTypes.bool,
  // fix Author bottom of the storyCard
  isBottom: PropTypes.bool,
  // fix prefix before the author name
  prefix: PropTypes.string,
  config: PropTypes.object,
};

AuthorBase.defaultProps = {
  hideAuthorImage: false,
  isBottom: false,
  prefix: "",
};
