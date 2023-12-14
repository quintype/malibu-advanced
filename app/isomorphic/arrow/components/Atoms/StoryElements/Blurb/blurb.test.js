import * as React from "react";
import { shallow, mount } from "enzyme";
import { generateStoryElementData, generateStore } from "../../../Fixture";
import { Blurb } from "./index";
import { Provider } from "react-redux";

const element = generateStoryElementData("blurb");

describe("Blurb Story Element", () => {
  it("Should render default template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <Blurb element={element} template="default" />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "blurb" }).prop("className")).toMatch(/blurb-default/);
  });

  it("Should render border template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <Blurb element={element} template="withBorder" />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "blurb" }).prop("className")).toMatch(/blurb-withBorder/);
  });

  it("Should render default template with external link", () => {
    const wrapper = shallow(
      <Provider store={generateStore}>
        <Blurb template="default" opts={{ isExternalLink: true }} element={element} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<div data-test-id="blurb" style="border-left:2px solid unset" class="arrow-component arr-custom-style arr--blurb-element blurb-m_blurb-default__JR86y blurb-m_dark__1eErz "><blockquote>Although the many story changes might be hard for book purists to accept, <a aria-label=\'content\' target=\'_blank\' href="https://www.rottentomatoes.com/m/ready_player_one/">Steven Spielberg</a> has lovingly captured the zeitgeist of 80s nostalgia in this adventure.</blockquote></div>'
    );
  });

  it("Should render default template without external link", () => {
    const wrapper = shallow(
      <Provider store={generateStore}>
        <Blurb template="default" opts={{ isExternalLink: false }} element={element} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<div data-test-id="blurb" style="border-left:2px solid unset" class="arrow-component arr-custom-style arr--blurb-element blurb-m_blurb-default__JR86y blurb-m_dark__1eErz "><blockquote>Although the many story changes might be hard for book purists to accept, <a href="https://www.rottentomatoes.com/m/ready_player_one/">Steven Spielberg</a> has lovingly captured the zeitgeist of 80s nostalgia in this adventure.</blockquote></div>'
    );
  });

  it("Should render the border template with border color", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <Blurb template="withBorder" element={element} css={{ borderColor: "#ff214b" }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "blurb" }).prop("style")).toEqual({ border: "2px solid #ff214b" });
  });

  it("Should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(
      <Provider store={generateStore}>
        <Blurb element={element} render={customTemplate} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<h3><blockquote>Although the many story changes might be hard for book purists to accept, <a href="https://www.rottentomatoes.com/m/ready_player_one/">Steven Spielberg</a> has lovingly captured the zeitgeist of 80s nostalgia in this adventure.</blockquote></h3>'
    );
  });
});
