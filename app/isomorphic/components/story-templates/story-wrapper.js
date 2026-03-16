import React, { useState, useEffect } from "react";
import { loadRelatedStories } from "../../../api/utils";
import { TextStory, LiveBlogStory, ListicleStory, PhotoStory, VideoStory } from "./index";
import { AdPlaceholder } from "@quintype/arrow";
import { MetypeCommentsWidget } from "../Metype/commenting-widget";
import { useSelector } from "react-redux";
import get from "lodash/get";
import { object, func } from "prop-types";

function StoryWrapper({ isATGlobal, story, config, initAccessType, checkAccess }) {
  const [hasAccess, setHasAccess] = useState(true);
  const [relatedStories, setRelatedStories] = useState([]);
  const storyTemplate = story["story-template"];
  const metypeConfig = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "metypeConfig"], {})
  );

  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };

  const metypeElement =
    metypeConfig.metypeAccountId && metypeConfig.metypeHost ? (
      <MetypeCommentsWidget
        host={metypeConfig.metypeHost}
        accountId={String(metypeConfig.metypeAccountId)}
        storyId={story.id}
        pageURL={story.url}
      />
    ) : null;

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
        showReadTime: true,
        showSection: true,
      },
    },
    templateType: "default",
    showSection: true,
    noOfVisibleCards: -1,
    publishedDetails: {
      enablePublishedTime: true,
      enableUpdatedTime: true,
      showReadTime: true,
    },
  };

  useEffect(() => {
    loadRelatedStories(story, config).then((relatedStories) => setRelatedStories(relatedStories));
  }, []);

  useEffect(() => {
    if (isATGlobal && initAccessType) {
      initAccessType(() => {
        checkAccess(story.id).then((res) => {
          const { granted } = res[story.id];
          setHasAccess(granted);
        });
      });
    }
  }, [isATGlobal]);

  // Can switch to a different template based story-template, or only show a spoiler if index > 0
  switch (storyTemplate) {
    case "text":
      return (
        <TextStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
    case "video":
      return (
        <VideoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
    case "photo":
      return (
        <PhotoStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
    case "listicle":
      return (
        <ListicleStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
    case "live-blog":
      return (
        <LiveBlogStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
    default:
      return (
        <TextStory
          story={story}
          config={{ ...config, ...templateConfig }}
          adWidget={adWidget}
          secondChild={metypeElement || <AdPlaceholder height="250px" width="300px" />}
          adPlaceholder={<AdPlaceholder height="250px" width="300px" />}
          hasAccess={hasAccess}
        />
      );
  }
}

StoryWrapper.propTypes = {
  isATGlobal: func,
  story: object,
  config: object,
  initAccessType: func,
  checkAccess: func,
};

export default React.memo(StoryWrapper);
