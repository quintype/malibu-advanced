import React from "react";
import get from "lodash.get";
import { TimeStamp } from "../TimeStamp";
import PropTypes from "prop-types";
import { Author } from "../Author";
import { Dot } from "../Dot/dot";
import { Divider } from "../Divider/";
import { useStateValue } from "../../SharedContext";

import "./author-with-timestamp.m.css";
import { getTextColor } from "../../../utils/utils";
import { ReadTime } from "../ReadTime";

export const AuthorWithTime = ({ story, separator, isBottom, hideAuthorImage, prefix, config = {}, isLightTheme }) => {
  const configState = useStateValue() || {};
  const isAuthor = get(config, ["showAuthor"], get(configState, ["showAuthor"], true));
  const isTime = get(config, ["showTime"], get(configState, ["showTime"], true));
  const isReadTime = get(configState, ["showReadTime"], true);
  const isBottomClasses = isBottom ? "bottom-fix" : "";
  const seperatorStyle = separator === "dot" ? "dot" : "dash";
  const textColor = isLightTheme ? "light" : getTextColor(configState.theme);

  const getSeparator = () => {
    if (separator === "divider") {
      return <Divider color={textColor} />;
    }
    return <Dot color={textColor} />;
  };

  const getTimeStamp = () => {
    if (!isTime) return null;
    return (
      <>
        {isAuthor && (
          <span className="arr-separator" styleName={`${seperatorStyle}`}>
            {getSeparator()}
          </span>
        )}
        <TimeStamp story={story} config={config} />
        {isReadTime && <ReadTime story={story} opts={config} isLightTheme={isLightTheme} />}
      </>
    );
  };

  return (
    <div className="arr--author-time" styleName={`author-time-wrapper ${isBottomClasses}`}>
      {isAuthor ? (
        <>
          <Author story={story} isBottom hideAuthorImage={hideAuthorImage} prefix={prefix} />
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
};

AuthorWithTime.defaultProps = {
  separator: "dot",
  isBottom: false,
  hideAuthorImage: true,
  prefix: "",
  isLightTheme: false,
};
