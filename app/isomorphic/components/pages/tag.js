import { get } from "lodash";
import React from "react";
import PropTypes from "prop-types";

import { StoryGrid } from "../story-grid";
import { DfpComponent } from "../ads/dfp-component";

const TagPage = props => (
  <div className="container">
    <h1>{get(props, "data.tag.name") || "Tag Page"}</h1>
    <StoryGrid stories={props.data.stories} />
    <DfpComponent
      adStyleName="ad-slot-size-300x250"
      id="banner-ad-1"
      path="/6355419/Travel/Europe/France/Paris"
      size={[300, 250]}
    />
  </div>
);

export { TagPage };
TagPage.propTypes = {
  data: PropTypes.object
};
