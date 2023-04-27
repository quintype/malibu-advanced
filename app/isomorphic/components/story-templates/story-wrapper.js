import React, { useState, useEffect } from "react";
import { loadRelatedStories } from "../../../api/utils";
import { TextStory, LiveBlogStory, ListicleStory, PhotoStory, VideoStory } from "./index";
import { AdPlaceholder } from "../../arrow/components/Atoms/AdPlaceholder";
import { object, func } from "prop-types";

function StoryWrapper({ story, config, initAccessType, checkAccess }) {
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
    templateType: "default",
    showSection: true,
    publishedDetails: {
      enablePublishedTime: true,
      enableUpdatedTime: true,
      showReadTime: true,
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
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
    case "video":
      return (
        <VideoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
    case "photo":
      return (
        <PhotoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
    case "listicle":
      return (
        <ListicleStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
    case "live-blog":
      return (
        <LiveBlogStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
    default:
      return (
        <TextStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          initAccessType={initAccessType}
          checkAccess={checkAccess}
        />
      );
  }
}

StoryWrapper.propTypes = {
  story: object,
  config: object,
  initAccessType: func,
  checkAccess: func,
};

export default React.memo(StoryWrapper);
