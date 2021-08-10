import React from "react";

export const withStoryPageContent = async (Component, subPageType) => {
  const StoryComponent = await getStoryComponent(subPageType);
  const renderStoryPageContent = props => <StoryComponent {...props} />;
  const Comp = props => {
    return <Component renderStoryPageContent={renderStoryPageContent} {...props} />;
  };
  return Comp;
};

export const getStoryComponent = async subPageType => {
  /*
    NOTE: The webpack chunk names are and should be absolute,
    they are consumed by render-layout.js via pattern match on runtime.
  */
  switch (subPageType) {
    default:
      return (
        await import(
          /* webpackChunkName: "text-story-template-chunk" */
          "../components/pages/story"
        )
      ).default;
  }
};
