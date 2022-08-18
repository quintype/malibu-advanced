import React from "react";
import { mount } from "enzyme";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import AuthorsList from ".";
import { generateStore, authorData } from "../../Fixture";
import { Provider } from "react-redux";

const getMoreData = () => {
  console.log("load more data");
};

const AuthorsData = Array(8).fill(authorData);

describe("Authors List component", () => {
  it("Should render authors list component if data is present", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorsList data={AuthorsData} config={{}} getMoreData={getMoreData} hideLoadmore={false} limit={9} />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "authors-list" }).prop("className")).toMatch(/arr--authors-list/);
  });

  it("Should not render authors list component if data is absent", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorsList data={[]} config={{}} getMoreData={getMoreData} hideLoadmore={false} limit={9} />;
      </Provider>
    );
    expect(wrapper.find({ "data-test-id": "authors-list" }).length).toBe(0);
  });

  it("Should render Authors List component with Load More disabled", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorsList data={AuthorsData} config={{}} getMoreData={getMoreData} hideLoadmore={true} limit={9} />; );
      </Provider>
    );
    expect(wrapper.find(LoadmoreButton).length).toEqual(0);
  });

  it("Should render Authors List component with Load More enabled", () => {
    const wrapper = mount(
      <Provider store={generateStore}>
        <AuthorsList data={AuthorsData} config={{}} getMoreData={getMoreData} hideLoadmore={false} limit={9} />; );
      </Provider>
    );
    expect(wrapper.find(LoadmoreButton).length).toEqual(1);
  });
});
