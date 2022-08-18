import * as React from "react";
import { shallow, mount } from "enzyme";
import expect from "expect";
import { generateStoryElementData } from "../../../Fixture";
import { Summary } from "./index";

const element = generateStoryElementData("summary");

describe("Summary Story Element", () => {
  it("Should render default template", () => {
    const wrapper = mount(<Summary element={element} />);
    expect(wrapper.find({ "data-test-id": "summary" }).prop("className")).toMatch(/summary/);
  });

  it("Should render border left template", () => {
    const wrapper = mount(<Summary element={element} template="header" />);
    expect(wrapper.find({ "data-test-id": "summary" }).prop("className")).toMatch(/summary-header/);
  });

  it("Should render border top template", () => {
    const wrapper = mount(<Summary element={element} template="border" />);
    expect(wrapper.find({ "data-test-id": "summary" }).prop("className")).toMatch(/summary-border/);
  });

  it("Should render template without headline", () => {
    const wrapper = shallow(<Summary element={element} opts={{ hideHeadline: true }} />);
    expect(wrapper.find({ "data-test-id": "summary-headline" }).length).toEqual(0);
  });

  it("Should render template with custom headline", () => {
    const wrapper = mount(<Summary element={element} opts={{ headline: "in short" }} />);
    expect(wrapper.find({ "data-test-id": "summary-headline" }).text()).toEqual("in short");
  });

  it("Should render template with header background color", () => {
    const wrapper = mount(<Summary element={element} template="header" css={{ headerBgColor: " #b3243e" }} />);
    expect(wrapper.html()).toBe(
      `<div data-test-id="summary" class="arrow-component arr--summary-element arr-custom-style summary-m_summary-header__UKVHi "><div data-test-id="summary-headline" class="summary-m_heading-wrapper__23S51 summary-m_dark__1ZuzR"><div style="background-color: rgb(179, 36, 62);" class="summary-m_headline__30sie summary-m_dark__1ZuzR summary-m_dark__1ZuzR">Summary</div></div><div class="summary-m_content__37n8C summary-m_dark__1ZuzR"><p>Lorem<em> Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</em>, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></div></div>`
    );
  });

  it("Should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(<Summary element={element} render={customTemplate} />);
    expect(wrapper.html()).toBe(
      "<h3><p>Lorem<em> Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries</em>, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p></h3>"
    );
  });
});
