/* eslint-disable no-unused-vars, no-console, react/jsx-indent-props,react/jsx-wrap-multilines, no-undef, react/jsx-closing-bracket-location */

import React, { useEffect } from "react";
import { AccessType, InfiniteStoryBase, WithPreview } from "@quintype/components";
import { object, shape } from "prop-types";

import StoryWrapper from "../story-templates/story-wrapper";
import { useSelector } from "react-redux";
import get from "lodash/get";

function StoryPageBaseWithAccesstype({ story, config }) {
  const member = useSelector((state) => get(state, ["member"], null));
  const email = get(member, ["email"], "abc@email.com");
  const phone = get(member, ["metadata", "phone-number"], "1234");
  const { key, accessTypeBkIntegrationId } = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
  );

  return (
    <AccessType
      enableAccesstype={true}
      isStaging={true}
      accessTypeKey={key}
      email={email}
      phone={phone}
      accessTypeBkIntegrationId={accessTypeBkIntegrationId}
    >
      {({ initAccessType, checkAccess }) => (
        <StoryWrapper story={story} config={config} initAccessType={initAccessType} checkAccess={checkAccess} />
      )}
    </AccessType>
  );
}

StoryPageBaseWithAccesstype.propTypes = {
  story: object,
  config: object,
};
function StoryPageBase({ story, config }) {
  return <StoryPageBaseWithAccesstype story={story} config={config} />;
}

StoryPageBase.propTypes = {
  story: object,
  config: object,
};

const FIELDS =
  "id,headline,slug,url,hero-image-s3-key,hero-image-metadata,first-published-at,last-published-at,alternative,published-at,author-name,author-id,sections,authors,story-template,cards,access";
function storyPageLoadItems(pageNumber) {
  return global
    .wretch("/api/v1/stories")
    .query({
      fields: FIELDS,
      limit: 5,
      offset: 5 * pageNumber,
    })
    .get()
    .json((response) => response.stories.map((story) => ({ story, otherProp: "value" })));
}

export function StoryPage(props) {
  return (
    <div className="container">
      <InfiniteStoryBase
        {...props}
        render={StoryPageBase}
        loadItems={storyPageLoadItems}
        onInitialItemFocus={(item) =>
          app.registerPageView({ pageType: "story-page", data: { story: item.story } }, `/${item.story.slug}`)
        }
        onItemFocus={(item) => console.log(`Story In View: ${item.story.headline}`)}
      />
    </div>
  );
}

StoryPage.propTypes = {
  data: shape({
    story: object,
    config: object,
  }),
};

export const StoryPagePreview = WithPreview(StoryPage, (data, story) =>
  Object.assign({}, data, {
    story,
    relatedStories: Array(5).fill(story),
  })
);
