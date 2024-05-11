import React, { useState } from "react";
import NestedMenuItems from "./nested-menu-items";
import SideMenuItem from "./side-menu-item";
import PT from "prop-types";
import "./side-menu.m.css";

export default function SideMenuGroup({ menuItem, toggleHandler }) {
  const [showPrimaryMenuSection, setShowPrimaryMenuSection] = useState("");

  const showPrimarySectionHandler = (idx) => {
    setShowPrimaryMenuSection(showPrimaryMenuSection === idx ? undefined : idx);
  };

  return (
    menuItem?.length > 0 &&
    menuItem.map((item, index) => {
      return (
        item["item-type"] !== "placeholder" && (
          <>
            <SideMenuItem
              key={item.id}
              index={index}
              item={item}
              toggleHandler={toggleHandler}
              showMenuSection={showPrimaryMenuSection}
              showSectionHandler={showPrimarySectionHandler}
            />
            {showPrimaryMenuSection === index && (
              <div styleName="submenu">
                <NestedMenuItems key={index} item={item} toggleHandler={toggleHandler} />
              </div>
            )}
          </>
        )
      );
    })
  );
}

SideMenuGroup.propTypes = {
  menuItem: PT.array,
  toggleHandler: PT.func,
};
