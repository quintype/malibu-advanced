import * as React from "react";
import { mount } from "enzyme";
import { generateStory, generateCollection, generateStore } from "../../../Fixture";
import TextStoryTemplate from "./index";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { Provider } from "react-redux";
import { mockIntersectionObserver } from "../../../../utils/testing-utils";

const story = generateStory();
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
  sort: "image-first",
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
  authorDetails: {
    template: "default",
    opts: {
      showBio: false,
      showImage: true,
      showName: true,
    },
  },
};

beforeEach(() => {
  mockIntersectionObserver();
});

describe("Text Story Templates", () => {
  it("Should render text story template with image full-bleed", () => {
    const config = { ...templateConfig, imageRender: "fullBleed" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-default-full-bleed" }).prop("className")).toMatch(/fullBleed/);
  });

  it("Should render text story template with in container image", () => {
    const config = { ...templateConfig, templateType: "hero-priority-center", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-hero-priority-center-container" }).prop("className")).toMatch(
      /container/
    );
  });

  it("Should render hero priority center align template", () => {
    const config = { ...templateConfig, templateType: "hero-priority-center", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-hero-priority-center-container" }).prop("className")).toMatch(
      /hero-priority-center/
    );
    expect(wrapper.find("AsideCollectionCard").length).toEqual(1);
  });

  it("Should render hero priority left align template", () => {
    const config = { ...templateConfig, templateType: "default", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-default-container" }).prop("className")).toMatch(/default/);
    expect(wrapper.find("SideColumn").length).toEqual(1);
  });

  it("Should render headline hero priority template", () => {
    const config = { ...templateConfig, templateType: "headline-hero-priority", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-headline-hero-priority-container" }).prop("className")).toMatch(
      /headline-hero-priority/
    );
    expect(wrapper.find("AsideCollectionCard").length).toEqual(1);
  });

  it("Should render hero vertical priority template", () => {
    const config = { ...templateConfig, templateType: "hero-vertical-priority", imageRender: "container" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-hero-vertical-priority-container" }).prop("className")).toMatch(
      /hero-vertical-priority/
    );
    expect(wrapper.find("AsideCollectionCard").length).toEqual(1);
  });

  it("Should render headline priority template", () => {
    const config = { ...templateConfig, templateType: "headline-priority" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-headline-priority" }).prop("className")).toMatch(
      /headline-priority/
    );
    expect(wrapper.find("SideColumn").length).toEqual(1);
  });

  it("Should render headline overlay priority template", () => {
    const config = { ...templateConfig, templateType: "headline-overlay-priority" };
    const wrapper = mount(
      <Provider store={generateStore}>
        <TextStoryTemplate
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
    expect(wrapper.find({ "data-test-id": "text-story-headline-overlay-priority" }).prop("className")).toMatch(
      /headline-overlay-priority/
    );
    expect(wrapper.find("AsideCollectionCard").length).toEqual(1);
  });
});
