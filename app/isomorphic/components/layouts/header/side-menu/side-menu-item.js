import React from "react";
import { MenuItem } from "../../menu-item";
import Button from "../../../atoms/Button";
import PT from "prop-types";
import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import "./side-menu.m.css";

export default function SideMenuItem({ index, item, toggleHandler, showMenuSection, showSectionHandler }) {
  return (
    <li>
      <MenuItem
        changeTextWeight={item?.data?.color.toLowerCase() !== "#ffffff"}
        menuStyle="menu-link"
        item={item}
        toggleHandler={toggleHandler}
      />
      {item.children?.length > 0 && (
        <Button
          styleName={showMenuSection === index ? "down-arrow-rotate down-arrow" : "down-arrow"}
          type="submit"
          onClick={() => showSectionHandler(index)}
        >
          <SvgIconHandler type="arrow" width="24px" height="24px" />
        </Button>
      )}
    </li>
  );
}

SideMenuItem.propTypes = {
  index: PT.string,
  item: PT.object,
  toggleHandler: PT.func,
  showMenuSection: PT.string,
  showSectionHandler: PT.func,
};
