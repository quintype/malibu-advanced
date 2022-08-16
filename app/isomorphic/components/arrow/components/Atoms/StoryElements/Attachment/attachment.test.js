import * as React from "react";
import { shallow } from "enzyme";
import { generateStoryElementData } from "../../../Fixture";
import { Attachment } from "./index";

let element = generateStoryElementData("attachment");

describe("Attachment Story Element", () => {
  it("Should render default template", () => {
    const wrapper = shallow(<Attachment element={element} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should not render default template if url is not passed", () => {
    const wrapper = shallow(<Attachment element={{ ...element, url: "" }} />);
    expect(wrapper.find({ "data-test-id": "attachment" }).length).toEqual(0);
  });

  it("Should not render default template if content-type is not passed", () => {
    const wrapper = shallow(<Attachment element={{ ...element, "content-type": "" }} />);
    expect(wrapper.find({ "data-test-id": "attachment" }).length).toEqual(0);
  });

  it("Should render default template with default file-name if not passed", () => {
    const wrapper = shallow(<Attachment element={{ ...element, "file-name": "" }} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("Should render PDF icon if content-type is pdf", () => {
    const wrapper = shallow(<Attachment element={element} />);
    expect(wrapper.find({ "data-test-id": "doc" }).length).toEqual(0);
  });

  it("Should render DOC icon if content-type is doc", () => {
    element = { ...element, "content-type": "application/doc" };
    const wrapper = shallow(<Attachment element={element} />);
    expect(wrapper.find({ "data-test-id": "pdf" }).length).toEqual(0);
  });
});
