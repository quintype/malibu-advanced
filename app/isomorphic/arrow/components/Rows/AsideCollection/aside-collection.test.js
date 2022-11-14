import React from "react";
import { mount, shallow } from "enzyme";
import AsideCollection from ".";
import { generateCollection, generateStore, generateStory } from "../../Fixture";
import { Provider } from "react-redux";

const collection = generateCollection();
const story = generateStory();
const stories = [story, story, story];

describe("Aside collection component", () => {
  it("Should render default template with collection", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AsideCollection data={collection} />
        );
      </Provider>
    );
    expect(wrapper.find(AsideCollection)).toHaveLength(1);
  });
  it("Should render template with array of stories", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AsideCollection data={stories} />
        );
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "aside-collection" }).prop("className")).toMatch(/aside-collection/);
  });
  it("Should render `no stories message` if there are no stories", () => {
    const wrapper = shallow(<AsideCollection />);
    expect(wrapper.find(AsideCollection)).toHaveLength(0);
  });
});
