import React from "react";
import { object, array, shape } from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { StoryGrid } from "../../story-grid";
import { DfpComponent } from "../../ads/dfp-component";

const AuthorPage = props => {
  const stories = props.data.stories.map(({ story }) => story) || [];
  if (!props.data.author.name) {
    return <h1>No author found</h1>;
  }

  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing-page-ads"], {}));

  return (
    <div className="container">
      <h1>{`Author - ${props.data.author.name}`}</h1>
      <StoryGrid stories={stories} />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="author-page-ad"
        path={adConfig.adUnit}
        size={adConfig.sizes}
      />
    </div>
  );
};

AuthorPage.propTypes = {
  data: shape({
    author: object,
    stories: array
  })
};

export { AuthorPage };
