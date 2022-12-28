import React, { useState, useEffect } from "react";
import { loadRelatedStories } from "../../../api/utils";
import { TextStory, LiveBlogStory, ListicleStory, PhotoStory, VideoStory } from "./index";

function StoryWrapper({ story, config }) {
  const [relatedStories, setRelatedStories] = useState([]);
  const storyTemplate = story["story-template"];

  const templateConfig = {
    asideCollection: {
      data: relatedStories,
      slots: [
        {
          type: "ad",
        },
        {
          type: "collection",
        },
        {
          type: "ad",
        },
      ],
      config: {
        collectionNameBorderColor: "#3a9fdd",
        title: "Aside Collection Title",
        showAuthor: true,
        showTime: true,
      },
    },
  };

  useEffect(() => {
    loadRelatedStories(story, config).then((relatedStories) => setRelatedStories(relatedStories));
  }, []);

  // Can switch to a different template based story-template, or only show a spoiler if index > 0
  switch (storyTemplate) {
    case "text":
      return <TextStory story={story} config={{ ...config, ...templateConfig }} />;
    case "video":
      return <VideoStory story={story} config={{ ...config, ...templateConfig }} />;
    case "photo":
      return <PhotoStory story={story} config={{ ...config, ...templateConfig }} />;
    case "listicle":
      return <ListicleStory story={story} config={{ ...config, ...templateConfig }} />;
    case "live-blog":
      return <LiveBlogStory story={story} config={{ ...config, ...templateConfig }} />;
    default:
      return <TextStory story={story} config={{ ...config, ...templateConfig }} />;
  }
}
export default React.memo(StoryWrapper);
