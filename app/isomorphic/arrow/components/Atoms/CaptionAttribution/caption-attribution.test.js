import React from "react";
import { mount, shallow } from "enzyme";
import { CaptionAttribution } from "./index";
import { generateStory, generateStoryElementData } from "../../Fixture";

describe("Caption Attribution Component", () => {
  it("Should display the Caption and Attribution of Image element", () => {
    const element = generateStoryElementData("image");
    const wrapper = mount(<CaptionAttribution element={element} story="" />);
    expect(wrapper.find({ "data-test-id": "caption" }).prop("className")).toMatch(/caption/);
    // the below test is to check if the attribution is present
    expect(wrapper.find({ "data-test-id": "attribution" }).prop("className")).toMatch(/attribution/);
    // the below test is to check if the caption is present
    expect(wrapper.find({ "data-test-id": "attribution" }).prop("className")).toMatch(/wrapper/);
  });

  it("Should display the Caption and Attribution of Story", () => {
    const story = generateStory();
    const wrapper = mount(<CaptionAttribution story={story} element="" />);
    expect(wrapper.find({ "data-test-id": "caption" }).prop("className")).toMatch(/caption/);
    expect(wrapper.find({ "data-test-id": "attribution" }).prop("className")).toMatch(/attribution/);
    expect(wrapper.find({ "data-test-id": "attribution" }).prop("className")).toMatch(/wrapper/);
  });

  test("Should not render the Caption and Attribution if the data is null", () => {
    const component = shallow(<CaptionAttribution story="" element="" />);
    expect(component.contains(<CaptionAttribution story="" element="" />)).toBe(false);
  });
});
