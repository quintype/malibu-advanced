import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { ImageGallery } from ".";
import { generateStoryElementData, generateStore } from "../../../Fixture";
import { FullScreenImages } from "../../../Molecules/FullScreenImages";

const element = generateStoryElementData("image-gallery");

describe("Image Gallery Story Element", () => {
  it("should render with correct elements", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <ImageGallery element={element} />
      </Provider>
    );
    expect(wrapper.find(FullScreenImages).length).toEqual(1);
  });
});
