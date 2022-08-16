/* eslint-disable no-case-declarations, no-unused-vars, no-console, react/jsx-indent-props,react/jsx-wrap-multilines, no-undef, react/jsx-closing-bracket-location */
import React from "react";
import { InfiniteStoryBase, WithPreview } from "@quintype/components";
import { number, object, shape, any } from "prop-types";
import { BlankStory } from "../story-templates/blank";
import loadable from "@loadable/component";
function StoryPageBase({ index, story, otherProp }) {
  const storyTemplate = story["story-template"];
  switch (storyTemplate) {
    case "video":
      const VideoStory = loadable(() => import(
        /* webpackChunkName: "video-story-template-chunk" */ `../arrow/components/Rows/StoryTemplates/VideoStoryTemplates`
      ));
      return <VideoStory story={story} />;
    case "live-blog":
      const LiveBlog = loadable(() => import(
        /* webpackChunkName: "live-blog-story-template-chunk" */ `../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates`
      ));
      return <LiveBlog story={story} />;
    case "listicle":
      const ListicleStory = loadable(() => import(
        /* webpackChunkName: "listicle-story-template-chunk" */ `../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates`
      ));
      return <ListicleStory story={story} />;
    case "text":
      const TextStory = loadable(() => import(
        /* webpackChunkName: "text-story-template-chunk" */ `../arrow/components/Rows/StoryTemplates/TextStoryTemplates`
      ));
      return <TextStory story={story} />;
    case "photo":
      const PhotoStory = loadable(() => import(
        /* webpackChunkName: "photo-story-template-chunk" */ `../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates`
      ));
      return <PhotoStory story={story} />;
    default:
      return <BlankStory story={story} />;
  }
}

StoryPageBase.propTypes = {
  index: number,
  story: object,
  otherProp: any,
};

const FIELDS =
  "id,headline,slug,url,hero-image-s3-key,hero-image-metadata,first-published-at,last-published-at,alternative,published-at,author-name,author-id,sections,story-template,cards";
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
