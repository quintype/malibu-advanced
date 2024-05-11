import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { OPEN_SEARCHBAR, OPEN_HAMBURGER_MENU, DUBAI_TEMPERATURE } from "../../../store/actions";
import { Link } from "@quintype/components";
import get from "lodash/get";
import NavbarSearch from "../navbar-search";
import MenuGroup from "../../menu-group";
import SideMenu from "../side-menu";
import PT from "prop-types";
import { getDubaiTemperature } from "../../../../../api/utils";
import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import "./navbar.m.css";

function NavBar({ isScrolled }) {
  const pageType = useSelector((state) => get(state, ["qt", "pageType"], null));
  const qtState = useSelector((state) => get(state, ["qt", "data"], {}));
  const isSearchBarOpen = useSelector((state) => get(state, ["isSearchBarOpen"], false));
  const isHamburgerMenuOpen = useSelector((state) => get(state, ["isHamburgerMenuOpen"], false));
  const topNavMenu = get(qtState, ["navigationMenu", "topNav"], []);
  const mobileNavMenu = get(qtState, ["navigationMenu", "mobileNav"], []);
  const sectionName = (qtState.section && qtState?.section["display-name"]) || "Section Name";
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  const dispatch = useDispatch();

  const toggleSearchBar = () => {
    dispatch({
      type: OPEN_SEARCHBAR,
      isSearchBarOpen: !isSearchBarOpen,
    });
  };

  const toggleHamMenu = () => {
    dispatch({
      type: OPEN_HAMBURGER_MENU,
      isHamburgerMenuOpen: !isHamburgerMenuOpen,
    });
  };

  const handleUserLogin = () => {
    setIsLoggedInUser(!isLoggedInUser);
  };

  const hideButtons = (pageType === "section-page" && isScrolled) || isSearchBarOpen;

  const hideButtonDiv = {
    display: hideButtons ? "none" : "flex",
  };

  useEffect(() => {
    async function getTemperature() {
      const temperature = await getDubaiTemperature();
      dispatch({ type: DUBAI_TEMPERATURE, payload: temperature });
    }
    getTemperature();
  }, []);
  console.log("Hey Aneev! am in NaVBAR");
  return (
    <div className="container">
      <nav id="navigation-bar" styleName={`${isScrolled ? "nav-wrapper-scrolled" : "nav-wrapper"}`}>
        <div styleName={`${isScrolled ? "nav-menu-wrapper-scrolled" : "nav-menu-wrapper"}`}>
          <button id="hamburger-btn" styleName="hamburger__btn" onClick={toggleHamMenu}>
            <SvgIconHandler type="hamburger" width="32px" height="32px" viewBox="0 0 32 32" />
          </button>
          <Link href="/" styleName={isSearchBarOpen ? "no-logo" : `${isScrolled ? "nav-logo-scrolled" : "nav-logo"}`}>
            {isScrolled ? (
              <SvgIconHandler type="logo-small" width="138px" height="20px" viewBox="0 0 138 20" />
            ) : (
              <SvgIconHandler type="logo-small" width="192px" height="27.9px" viewBox="0 0 192 27.9" />
            )}
          </Link>
          {pageType === "section-page" ? (
            !isScrolled ? (
              <div styleName={isSearchBarOpen ? "alter-nav-menus" : "nav-menus"}>
                <MenuGroup menuList={topNavMenu} />
              </div>
            ) : (
              <>
                {isSearchBarOpen && toggleSearchBar()}
                <span styleName="section-name">{sectionName}</span>
              </>
            )
          ) : (
            <div styleName={isSearchBarOpen ? "alter-nav-menus" : `${isScrolled ? "nav-menus-scrolled" : "nav-menus"}`}>
              <MenuGroup menuList={topNavMenu} />
            </div>
          )}
        </div>
        <div
          styleName={`${
            isScrolled
              ? pageType === "section-page"
                ? "section-page-scrolled"
                : "nav-button-wrapper-scrolled"
              : "nav-button-wrapper"
          }`}
          style={hideButtonDiv}
        >
          <button
            id="subscribe-btn"
            styleName="subscribe__btn"
            onClick={() => alert("Route me to Subscription Page!!!")}
          >
            SUBSCRIPTIONS
          </button>
          {isLoggedInUser ? (
            <button styleName="profile__icon" onClick={handleUserLogin}>
              <SvgIconHandler type="user-icon" width="32px" height="32px" viewBox="0 0 32 32" />
            </button>
          ) : (
            <button id="login-btn" styleName="login__btn" onClick={handleUserLogin}>
              LOGIN
            </button>
          )}
          <button id="search-btn" styleName="search__icon" onClick={toggleSearchBar}>
            <SvgIconHandler type="search" width="32px" height="32px" viewBox="0 0 32 32" />
          </button>
        </div>

        {isSearchBarOpen && (
          <div id="search-bar" styleName={isSearchBarOpen && "nav__search"}>
            <NavbarSearch handleToggle={toggleSearchBar} />
          </div>
        )}
      </nav>
      {isHamburgerMenuOpen && (
        <div id="hamburger-menu">
          <SideMenu handleToggle={toggleHamMenu} isLoggedInUser={isLoggedInUser} handleUserLogin={handleUserLogin} />
        </div>
      )}
      {!isScrolled && (
        <div styleName="mobile-nav-menus">
          <MenuGroup menuList={mobileNavMenu} />
        </div>
      )}
    </div>
  );
}

NavBar.propTypes = {
  isScrolled: PT.bool,
};

export default NavBar;
