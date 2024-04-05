import React from "react";
import get from "lodash.get";
import { TimeStamp } from "../TimeStamp";
import PropTypes from "prop-types";
import { Author } from "../Author";
import { useStateValue } from "../../SharedContext";

import "./author-with-timestamp.m.css";
import { getTextColor, getSeparator, getTheme } from "../../../utils/utils";
import { ReadTime } from "../ReadTime";

export const AuthorWithTime = ({
  story,
  separator,
  isBottom,
  hideAuthorImage,
  prefix,
  config = {},
  isLightTheme,
  collectionId,
  layout,
  enableDarkModePreview = false,
}) => {
  const configState = useStateValue() || {};
  const isAuthor = get(config, ["showAuthor"], get(configState, ["showAuthor"], true));
  const isTime = get(config, ["showTime"], get(configState, ["showTime"], true));
  const isReadTime = get(configState, ["showReadTime"], true);
  const separatorStyle = separator === "dot" ? "dot" : "dash";
  const theme = getTheme(configState, layout, enableDarkModePreview);
  const textColor = isLightTheme ? "light" : getTextColor(theme);
  const isSeparatorEnabled = isAuthor && (isTime || isReadTime);

  const getTimeStamp = () => {
    return (
      <>
        {isSeparatorEnabled && (
          <div className="arr-separator" styleName={separatorStyle}>
            {getSeparator(separator, textColor)}
          </div>
        )}
        {isTime &&
          (collectionId ? (
            <div id={`publish-time-${collectionId}-${story.id}`}>
              <TimeStamp story={story} config={config} layout={layout} enableDarkModePreview={enableDarkModePreview} />
            </div>
          ) : (
            <TimeStamp story={story} config={config} layout={layout} enableDarkModePreview={enableDarkModePreview} />
          ))}
        {isReadTime && (
          <ReadTime
            story={story}
            opts={{ ...config, showDotIndicator: isTime, separator }}
            isLightTheme={isLightTheme}
            layout={layout}
            enableDarkModePreview={enableDarkModePreview}
          />
        )}
      </>
    );
  };

  return (
    <div className="arr--author-time" styleName="author-time-wrapper">
      {isAuthor ? (
        <>
          <Author
            story={story}
            isBottom
            hideAuthorImage={hideAuthorImage}
            prefix={prefix}
            layout={layout}
            enableDarkModePreview={enableDarkModePreview}
          />
          {getTimeStamp()}
        </>
      ) : (
        getTimeStamp()
      )}
    </div>
  );
};

AuthorWithTime.propTypes = {
  story: PropTypes.object,
  /** Style of separator between the Author & Timestamp */
  separator: PropTypes.oneOf(["dot", "divider"]),
  /** hide the author image */
  hideAuthorImage: PropTypes.bool,
  // fix author and time at the end
  isBottom: PropTypes.bool,
  // fix prefix before the author name
  prefix: PropTypes.string,
  config: PropTypes.object,
  isLightTheme: PropTypes.bool,
  collectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  layout: PropTypes.string,
  enableDarkModePreview: PropTypes.bool,
};

AuthorWithTime.defaultProps = {
  separator: "dot",
  isBottom: false,
  hideAuthorImage: true,
  prefix: "",
  isLightTheme: false,
  layout: "",
};
