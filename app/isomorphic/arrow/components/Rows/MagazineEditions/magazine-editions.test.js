import React from "react";
import { mount, shallow } from "enzyme";
import MagazineEditions from ".";
import { generateStore, generateMagazineIssues } from "../../Fixture";
import { Provider } from "react-redux";

const magazineCollection = generateMagazineIssues();

describe("MagazineEditions component", () => {
  it("Should render template with array of collections", () => {
    const contextConfig = {
      collectionNameBorderColor: "",
      theme: "",
      collectionNameTemplate: "",
      footerButton: "",
      editionsTitle: "",
      enableEditionsTitle: true,
      title: "",
    };
    const wrapper = mount(
      <Provider store={generateStore}>
        <MagazineEditions collection={magazineCollection} config={contextConfig} />
        );
      </Provider>
    );
    expect(wrapper.find(MagazineEditions)).toHaveLength(1);
  });

  it("Should render `no editions message` if there are no editions", () => {
    const wrapper = shallow(<MagazineEditions />);
    expect(wrapper.find(MagazineEditions)).toHaveLength(0);
  });
});
