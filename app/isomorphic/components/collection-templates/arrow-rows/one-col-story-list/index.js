import React from "react";
import { OneColStoryList } from "@quintype/arrow";
import { object } from "prop-types";

export const ArrowOneColStoryList = ({ collection }) => {
  return <OneColStoryList collection={collection} />;
};

ArrowOneColStoryList.propTypes = {
  collection: object
};

ArrowOneColStoryList.storyLimit = 12;
