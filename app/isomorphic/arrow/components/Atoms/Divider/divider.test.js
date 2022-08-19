import React from "react";
import { shallow } from "enzyme";
import { Divider } from ".";

describe("Divider", () => {
  it("should render", () => {
    const wrapper = shallow(<Divider />);
    expect(wrapper).toMatchSnapshot();
  });
});
