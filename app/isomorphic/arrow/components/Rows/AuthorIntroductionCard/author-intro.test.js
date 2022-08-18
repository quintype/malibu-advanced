import React from "react";
import { mount } from "enzyme";
import AuthorIntroductionCard from ".";
import { generateStore, authorData } from "../../Fixture";
import { Provider } from "react-redux";

describe("Author Intro component", () => {
  it("Should render default template with border, author bio and social-links enabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: true,
      enableSocialLinks: true
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/default/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(7);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(1);
  });

  it("Should render default template with border, author bio and social-links disabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: false,
      enableSocialLinks: false
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/default/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(0);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(0);
  });

  it("Should render square template with border, author bio and social-links enabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: true,
      enableSocialLinks: true
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} template="square" />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/default/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(7);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(1);
  });

  it("Should render square template with border, author bio and social-links disabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: false,
      enableSocialLinks: false
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} template="square" />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/default/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(0);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(0);
  });

  it("Should render small cirlce template with border, author bio and social-links enabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: true,
      enableSocialLinks: true,
      borderSupport: true
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} template="smallCircle" />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/small-circle/);
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/border/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(7);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(1);
  });

  it("Should render small cirlce template with border, author bio and social-links disabled", () => {
    const contextConfig = {
      theme: "#ffffff",
      enableBio: false,
      enableSocialLinks: false,
      borderSupport: false
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorIntroductionCard data={authorData} config={contextConfig} template="smallCircle" />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "author-intro" }).prop("className")).toMatch(/small-circle/);
    expect(wrapper.find({ "data-test-id": "social-link" }).length).toBe(0);
    expect(wrapper.find({ "data-test-id": "author-bio" }).length).toBe(0);
  });
});
