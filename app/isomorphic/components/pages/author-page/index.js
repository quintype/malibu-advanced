import React from "react";
import { object, shape } from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash/get";
import { AuthorIntroductionCard } from "@quintype/arrow";
import { ArrowThreeColGrid } from "../../collection-templates/arrow-rows";
import { DfpComponent } from "../../ads/dfp-component";
// import { LoadMoreHoc } from "../../hoc-wrappers";

export const AuthorPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  // const arrowThreeColGridWithLoadMore = (
  //   <LoadMoreHoc Component={<ArrowThreeColGrid collection={props.data.authorCollection} />} defaultLoadCount={3} />
  // );
  const authorIntrCardConfig = {
    enableBio: true,
    enableSocialLinks: true
  };
  return (
    <div className="container">
      <AuthorIntroductionCard data={props.data.author} config={authorIntrCardConfig} />
      {/* {arrowThreeColGridWithLoadMore} */}
      <ArrowThreeColGrid collection={props.data.authorCollection} />
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
