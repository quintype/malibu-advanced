import * as React from "react";
import { shallow } from "enzyme";
import { SocialShareTemplate } from "./index";

describe("Social Share Template", () => {
  it("Should render horizontal social share template", () => {
    const data = {
      fbUrl: "https://www.facebook.com",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "https://twitter.com/",
      theme: "#ffff",
      iconType: "plain-svg"
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should render vertical social share template", () => {
    const data = {
      fbUrl: "https://www.facebook.com",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "https://twitter.com/",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render social share template if url is not passed", () => {
    const data = {
      fbUrl: "",
      twitterUrl: "",
      linkedinUrl: "",
      whatsappUrl: "",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render facebook icon if url not passed", () => {
    const data = {
      fbUrl: "",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "https://twitter.com/",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render twitter icon if url not passed", () => {
    const data = {
      fbUrl: "https://twitter.com/",
      twitterUrl: "",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "https://twitter.com/",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render whatsapp icon if url not passed", () => {
    const data = {
      fbUrl: "https://twitter.com/",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render linkedin icon if url not passed", () => {
    const data = {
      fbUrl: "https://twitter.com/",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "",
      whatsappUrl: "https://twitter.com/",
      theme: "#ffff",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should render template if theme and icon is not passed", () => {
    const data = {
      fbUrl: "https://twitter.com/",
      twitterUrl: "https://twitter.com/",
      linkedinUrl: "https://twitter.com/",
      whatsappUrl: "https://twitter.com/",
      theme: "",
      iconType: "plain-svg",
      vertical: true
    };
    const wrapper = shallow(<SocialShareTemplate {...data} />);
    expect(wrapper).toMatchSnapshot();
  });
});
