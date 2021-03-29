import { get } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { StoryGrid } from "../story-grid";
import { DfpComponent } from "../ads/dfp-component";

const TagPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing-page-ads"], {}));

  return (
    <div className="container">
      <h1>{get(props, "data.tag.name") || "Tag Page"}</h1>
      <StoryGrid stories={props.data.stories} />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="tag-page-ad"
        path={adConfig.adUnit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.viewPortSizeMapping}
      />
    </div>
  );
};

export { TagPage };
TagPage.propTypes = {
  data: PropTypes.object
};
