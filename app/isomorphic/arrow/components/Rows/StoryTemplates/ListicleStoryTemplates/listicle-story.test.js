import * as React from "react";
import { shallow } from "enzyme";
import { generateStory } from "../../../Fixture";
import ListicleStoryTemplate from "./index";
import { mockIntersectionObserver } from "../../../../utils/testing-utils";

const story = generateStory("listicle-story");

const storyElementsConfig = {
  summary: {},
  blurb: {},
  blockquote: {},
  quote: {},
  "also-read": {},
  "q-and-a": {},
  question: {},
  answer: {},
  references: {},
};

beforeEach(() => {
  mockIntersectionObserver();
});

describe("Listicle Story Templates", () => {
  it("Should render listicle story template with section tag", () => {
    const templateConfig = {
      templateType: "default",
      showSection: true,
    };
    const wrapper = shallow(
      <ListicleStoryTemplate story={story} config={templateConfig} storyElementsConfig={storyElementsConfig} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("Should render listicle story template without section tag", () => {
    const templateConfig = {
      templateType: "default",
      showSection: false,
    };
    const wrapper = shallow(
      <ListicleStoryTemplate story={story} config={templateConfig} storyElementsConfig={storyElementsConfig} />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
