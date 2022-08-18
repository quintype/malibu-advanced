import * as React from "react";
import { mount } from "enzyme";
import expect from "expect";
import { generateStory } from "../../Fixture/index";
import { PublishDetails } from "./index";

const story = generateStory();

describe("default author card", () => {
  it("Should render default publish details componen", () => {
    const wrapper = mount(<PublishDetails story={story} />);
    expect(wrapper.find({ "data-test-id": "timeStamp" }).prop("className")).toMatch(/timeStamp/);
  });
  it("Should render without updated time", () => {
    const wrapper = mount(<PublishDetails story={story} opts={{ enableUpdatedTime: false }} />);
    expect(wrapper.find({ "data-test-id": "update-details" }).length).toEqual(0);
  });
  it("Should render without read time", () => {
    const wrapper = mount(<PublishDetails story={story} opts={{ showReadTime: false }} />);
    expect(wrapper.find({ "data-test-id": "read-time" }).length).toEqual(0);
  });
});
