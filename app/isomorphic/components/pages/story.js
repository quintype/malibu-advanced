/* eslint-disable no-unused-vars, no-console, react/jsx-indent-props,react/jsx-wrap-multilines, no-undef, react/jsx-closing-bracket-location */

import React from "react";
import { InfiniteStoryBase, WithPreview } from "@quintype/components";
import { number, object, shape, any } from "prop-types";

import TextStory from "../story-templates/text-story";
import ListicleStory from "../story-templates/listicle-story";
import PhotoStory from "../story-templates/photo-story";
import LiveBlogStory from "../story-templates/live-blog";
import VideoStory from "../story-templates/video-story";
function StoryPageBase({ index, story, otherProp }) {
  // Can switch to a different template based story-template, or only show a spoiler if index > 0
  const storyTemplate = story["story-template"];

  switch (storyTemplate) {
    case "text":
      return <TextStory story={story} />;
    case "video":
      return <VideoStory story={story} />;
    case "photo":
      return <PhotoStory story={story} />;
    case "listicle":
      return <ListicleStory story={story} />;
    case "live-blog":
      return <LiveBlogStory story={story} />;
    default:
      return <TextStory story={story} />;
  }
}

StoryPageBase.propTypes = {
  index: number,
  story: object,
  otherProp: any,
};

const FIELDS =
  "id,headline,slug,url,hero-image-s3-key,hero-image-metadata,first-published-at,last-published-at,alternative,published-at,author-name,author-id,sections,authors,story-template,cards";
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
  }),
};

export const StoryPagePreview = WithPreview(StoryPage, (data, story) =>
  Object.assign({}, data, {
    story,
    relatedStories: Array(5).fill(story),
  })
);
