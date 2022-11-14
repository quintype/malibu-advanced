import * as React from "react";
import { shallow, mount } from "enzyme";
import { generateStoryElementData, generateStory, generateStore } from "../../../Fixture";
import { AlsoRead } from "./index";

import { Provider } from "react-redux";
import { Link } from "@quintype/components";

const element = generateStoryElementData("also-read");
const story = generateStory();

describe("Alsoread Story Element", () => {
  it("Should render default template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AlsoRead story={story} element={element} template="default" />
      </Provider>
    );
    expect(wrapper.find(Link).prop("className")).toMatch(/alsoread-default/);
  });

  it("Should render image right align template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AlsoRead story={story} element={element} template="imageRightAlign" />
      </Provider>
    );
    expect(wrapper.find(Link).prop("className")).toMatch(/alsoread-imageRightAlign/);
  });

  it("Should render text left align template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AlsoRead story={story} element={element} template="textLeftAlign" />
      </Provider>
    );
    expect(wrapper.find(Link).prop("className")).toMatch(/alsoread-textLeftAlign/);
  });

  it("Should render default template with fallback image", () => {
    const wrapper = shallow(
      <Provider store={generateStore}>
        <AlsoRead element={element} template="default" css={{ textColor: "#3333" }} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<a data-test-id="also-read" aria-label="also-read" class="arrow-component arr--also-read-element also-read-m_alsoread-default__3cYER "><div class="also-read-m_card-image-wrapper__3GFzu"><div class="arr--fallback-also-read also-read-m_image__2jdRP"><div class="arr--fallback-image fallback-m_image__1GYCJ fallback-m_image-position__3KddP"><figure class="arr--fallback-svg fallback-m_fallback-svg__tK9fL"><svg width="40" height="30" viewBox="0 0 102 76" version="1.1"><g id="demo-home-copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-377.000000, -314.000000)"><g id="Group-13" transform="translate(377.000000, 314.000000)"><path d="M43.2,49.7 L62.2,19.2 L87.2,59.4 L17,59.4 L32.8,39.4 L43.2,49.7 Z M29.9,28.6 C25.8683213,28.6 22.6,25.3316787 22.6,21.3 C22.6,17.2683213 25.8683213,14 29.9,14 C33.9316787,14 37.2,17.2683213 37.2,21.3 C37.2,25.3316787 33.9316787,28.6 29.9,28.6 Z" id="Combined-Shape" fill="#99B0CB" fill-rule="nonzero"></path><rect id="Rectangle-19" stroke="#99B0CB" stroke-width="3" x="1.5" y="1.5" width="99" height="73" rx="3"></rect></g></g></svg></figure></div></div></div><div class="also-read-m_content-wrapper__26AZX"><div class="also-read-m_headline__VzF-c" style="color:#3333">How is the coronavirus impacting people with disabilities?</div></div></a>'
    );
  });

  it("Should render default template with text color", () => {
    const wrapper = shallow(
      <Provider store={generateStore}>
        <AlsoRead story={story} element={element} template="default" css={{ textColor: "#3333" }} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<a data-test-id="also-read" aria-label="also-read" class="arrow-component arr--also-read-element also-read-m_alsoread-default__3cYER " href="https://ace-web.qtstage.io/anything/coronavirus/how-is-the-coronavirus-impacting-people-with-disabilities"><div class="also-read-m_card-image-wrapper__3GFzu"><figure class="also-read-m_card-image__3CwAv"><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" aspect-ratio="16,9" alt="hero image caption" class="qt-image"/></figure></div><div class="also-read-m_content-wrapper__26AZX"><div class="also-read-m_headline__VzF-c" style="color:#3333">How is the coronavirus impacting people with disabilities?</div></div></a>'
    );
  });

  it("Should render text left align template with custom title", () => {
    const wrapper = shallow(
      <Provider store={generateStore}>
        <AlsoRead story={story} element={element} template="textLeftAlign" opts={{ title: "Also-Read" }} />
      </Provider>
    );
    expect(wrapper.html()).toBe(
      '<a data-test-id="also-read" aria-label="also-read" class="arrow-component arr--also-read-element also-read-m_alsoread-textLeftAlign__S0Dxe " href="https://ace-web.qtstage.io/anything/coronavirus/how-is-the-coronavirus-impacting-people-with-disabilities"><div class="also-read-m_default-text__hp2dp also-read-m_dark__1pUib">Also-Read</div><div class="also-read-m_content-wrapper__26AZX"><div class="also-read-m_headline__VzF-c" style="color:dark">How is the coronavirus impacting people with disabilities?</div></div></a>'
    );
  });

  it("Should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(
      <Provider store={generateStore}>
        <AlsoRead element={element} render={customTemplate} />
      </Provider>
    );
    expect(wrapper.html()).toBe("<h3>How is the coronavirus impacting people with disabilities?</h3>");
  });
});
