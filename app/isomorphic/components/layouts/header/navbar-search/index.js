/* eslint-disable react/prop-types */
import React from "react";
import { SearchBox } from "@quintype/components";
import Button from "../../../atoms/Button";
import PT from "prop-types";
import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import "./navbar-search.m.css";

function NavbarSearch({ handleToggle }) {
  console.log("HEY Aneev! am in NavbarSearch");
  const DrawForm = ({ children }) => {
    return [
      <label styleName="search__form-label" htmlFor="searchForm" key="1">
        {children}
      </label>,
      <Button styleName="close__search" key="2">
        <SvgIconHandler type="close" width="32" height="32" viewBox="0 0 32 32" />
      </Button>,
    ];
  };

  return (
    <SearchBox
      styleName="search-box"
      template={DrawForm}
      inputId="searchForm"
      inputClassName="search__form-input"
      onSubmitHandler={handleToggle}
      onEscape={handleToggle}
      placeholder="Search"
    />
  );
}

export default NavbarSearch;

NavbarSearch.propTypes = {
  handleToggle: PT.func,
};
