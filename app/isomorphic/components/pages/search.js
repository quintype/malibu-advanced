import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";
import { OneColStoryList } from "@quintype/arrow";
import fetch from "node-fetch";

import { DfpComponent } from "../ads/dfp-component";

const SearchPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  const [storiesToRender, setStoriesToRender] = useState(8);
  const [stories, setStories] = useState(props.data.stories);

  const collection = {
    items: stories.slice(0, storiesToRender)
  };

  const getMoreStories = async (offset, limit) => {
    const { results } = await (
      await fetch(`/api/v1/search?q=${props.data.query}&offset=${offset}&limit=${limit + 1}`)
    ).json();
    const loadMoreStories = results.stories.map(story => {
      return { type: "story", story: story };
    });
    setStories(stories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + offset);
  };

  return (
    <div className="container">
      <h1>
        Search - {props.data.query} ({props.data.total} results)
      </h1>
      <OneColStoryList
        collection={collection}
        config={{ buttonText: "Load More", footerButton: "SubsequentLoadCount" }}
        isLoadMoreVisible={stories.length > storiesToRender}
        getMoreStories={getMoreStories}
      />
      {/* <StoryGrid stories={props.data.stories} /> */}
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
