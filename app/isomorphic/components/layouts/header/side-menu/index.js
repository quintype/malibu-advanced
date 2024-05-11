import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { Link } from "@quintype/components";
import get from "lodash/get";
import Button from "../../../atoms/Button";
import SideMenuGroup from "./side-menu-group";
import PT from "prop-types";
import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import "./side-menu.m.css";

function SideMenu({ handleToggle, isLoggedInUser, handleUserLogin }) {
  console.log("HEY Aneev! am in SideMenu");

  const state = useSelector((state) => state);
  const qtState = useSelector((state) => get(state, ["qt", "data"], {}));

  const isHamburgerMenuOpen = get(state, ["isHamburgerMenuOpen"], false);
  const subscription = get(qtState, ["navigationMenu", "subscriptionMenu"], []);
  const tertiaryNav = get(qtState, ["navigationMenu", "tertiaryNav"], []);
  const mainNav = get(qtState, ["navigationMenu", "mainNav"], []);
  const topNav = get(qtState, ["navigationMenu", "topNav"], []);

  const hamburgerStyle = isHamburgerMenuOpen ? "flex" : "none";
  const sidebarMenus = [
    { menu: subscription, displayStyle: "row" },
    { menu: tertiaryNav, displayStyle: "row" },
    { menu: mainNav, displayStyle: "column" },
    { menu: topNav, displayStyle: "column" },
  ];

  if (!isHamburgerMenuOpen) {
    return null;
  }

  const handleLogout = () => {
    handleUserLogin();
    handleToggle();
  };

  return (
    <Fragment>
      <div styleName="overlay" onClick={handleToggle}></div>
      <div id="side-menu" styleName="dropdown-content" style={{ display: hamburgerStyle }}>
        <div styleName="top-div">
          <span>
            <Link href="/">
              <SvgIconHandler type="logo-small" width="192px" height="28px" viewBox="0 0 192 28" />
            </Link>
          </span>
          <span>
            <Button aria-label="close-button" styleName="close__search" key="2" onClick={handleToggle}>
              <SvgIconHandler type="close" width="32" height="32" viewBox="0 0 20 20" />
            </Button>
          </span>
        </div>
        <div styleName="button-div">
          {isLoggedInUser ? (
            <span>
              <p styleName="welcome-user"> Welcome User!</p>
            </span>
          ) : (
            <>
              <span>
                <Button styleName="login-btn" onClick={handleUserLogin}>
                  LOGIN
                </Button>
              </span>
              <span>
                <Button styleName="register-btn " onClick={() => alert("Route me to Registration Page!!!")}>
                  REGISTER
                </Button>
              </span>
            </>
          )}
        </div>
        <div styleName="menu-groups">
          {sidebarMenus.length > 0 &&
            sidebarMenus.map((item, index) => {
              const rowStyle = item.displayStyle === "row" ? "menu-row-style" : "menu-col-style";
              return (
                <ul key={index} styleName={rowStyle}>
                  <SideMenuGroup menuItem={item.menu} toggleHandler={handleToggle} />
                </ul>
              );
            })}
          {isLoggedInUser && (
            <ul styleName="logout-div">
              <li onClick={handleLogout}>
                <span>Logout</span>
                <SvgIconHandler type="logout" width="24px" height="24px" />
              </li>
            </ul>
          )}
        </div>
        <div styleName="footer-div">
          <h2>FOOTER</h2>
        </div>
      </div>
    </Fragment>
  );
}

export default SideMenu;
SideMenu.propTypes = {
  handleToggle: PT.func,
  isLoggedInUser: PT.bool,
  handleUserLogin: PT.func,
};
