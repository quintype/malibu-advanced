import React, { Fragment, useEffect, useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import { Link } from "@quintype/components";

import { OPEN_HAMBURGER_MENU, OPEN_SEARCHBAR, MEMBER_UPDATED } from "../../../store/actions";
import { MenuItem } from "../../menu-item";
import HamburgerMenu from "../../../atoms/hamburger-menu";
import MessageWrapper from "../../../molecules/forms/message-wrapper";

import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import { oauthAuthorize } from "./api";

import "./navbar.m.css";

const NavBar = () => {
  // Import account modal dynamically
  const AccountModal = lazy(() => import("../../../login/AccountModal"));
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const [showUserHandler, setUserHandler] = useState(false);
  const publisherAttributes =  useSelector(state => get(state, ["qt", "config", "publisher-attributes"], {}));
  const enableLogin =  get(publisherAttributes, ["enableLogin"], true);
  const isHamburgerMenuOpen = useSelector(state => get(state, ["isHamburgerMenuOpen"], false));
  const menu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "homeMenu"], []));
  const hamburgerMenu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "hamburgerMenu"], []));
  const domainSlug = useSelector(state => get(state, ["qt", "config", "domainSlug"], ""));
  const clientId = get(publisherAttributes, ["sso_login", "client_id"], "");
  const redirectUrl = domainSlug ? get(publisherAttributes, ["sso_login", "subdomain", "redirect_Url"], ""):  get(publisherAttributes, ["sso_login", "redirect_Url"], "");

  const currentPath =  useSelector(state => get(state, ["qt", "currentPath"], ""));

  const callbackUrl = `${global && global.location && global.location.origin}${currentPath}`;

  const displayStyle = isHamburgerMenuOpen ? "flex" : "none";
  const toggleHandler = () => {
    dispatch({
      type: OPEN_HAMBURGER_MENU,
      isHamburgerMenuOpen: !isHamburgerMenuOpen
    });
    dispatch({
      type: OPEN_SEARCHBAR,
      isSearchBarOpen: false
    });
  };

  const userAccountHandler = () => {
    setUserHandler(!showUserHandler);
    dispatch({
      type: OPEN_SEARCHBAR,
      isSearchBarOpen: false
    });
  };

  const getCurrentUser = async () => {
    // Import current user function only when this function is called
    const { currentUser } = await import("@quintype/bridgekeeper-js");
    try {
      const currentUserResp = await currentUser();
      const getMember = get(currentUserResp, ["user"], null);
      dispatch({ type: MEMBER_UPDATED, member: getMember });
    } catch (err) {
      console.log("error--------", err);
    }
  };

  const logoutHandler = async () => {
    // Import logout on click of the logout button
    const { logout } = await import("@quintype/bridgekeeper-js");
    logout()
      .then(() => {
        dispatch({
          type: MEMBER_UPDATED,
          member: null
        });
      })
      .finally(() => {
        setShowAccountModal(false);
        setUserHandler(false);
      });
  };

  const userBtnClick = async () => {
    // setShowAccountModal(true);

    // const oauthResponse = await oauthAuthorize(51, redirectUrl, callbackUrl);
    // console.log("oauthResponse---------", oauthResponse);

    dispatch({
      type: OPEN_SEARCHBAR,
      isSearchBarOpen: false
    });
  };

  const getNavbarMenu = menu => {
    return (
      <ul styleName="navbar">
        {menu.length > 0 &&
          menu.map(item => {
            return (
              <li key={item.title} styleName="dropdown">
                <MenuItem
                  item={item}
                  menuStyle="menu-link"
                  toggleHandler={() =>
                    dispatch({
                      type: OPEN_SEARCHBAR,
                      isSearchBarOpen: false
                    })
                  }
                />
              </li>
            );
          })}
      </ul>
    );
  };

  const getDropdownList = () => {
    if (!isHamburgerMenuOpen) {
      return null;
    }
    return (
      <Fragment>
        <div styleName="overlay" onClick={() => toggleHandler()}></div>
        <ul styleName="dropdown-content" style={{ display: displayStyle }}>
          <HamburgerMenu onMenuToggle={() => toggleHandler()} isMegaMenuOpen={isHamburgerMenuOpen} />
          {hamburgerMenu.length > 0 &&
            hamburgerMenu.map(item => {
              return (
                <li key={item.title} styleName="dropdown">
                  <MenuItem menuStyle="menu-link" item={item} toggleHandler={() => toggleHandler()} />
                </li>
              );
            })}
        </ul>
      </Fragment>
    );
  };

  const member = useSelector(state => get(state, ["member"], null));
  const imageUrl = member && member["avatar-url"];

  useEffect(() => {
    getCurrentUser();

    switch (global.location.hash) {
      case "#email-verified":
        return setMessage("Email verified.");
      case "#token-consumed":
        return setMessage("The verification link is already used.");
      case "#invalid-token":
        return setMessage("The verification link is invalid. Please request for a new link.");
      case "#internal-error":
        return setMessage("Something went wrong. Please try again.");
      default:
        return setMessage(null);
    }
  }, []);

  const messageModal = message => {
    // Import modal on message
    const Modal = lazy(() => import("../../../login/modal"));
    return (
      <Suspense fallback={<div></div>}>
        <Modal onClose={() => setMessage(null)}>
          <MessageWrapper message={message} />
        </Modal>
      </Suspense>
    );
  };

  return (
    <div styleName="main-wrapper" id="sticky-navbar">
      <nav className="container" styleName="wrapper">
        {hamburgerMenu.length > 0 ? (
          <div styleName="dropdown">
            <HamburgerMenu onMenuToggle={() => toggleHandler()} isMegaMenuOpen={isHamburgerMenuOpen} />
            {getDropdownList()}
          </div>
        ) : (
          <div />
        )}
        {getNavbarMenu(menu)}

        {enableLogin ? (
          <div styleName="user-profile">
            {member && member["verification-status"] ? (
              <>
                {imageUrl ? (
                  <img
                    width="24"
                    height="24"
                    alt="user"
                    src={imageUrl}
                    styleName="member-img"
                    onClick={userAccountHandler}
                  />
                ) : (
                  <span styleName="member-img" onClick={userAccountHandler}>

                    <SvgIconHandler
                      type="user"
                      width="24px"
                      height="24px"
                      viewBox="0 0 24 24"
                      iconStyle={{ borderRadius: "50%" }}
                      onClick={userAccountHandler}
                    />

                  </span>
                )}
                {showUserHandler && (
                  <Fragment>
                    <div styleName="overlay" onClick={userAccountHandler}></div>
                    <ul styleName="dropdown-content user-account">
                      <Link
                        styleName="user-account-item"
                        callback={() => setUserHandler(!showUserHandler)}
                        href="/profile"
                      >
                        Profile
                      </Link>
                      <li styleName="user-account-item" onClick={logoutHandler}>
                        Logout
                      </li>
                    </ul>
                  </Fragment>
                )}
              </>
            ) : (
              <>
                {/* <button aria-label="User Login Button" styleName="user-btn" onClick={() => userBtnClick()}> */}
                <a styleName="user-btn" href={`/api/auth/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&callback_uri=${callbackUrl}&response_type=code`}><SvgIconHandler type="user-icon" width="18" height="20" viewBox="0 0 18 20" /></a>
                {/* </button> */}
                {showAccountModal && (
                  <Suspense fallback={<div></div>}>
                    <AccountModal onClose={() => setShowAccountModal(false)} />
                  </Suspense>
                )}
              </>
            )}
          </div>
        ) : (
          <span></span>
        )}
        {message && messageModal(message)}
      </nav>
    </div>
  );
};

export { NavBar };
