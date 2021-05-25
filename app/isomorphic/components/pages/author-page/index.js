import React, { useState } from "react";
import { object, shape } from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash/get";
import { AuthorIntroductionCard, ThreeColGrid } from "@quintype/arrow";
import { getLoadMoreStories } from "../../utils";

import { DfpComponent } from "../../ads/dfp-component";

import "./author.m.css";

export const AuthorPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  if (!props.data.author.id) {
    return (
      <div className="container">
        <h1 styleName="text-info">Author not found!</h1>
      </div>
    );
  }

  const authorCollection = get(props, ["data", "authorCollection"], {});
  const [storiesToRender, setStoriesToRender] = useState(4);
  const authorCollectionStories = {
    items: authorCollection.items.slice(0, storiesToRender)
  };
  const [authorPageStories, setStories] = useState(authorCollectionStories.items);
  const authorIntrCardConfig = {
    enableBio: true,
    enableSocialLinks: true
  };

  const getMoreStories = async () => {
    await getLoadMoreStories({
      offset: 4,
      limit: 4,
      authorId: props.data.author.id,
      slug: props.data.query,
      setStories: setStories,
      storiesToRender: storiesToRender,
      setStoriesToRender: setStoriesToRender,
      stories: authorPageStories
    });
  };

  return (
    <div className="container" styleName="wrapper">
      <AuthorIntroductionCard data={props.data.author} config={authorIntrCardConfig} />
      {authorCollectionStories.items.length > 0 ? (
        <ThreeColGrid
          collection={authorCollectionStories}
          config={{ buttonText: "Load More", footerButton: "SubsequentLoadCount" }}
          isLoadMoreVisible={authorCollection["total-count"] > storiesToRender}
          getMoreStories={getMoreStories}
        />
      ) : (
        <h1 styleName="text-info">No stories found!</h1>
      )}
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="author-page-ad"
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
      />
    </div>
  );
};

AuthorPage.propTypes = {
  data: shape({
    author: object,
    authorCollection: object
  })
};
