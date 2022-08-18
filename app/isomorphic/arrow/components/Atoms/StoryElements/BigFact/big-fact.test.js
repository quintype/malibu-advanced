import React from "react";
import { shallow, mount } from "enzyme";
import { BigFact } from "./index";
import { generateStoryElementData } from "../../../Fixture";
import "./big-fact.m.css";

const element = generateStoryElementData("bigfact");
describe("Component: BigFact", () => {
  test("It should display the big fact element content and attribution", () => {
    const wrapper = mount(<BigFact element={element} />);
    expect(wrapper.find({ "data-test-id": "bigfact" }).prop("className")).toMatch(/bigfact-element/);
  });
  it("Should not render attribution value if there is no data", () => {
    const wrapper = shallow(<BigFact element={element} />);
    expect(wrapper.find({ "data-test-id": "attribution" }).length).toEqual(0);
  });
  test("It should not render the BigFact component if the data is null", () => {
    const component = shallow(<BigFact />);
    expect(component.contains(<BigFact />)).toBe(false);
  });
});
