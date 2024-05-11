import React, { useState } from "react";
import SideMenuItem from "./side-menu-item";
import PT from "prop-types";
import "./side-menu.m.css";

export default function NestedMenuItems({ item, toggleHandler }) {
  const [showSecondaryMenuSection, setShowSecondaryMenuSection] = useState("");

  const showSecondarySectionHandler = (idx) => {
    setShowSecondaryMenuSection(showSecondaryMenuSection === idx ? undefined : idx);
  };

  return (
    item?.children.length > 0 &&
    item.children.map((nestedItem, index) => {
      return (
        <>
          <SideMenuItem
            key={index}
            index={index}
            item={nestedItem}
            toggleHandler={toggleHandler}
            showMenuSection={showSecondaryMenuSection}
            showSectionHandler={() => showSecondarySectionHandler(index)}
          />
          {showSecondaryMenuSection === index && (
            <div styleName="submenu-nested">
              <NestedMenuItems key={index} item={nestedItem} toggleHandler={toggleHandler} />
            </div>
          )}
        </>
      );
    })
  );
}

NestedMenuItems.propTypes = {
  item: PT.object,
  toggleHandler: PT.func,
};
