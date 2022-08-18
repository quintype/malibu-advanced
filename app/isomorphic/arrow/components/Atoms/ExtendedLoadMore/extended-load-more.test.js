import * as React from "react";
import renderer from "react-test-renderer";
import { ExtendedLoadMore } from "./index";
import { Provider } from "react-redux";
import { generateStore } from "../../Fixture";

describe("Extended Load more button", () => {
  it("Should render extended load more button", () => {
    /* Useless test */
    const wrapper = renderer
      .create(
        <Provider store={generateStore}>
          <ExtendedLoadMore />
        </Provider>
      )
      .toJSON();
    expect(wrapper).toMatchSnapshot();
  });
});
