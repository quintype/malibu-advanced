/* eslint-disable react/no-unknown-property */
import React from "react";
import { MenuItem } from "../menu-item";
import { OPEN_SEARCHBAR } from "../../store/actions";
import { useDispatch } from "react-redux";
import PT from "prop-types";
import "./menu-group.m.css";

function MenuGroup({ menuList }) {
  const dispatch = useDispatch();

  const toggleHandler = () => {
    dispatch({
      type: OPEN_SEARCHBAR,
      isSearchBarOpen: false,
    });
  };
  const appDownloadItem = menuList.find((item) => item?.data?.["icon-code"] === "app-download");
  const newMenuList = appDownloadItem ? menuList.slice(0, -1) : menuList;
  return (
    <div styleName={appDownloadItem ? "menu-with-download" : "menu-group"}>
      <ul styleName="menu-group">
        {newMenuList.length > 0 &&
          newMenuList.map((item) => {
            return (
              <li key={item.title}>
                <MenuItem item={item} menuStyle="menu-link" onClick={toggleHandler} />
              </li>
            );
          })}
      </ul>
      {appDownloadItem && (
        <div styleName="download" key={appDownloadItem.title}>
          <MenuItem item={appDownloadItem} menuStyle="menu-link" onClick={toggleHandler} />
        </div>
      )}
    </div>
  );
}

export default MenuGroup;

MenuGroup.propTypes = {
  menuList: PT.array,
  isMobileNavMenu: PT.bool,
};
