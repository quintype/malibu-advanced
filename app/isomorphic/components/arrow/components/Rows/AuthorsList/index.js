import React from "react";
import { Link } from "@quintype/components";
import PropTypes from "prop-types";
import { getTextColor } from "../../../utils/utils";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import AuthorIntroductionCard from "../AuthorIntroductionCard";
import { StateProvider } from "../../SharedContext";
import "./authors-list.m.css";
import { useSelector } from "react-redux";
import get from "lodash.get";

const AuthorsList = ({ data = [], config = {}, getMoreData, hideLoadmore = false, limit }) => {
  if (data.length < 1) return null;
  const { theme } = config;
  const textColor = getTextColor(theme);
  const mountAt = config.mountAt || "";
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  return (
    <div
      data-test-id="authors-list"
      className="full-width-with-padding arrow-component arr--authors-list"
      style={{ background: theme, color: textColor }}>
      <div styleName="wrapper">
        {data.slice(0, limit).map((author, index) => (
          <Link
            href={`${mountAt}/author/` + author.slug}
            key={`author-list-${index}`}
            styleName="linkWrapper"
            aria-label="author">
            <AuthorIntroductionCard data={author} config={config} template="smallCircle" />
          </Link>
        ))}
      </div>
      {!hideLoadmore && (
        <LoadmoreButton onClick={getMoreData} template="SubsequentLoadCount" config={config} qtConfig={qtConfig} />
      )}
    </div>
  );
};

AuthorsList.propTypes = {
  data: PropTypes.array,
  config: PropTypes.shape({ enableBio: PropTypes.bool, theme: PropTypes.string }),
  getMoreData: PropTypes.object.isRequired,
  limit: PropTypes.number,
  hideLoadmore: PropTypes.bool
};

export default StateProvider(AuthorsList);
