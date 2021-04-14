import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { StoryGrid } from "../story-grid";
import { DfpComponent } from "../ads/dfp-component";

const SearchPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));

  return (
    <div className="container">
      <h1>
        Search - {props.data.query} ({props.data.total} results)
      </h1>
      <StoryGrid stories={props.data.stories} />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="search-page-ad"
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
      />
    </div>
  );
};

SearchPage.propTypes = {
  data: PropTypes.object
};

export { SearchPage };
