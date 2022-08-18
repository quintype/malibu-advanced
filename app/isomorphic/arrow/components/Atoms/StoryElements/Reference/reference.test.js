import React from "react";
import { mount, shallow } from "enzyme";
import { Provider } from "react-redux";
import { Reference } from ".";
import { generateStoryElementData, generateStore } from "../../../Fixture";

const element = generateStoryElementData("references");

describe("Reference element", () => {
  it("Should render default template of the reference element", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <Reference element={element} />;
      </Provider>
    );
    expect(wrapper.find(Reference)).toHaveLength(1);
  });

  it("Should render headline if it is enabled", () => {
    const wrapper = shallow(<Reference element={element} opts={{ hideHeadline: true }} />);
    expect(wrapper.find({ "data-test-id": "ref-headline" }).length).toEqual(0);
  });

  it("Should not render headline if it is disabled", () => {
    const wrapper = shallow(<Reference element={element} opts={{ hideHeadline: false }} />);
    expect(wrapper.find({ "data-test-id": "ref-headline" }).length).toEqual(0);
  });
});
