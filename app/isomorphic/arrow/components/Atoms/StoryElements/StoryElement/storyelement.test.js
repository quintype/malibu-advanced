import React from "react";
import { shallow } from "enzyme";
import { StoryElement } from ".";
import { generateStoryElementData } from "../../../Fixture";
import { StoryElement as QTCStoryElement } from "@quintype/components";
const element = generateStoryElementData("jsembed");

describe("Story Element", () => {
  it("should render with correct elements", () => {
    const wrapper = shallow(<StoryElement element={element} />).dive();
    expect(wrapper.find(QTCStoryElement).length).toEqual(1);
  });
});
