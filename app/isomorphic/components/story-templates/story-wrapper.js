import React, { useState, useEffect } from "react";
import { loadRelatedStories } from "../../../api/utils";
import { TextStory, LiveBlogStory, ListicleStory, PhotoStory, VideoStory } from "./index";
import { AdPlaceholder } from "../../arrow/components/Atoms/AdPlaceholder";
import { object } from "prop-types";

function StoryWrapper({ story, config }) {
  const [relatedStories, setRelatedStories] = useState([]);
  const storyTemplate = story["story-template"];

  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };

  const templateConfig = {
    asideCollection: {
      data: relatedStories,
      slotData: [
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
        showReadTime: true,
        showSection: true,
      },
    },
  };

  useEffect(() => {
    loadRelatedStories(story, config).then((relatedStories) => setRelatedStories(relatedStories));
  }, []);

  // Can switch to a different template based story-template, or only show a spoiler if index > 0
  switch (storyTemplate) {
    case "text":
      return (
        <TextStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
    case "video":
      return (
        <VideoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
    case "photo":
      return (
        <PhotoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
    case "listicle":
      return (
        <ListicleStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
    case "live-blog":
      return (
        <LiveBlogStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
    default:
      return (
        <TextStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
        />
      );
  }
}

StoryWrapper.propTypes = {
  story: object,
  config: object,
};

export default React.memo(StoryWrapper);
