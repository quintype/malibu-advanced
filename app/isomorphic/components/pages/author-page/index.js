import React from "react";
import { object, array, shape } from "prop-types";

import { StoryGrid } from "../../story-grid";
import { DfpComponent } from "../../ads/dfp-component";

const AuthorPage = props => {
  const stories = props.data.stories.map(({ story }) => story) || [];
  if (!props.data.author.name) {
    return <h1>No author found</h1>;
  }
  return (
    <div className="container">
      <h1>{`Author - ${props.data.author.name}`}</h1>
      <StoryGrid stories={stories} />
      <DfpComponent
        adType="ad-slot-size-300x250"
        id="banner-ad-1"
        path="/6355419/Travel/Europe/France/Paris"
        size={[300, 250]}
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
