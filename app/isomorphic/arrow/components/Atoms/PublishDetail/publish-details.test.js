import * as React from "react";
import { mount } from "enzyme";
import expect from "expect";
import { generateStory, generateStore } from "../../Fixture/index";
import { PublishDetails } from "./index";
import { Provider } from "react-redux";

const story = generateStory();

describe("default author card", () => {
  it("Should render default publish details componen", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <PublishDetails story={story} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "timeStamp" }).prop("className")).toMatch(/timeStamp/);
  });
  it("Should render without updated time", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <PublishDetails story={story} opts={{ enableUpdatedTime: false }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "update-details" }).length).toEqual(0);
  });
  it("Should render without read time", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <PublishDetails story={story} opts={{ showReadTime: false }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "read-time" }).length).toEqual(0);
  });
});
