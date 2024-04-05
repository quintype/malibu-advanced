import * as React from "react";
import { mount } from "enzyme";
import { generateStory, generateCollection, generateStore } from "../../../Fixture";
import PhotoStory from "./index";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { Provider } from "react-redux";
import { mockIntersectionObserver } from "../../../../utils/testing-utils";

const story = generateStory("photo-story");
const collection = generateCollection({ stories: 4 });
const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

const child = <div>children</div>;

const storyElementsConfig = {
  summary: {},
  blurb: {},
  blockquote: {},
  quote: {},
  "also-read": {},
  "q-and-a": {},
  question: {},
  answer: {},
};

const templateConfig = {
  theme: "#ffffff",
  noOfVisibleCards: -1,
  publishedDetails: {
    enablePublishedTime: true,
    enableUpdatedTime: false,
    showReadTime: true,
  },
  asideCollection: {
    data: collection,
    config: {
      collectionNameBorderColor: "#3a9fdd",
      title: "Trending",
      theme: "#ffffff",
      adSlot: [{ type: "ad", component: configurableSlot }],
    },
  },
};

beforeEach(() => {
  mockIntersectionObserver();
});

describe("photo Story Templates", () => {
  it("Should render photo story template with image full-bleed", () => {
    const config = Object.assign({ imageRender: "fullBleed" }, templateConfig);
    const wrapper = mount(
      <Provider store={generateStore}>
        <PhotoStory
          story={story}
          config={config}
          storyElementsConfig={storyElementsConfig}
          firstChild={child}
          secondChild={child}
          adComponent={configurableSlot}
          widgetComp={configurableSlot}
        />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "hero-image" }).prop("className")).toMatch(/grid-col-full/);
  });
  it("Should render photo story template with image with in container", () => {
    const config = Object.assign({ imageRender: "container" }, templateConfig);
    const wrapper = mount(
      <Provider store={generateStore}>
        <PhotoStory
          story={story}
          config={config}
          storyElementsConfig={storyElementsConfig}
          firstChild={child}
          secondChild={child}
          adComponent={configurableSlot}
          widgetComp={configurableSlot}
        />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "hero-image" }).prop("className")).toMatch(/grid-containe/);
  });

  it("Should render hero priority center align template", () => {
    const config = { ...templateConfig, templateType: "hero-priority-center", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <PhotoStory
          story={story}
          config={config}
          storyElementsConfig={storyElementsConfig}
          firstChild={child}
          secondChild={child}
          adComponent={configurableSlot}
          widgetComp={configurableSlot}
        />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "photo-story-hero-priority-center-container" }).prop("className")).toMatch(
      /hero-priority-center/
    );
  });

  it("Should render hero priority left align template", () => {
    const config = { ...templateConfig, templateType: "default", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <PhotoStory
          story={story}
          config={config}
          storyElementsConfig={storyElementsConfig}
          firstChild={child}
          secondChild={child}
          adComponent={configurableSlot}
          widgetComp={configurableSlot}
        />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "photo-story-default-container" }).prop("className")).toMatch(/default/);
  });

  it("Should render headline priority template", () => {
    const config = { ...templateConfig, templateType: "headline-priority", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <PhotoStory
          story={story}
          config={config}
          storyElementsConfig={storyElementsConfig}
          firstChild={child}
          secondChild={child}
          adComponent={configurableSlot}
          widgetComp={configurableSlot}
        />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "photo-story-headline-priority-container" }).prop("className")).toMatch(
      /headline-priority/
    );
  });
});
