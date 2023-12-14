/* eslint-disable react/prop-types */
import * as React from "react";
import { shallow } from "enzyme";
import { withElementWrapper } from "./withElementWrapper";

describe("Story Element Wrapper", () => {
  const element = {
    description: "",
    type: "text",
    metadata: {},
    text: "<p>Coronavirus in India News Live Updates</p>"
  };
  const StoryElement = ({ element }) => <div dangerouslySetInnerHTML={{ __html: element.text }} />;
  const Component = withElementWrapper(StoryElement);

  it("should return null if element not present", () => {
    const wrapper = shallow(<Component />);
    expect(wrapper.html()).toBe(null);
  });

  it("should call render if it's present and is a function", () => {
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(<Component element={element} render={customTemplate} />);
    expect(wrapper.html()).toBe("<h3><p>Coronavirus in India News Live Updates</p></h3>");
  });

  it("should return the component passed if element is present and render is not valid", () => {
    const wrapper = shallow(<Component element={element} />);
    expect(wrapper.html()).toBe("<div><p>Coronavirus in India News Live Updates</p></div>");
  });
});
