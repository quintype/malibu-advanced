import React, { useState } from "react";
import { object, shape } from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash/get";
import { AuthorIntroductionCard, ThreeColGrid } from "@quintype/arrow";

import { DfpComponent } from "../../ads/dfp-component";
// import { LoadMoreHoc } from "../../hoc-wrappers";

import "./author.m.css";

export const AuthorPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  if (!props.data.author.id) {
    return (
      <div className="container">
        <h1 styleName="not-found">Author not found!</h1>{" "}
      </div>
    );
  }
  console.log("props---------------", props);
  const authorCollection = get(props, ["data", "authorCollection"], {});
  const [storiesToRender] = useState(8);
  // const [stories, setStories] = useState(props.data.stories);

  // const collection = {
  //   items: stories.slice(0, storiesToRender)
  // };
  // const arrowThreeColGridWithLoadMore = (
  //   <LoadMoreHoc Component={<ArrowThreeColGrid collection={props.data.authorCollection} />} defaultLoadCount={3} />
  // );
  const authorIntrCardConfig = {
    enableBio: true,
    enableSocialLinks: true
  };

  const getMoreStories = async (offset, limit) => {
    // await getLoadMoreStories({
    //   offset: offset,
    //   limit: limit,
    //   isSearchPage: false,
    //   slug: props.data.query,
    //   setStories: setStories,
    //   storiesToRender: storiesToRender,
    //   setStoriesToRender: setStoriesToRender,
    //   stories: stories
    // });
  };
  return (
    <div className="container" styleName="wrapper">
      <AuthorIntroductionCard data={props.data.author} config={authorIntrCardConfig} />
      {/* {arrowThreeColGridWithLoadMore} */}
      <ThreeColGrid
        collection={props.data.authorCollection}
        isLoadMoreVisible={authorCollection["total-count"] > storiesToRender}
        getMoreStories={getMoreStories}
      />
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
