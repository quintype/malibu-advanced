import * as React from "react";
import { shallow, mount } from "enzyme";
import { generateStoryElementData } from "../../../Fixture";
import { Quote } from "./index";

const element = generateStoryElementData("quote");

describe("Quote Story Element", () => {
  it("Should render default template", () => {
    const wrapper = mount(<Quote element={element} template="borderNone" />);
    expect(wrapper.find({ "data-test-id": "quote" }).prop("className")).toMatch(/quote-borderNone/);
  });

  it("Should render border left template", () => {
    const wrapper = mount(<Quote element={element} template="borderLeft" />);
    expect(wrapper.find({ "data-test-id": "quote" }).prop("className")).toMatch(/quote-borderLeft/);
  });

  it("Should render border top template", () => {
    const wrapper = mount(<Quote element={element} template="borderTopSmall" />);
    expect(wrapper.find({ "data-test-id": "quote" }).prop("className")).toMatch(/quote-borderTopSmall/);
  });

  it("Should render border left template with border color", () => {
    const wrapper = shallow(<Quote template="borderLeft" element={element} css={{ borderColor: "#ff214b" }} />);
    expect(wrapper.html()).toBe(
      '<div data-test-id="quote" class="arrow-component arr--quote-element quote-m_quote-borderLeft__3QaAY "><p style="border-left:4px solid #ff214b" class="quote-m_text__2hXSE quote-m_dark__1migZ">Quote: Rajasthan Chief Minister Ashok</p><p data-test-id="quote-attribution" class="quote-m_attribution__20Y6O quote-m_dark__1migZ">Ashok</p></div>'
    );
  });

  it("Should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.metadata.content }} />;
    const wrapper = shallow(<Quote element={element} render={customTemplate} />);
    expect(wrapper.html()).toBe("<h3>Quote: Rajasthan Chief Minister Ashok</h3>");
  });
});
