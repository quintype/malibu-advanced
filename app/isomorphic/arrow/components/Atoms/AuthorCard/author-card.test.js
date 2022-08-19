import * as React from "react";
import { mount } from "enzyme";
import expect from "expect";
import { generateStory, generateStore } from "../../Fixture/index";
import { AuthorCard } from "./index";
import { Provider } from "react-redux";
import { Twitter } from "../../Svgs/SocialIcons/twitter";

const story = generateStory();

const singleAuthorStory = {
  ...story,
  authors: [
    {
      id: 123981,
      name: "Ravigopal Kesari",
      slug: "ravigopal-kesari",
      social: {
        twitter: {
          url: "https://www.twitter.com/sabqorg",
          handle: "elonmusk"
        }
      },
      "avatar-url":
        "https://lh5.googleusercontent.com/-NhNrHEp1w4M/AAAAAAAAAAI/AAAAAAAAAAs/lzYwVY1BQdQ/photo.jpg?sz=50",
      "avatar-s3-key": null,
      "twitter-handle": null,
      bio:
        "William Shakespeare was an English poet, playwright, and actor, widely regarded as the greatest writer in the English language and the world’s greatest dramatist. He is often called England’s national poet and the “Bard of Avon”",
      "contributor-role": {
        id: 873,
        name: "Author"
      }
    }
  ]
};

describe("default author card", () => {
  it("Should render leftAligned template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={story} template="leftAligned" />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-card-left-aligned" }).prop("className")).toMatch(/leftAligned/);
  });
  it("Should render default template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={story} template="default" />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-card-default" }).prop("className")).toMatch(/default/);
  });
  it("Should render centerAligned template", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={story} template="centerAligned" />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-card-center-aligned" }).prop("className")).toMatch(/centerAligned/);
  });
  it("Should render author card without image", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={story} template="centerAligned" opts={{ showImage: false }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-image" }).length).toEqual(0);
  });
  it("Should render author card without author bio", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={singleAuthorStory} template="centerAligned" opts={{ showBio: false }} />
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toEqual(0);
  });

  it("Should not render twitter icon when template is centerAligned", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={singleAuthorStory} template="centerAligned" opts={{ showBio: false }} />
      </Provider>
    );
    expect(wrapper.contains(<Twitter />)).toEqual(false);
  });

  it("Should render twitter icon when template is not centerAligned", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorCard story={singleAuthorStory} template="leftAligned" opts={{ showBio: false }} />
      </Provider>
    );
    expect(wrapper.contains(<Twitter />)).toEqual(true);
  });
});
