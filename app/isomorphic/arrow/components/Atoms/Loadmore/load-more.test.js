import * as React from "react";
import renderer from "react-test-renderer";
import { LoadmoreButton } from "./index";
import { Provider } from "react-redux";
import { generateStore, generateCollection } from "../../Fixture";

const collection = generateCollection();

describe("Load more button", () => {
  it("Should render button and load items subsequently with SubsequentLoadCount as template property.", () => {
    const wrapper = renderer
      .create(
        <Provider store={generateStore}>
          <LoadmoreButton template="SubsequentLoadCount" collection={collection} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
  it("Should render button and navigate to the corresponding url with NavigateToPage as template property.", () => {
    const wrapper = renderer
      .create(
        <Provider store={generateStore}>
          <LoadmoreButton template="NavigateToPage" collection={collection} />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
});
