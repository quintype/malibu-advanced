import React from "react";
import PropTypes from "prop-types";

import { StoryGrid } from "../story-grid";
import { DfpComponent } from "../ads/dfp-component";

const SearchPage = props => (
  <div className="container">
    <h1>
      Search - {props.data.query} ({props.data.total} results)
    </h1>
    <StoryGrid stories={props.data.stories} />
    <DfpComponent
      adStyleName="ad-slot-size-300x250"
      id="banner-ad-1"
      path="/6355419/Travel/Europe/France/Paris"
      size={[300, 250]}
    />
  </div>
);

SearchPage.propTypes = {
  data: PropTypes.object
};

export { SearchPage };
