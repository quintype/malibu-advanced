import { get } from "lodash";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { OneColStoryList } from "@quintype/arrow";
import fetch from "node-fetch";

import { DfpComponent } from "../ads/dfp-component";

const TagPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  const [storiesToRender, setStoriesToRender] = useState(8);
  const [tagPageStories, setStories] = useState(props.data.stories);

  const collection = {
    items: tagPageStories.slice(0, storiesToRender)
  };

  const getMoreStories = async (offset, limit) => {
    const { stories } = await (
      await fetch(`/api/v1//stories?tag-slugs=${props.data.tag.slug}&offset=${offset}&limit=${limit + 1}`)
    ).json();
    const loadMoreStories = stories.map(story => {
      return { type: "story", story: story };
    });
    setStories(tagPageStories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + offset);
  };

  return (
    <div className="container">
      <h1>{get(props, "data.tag.name") || "Tag Page"}</h1>
      <OneColStoryList
        collection={collection}
        config={{ buttonText: "Load More", footerButton: "SubsequentLoadCount" }}
        isLoadMoreVisible={tagPageStories.length > storiesToRender}
        getMoreStories={getMoreStories}
      />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="tag-page-ad"
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
      />
    </div>
  );
};

export { TagPage };
TagPage.propTypes = {
  data: PropTypes.object
};
