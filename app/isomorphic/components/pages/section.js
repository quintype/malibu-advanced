import React, { useEffect } from "react";
import { string, shape, object } from "prop-types";
import get from "lodash/get";
import { collectionToStories, LazyCollection } from "@quintype/components";

import { StoryGrid } from "../story-grid";
import { getCollectionTemplate } from "../get-collection-template";
import { DfpComponent } from "../ads/dfp-component";
// import { useDfpSlot } from "../utils";
// import { useSelector } from "react-redux";

const SectionPage = props => {
  const stories = (props.data.collection.items && collectionToStories(props.data.collection)) || [];
  const childCollections = (get(props, ["data", "collection", "items"]) || []).filter(
    item => item.type === "collection" && item.items.length > 0
  );
  const pageTitle =
    props.pageType === "collection-page"
      ? props.data.collection.name
      : `Section - ${props.data.section["display-name"] || props.data.section.name}`;
  const noStoriesFound =
    props.pageType === "collection-page" ? "No Collection Stories Found" : "No Section Stories Found";
  if (stories.length === 0) {
    return <h1>{noStoriesFound}</h1>;
  }

  // const qtState = useSelector(state => get(state, ["qt"], {}));

  useEffect(() => {
    console.log("foooooooo section");
    if (window.googletag) {
      console.log("foooooooo section inside if");
      const googletag = window.googletag || {};
      googletag.cmd.push(function() {
        googletag.pubads().clear();
      });
    }

    var gads = document.createElement("script");
    var useSSL = document.location.protocol === "https:";
    gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
    var node = document.getElementsByTagName("script")[0];
    gads.setAttribute("async", "");
    node.parentNode.insertBefore(gads, node);

    setTimeout(() => {
      console.log("inside settimeout");
      const googletag = window.googletag || {};
      googletag.cmd = googletag.cmd || [];
      googletag.cmd.push(function() {
        googletag
          .defineSlot(
            "/5463099287/BannerAd",
            [
              [320, 50],
              [728, 90]
            ],
            "banner-foooo"
          )
          .setTargeting("pageType", "section-page")
          .addService(googletag.pubads());
        googletag.enableServices();
      });

      googletag.cmd.push(function() {
        googletag.display("banner-foooo");
      });
      // useDfpSlot({
      //   path: "/5463099287/BannerAd",
      //   size: [
      //     [320, 50],
      //     [728, 90]
      //   ],
      //   id: "banner-foooo",
      //   qtState: qtState
      // });
    }, 5000);
  }, []);

  return (
    <div className="container">
      <h1>{pageTitle}</h1>
      <StoryGrid stories={stories} />
      <DfpComponent
        adType="res-ad-slot-size-300x250"
        id="banner-foooo"
        path="/5463099287/BannerAd"
        size={[
          [320, 50],
          [728, 90]
        ]}
      />
      <LazyCollection collection={{ items: childCollections }} collectionTemplates={getCollectionTemplate} />
    </div>
  );
};

SectionPage.propTypes = {
  pageType: string,
  data: shape({
    collection: object,
    section: string
  })
};

export { SectionPage };
