/* eslint-disable no-unused-vars, no-console, react/jsx-indent-props,react/jsx-wrap-multilines, no-undef, react/jsx-closing-bracket-location */

import React from "react";
import loadable from "@loadable/component"
import { InfiniteStoryBase, WithPreview } from "@quintype/components";
import { number, object, shape, any } from "prop-types";
import BlankStory from "../story-templates/blank";
import TextStory from "../story-templates/text-story";

const templateConfig = {
  templateType: "default",
  imageRender: "fullBleed",
  sort: "headline-first"
};

  const lazyLoadComponent = (storyTemplate) => {
    return loadable(() => import(`../story-templates/${storyTemplate}-story`));
  }
  function StoryPageBase({ index, story, otherProp }) {
    const storyTemplate = story["story-template"];

    switch(storyTemplate) {
      case "text":
        const TextComponent = lazyLoadComponent(storyTemplate);
        return <TextComponent story={story} templateConfig={templateConfig} />

      case "photo":
        const PhotoComponent = lazyLoadComponent(storyTemplate);
        return <PhotoComponent story={story} templateConfig={templateConfig} />

      case "listicle":
        const ListicleComponent = lazyLoadComponent(storyTemplate);
        return <ListicleComponent story={story} templateConfig={templateConfig} />

      case "video":
        const VideoComponent = lazyLoadComponent(storyTemplate);
        return <VideoComponent story={story} templateConfig={templateConfig} />

      case "live-blog":
        const LiveBlogComponent = lazyLoadComponent(storyTemplate);
        return <LiveBlogComponent story={story} templateConfig={templateConfig} />

      default:
        return <BlankStory story={story} />;
    }
}

StoryPageBase.propTypes = {
  index: number,
  story: object,
  otherProp: any
};

const FIELDS =
  "id,headline,slug,url,hero-image-s3-key,hero-image-metadata,first-published-at,last-published-at,alternative,published-at,author-name,author-id,sections,story-template,cards";
function storyPageLoadItems(pageNumber) {
  return global
    .wretch("/api/v1/stories")
    .query({
      fields: FIELDS,
      limit: 5,
      offset: 5 * pageNumber
    })
    .get()
    .json(response => response.stories.map(story => ({ story, otherProp: "value" })));
}

export function StoryPage(props) {
  return (
    <InfiniteStoryBase
      {...props}
      render={StoryPageBase}
      loadItems={storyPageLoadItems}
      onInitialItemFocus={item =>
        app.registerPageView({ pageType: "story-page", data: { story: item.story } }, `/${item.story.slug}`)
      }
      onItemFocus={item => console.log(`Story In View: ${item.story.headline}`)}
    />
  );
}

StoryPage.propTypes = {
  data: shape({
    story: object
  })
};

export const StoryPagePreview = WithPreview(StoryPage, (data, story) =>
  Object.assign({}, data, {
    story,
    relatedStories: Array(5).fill(story)
  })
);
