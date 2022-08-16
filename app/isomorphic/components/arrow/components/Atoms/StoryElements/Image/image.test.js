import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { Image } from ".";
import { generateStoryElementData, generateStore } from "../../../Fixture";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";
const element = generateStoryElementData("image");

describe("Image Story Element", () => {
  it("should render with correct elements", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <Image element={element} />
      </Provider>
    );
    expect(wrapper.find("figure").length).toEqual(1);
    expect(wrapper.find("CaptionAttribution").length).toEqual(1);
    expect(wrapper.find(FullScreenImages).length).toEqual(1);
  });
});
