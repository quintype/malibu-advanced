import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { StoryTags } from ".";
import { generateStore, generateStory } from "../../Fixture";

const story = generateStory();

describe("Story Tags", () => {
  it("Should render default template with tags", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <StoryTags tags={story.tags} />;
      </Provider>
    );
    expect(wrapper.find(StoryTags)).toHaveLength(1);
  });
});
