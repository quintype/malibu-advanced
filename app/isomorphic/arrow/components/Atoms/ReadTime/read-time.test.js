import * as React from "react";
import { mount } from "enzyme";
import expect from "expect";
import { generateStore, generateStory } from "../../Fixture/index";
import { ReadTime } from "./index";
import { Provider } from "react-redux";

const story = generateStory();

describe("Read time", () => {
  it("Should render read time component", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <ReadTime story={story} opts={{ showReadTime: true }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "read-time" }).prop("className")).toMatch(/read-time-wrapper/);
  });
  it("Should not render read time if showReadTime is false", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <ReadTime opts={{ showReadTime: false, isLocalizedNumber: true }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "read-time" }).length).toEqual(0);
  });
});
