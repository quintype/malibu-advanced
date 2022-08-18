import React from "react";
import { shallow } from "enzyme";
import { Video } from ".";
import { generateStoryElementData } from "../../../Fixture";
import { StoryElement } from "@quintype/components";
const element = generateStoryElementData("youtube-video");

describe("Video Story Element", () => {
  it("should render with correct elements", () => {
    const wrapper = shallow(<Video element={element} />).dive();
    expect(wrapper.find(StoryElement).length).toEqual(1);
  });
});
