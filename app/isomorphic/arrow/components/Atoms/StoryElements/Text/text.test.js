import * as React from "react";
import { shallow, mount } from "enzyme";
import { Text } from "./index";
import { generateStoryElementData } from "../../../Fixture";

const element = generateStoryElementData("text");

describe("Text Story Element", () => {
  it("should render default template", () => {
    const wrapper = mount(<Text element={element} />);
    expect(wrapper.find({ "data-test-id": "text" }).prop("className")).toMatch(/text-element/);
  });

  it("should render promotional message when it is enabled", () => {
    const promotionalMessage = { ...element, metadata: { "promotional-message": true } };
    const wrapper = mount(<Text element={promotionalMessage} />);
    expect(wrapper.find({ "data-test-id": "promotional-message" }).prop("className")).toMatch(/promotionalMessage/);
  });

  it("should render default template with external link", () => {
    const wrapper = shallow(<Text opts={{ isExternalLink: true }} element={element} />);
    expect(wrapper.html()).toBe(
      "<div data-test-id=\"text\" id=\"text-element\" class=\"arrow-component arr--text-element text-m_textElement__e3QEt text-m_dark__1TC18 \"><p><a aria-label='content' target='_blank' href=\"https://www.theguardian.com/technology/virtual-reality\">Virtual reality</a> is the air guitar solo of modern cinema: a frenetic imagined activity in a made-up world that exists one level below the already made-up world of the story. <a aria-label='content' target='_blank' href=\"https://www.theguardian.com/film/stevenspielberg\">Steven Spielberg</a> 2019s <a aria-label='content' target='_blank' href=\"https://www.theguardian.com/film/ready-player-one\">Ready Player One</a>.</p></div>"
    );
  });

  it("should render default template without external link", () => {
    const wrapper = shallow(<Text opts={{ isExternalLink: false }} element={element} />);
    expect(wrapper.html()).toBe(
      '<div data-test-id="text" id="text-element" class="arrow-component arr--text-element text-m_textElement__e3QEt text-m_dark__1TC18 "><p><a href="https://www.theguardian.com/technology/virtual-reality">Virtual reality</a> is the air guitar solo of modern cinema: a frenetic imagined activity in a made-up world that exists one level below the already made-up world of the story. <a href="https://www.theguardian.com/film/stevenspielberg">Steven Spielberg</a> 2019s <a href="https://www.theguardian.com/film/ready-player-one">Ready Player One</a>.</p></div>'
    );
  });

  it("should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(<Text element={element} render={customTemplate} />);
    expect(wrapper.html()).toBe(
      '<h3><p><a href="https://www.theguardian.com/technology/virtual-reality">Virtual reality</a> is the air guitar solo of modern cinema: a frenetic imagined activity in a made-up world that exists one level below the already made-up world of the story. <a href="https://www.theguardian.com/film/stevenspielberg">Steven Spielberg</a> 2019s <a href="https://www.theguardian.com/film/ready-player-one">Ready Player One</a>.</p></h3>'
    );
  });
});
