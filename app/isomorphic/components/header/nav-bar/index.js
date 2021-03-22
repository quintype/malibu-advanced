import React, { Fragment, useEffect, useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import assetify from "@quintype/framework/assetify";

import { OPEN_HAMBURGER_MENU, OPEN_SEARCHBAR, MEMBER_UPDATED } from "../../store/actions";
import { MenuItem } from "../menu-item";
import HamburgerMenu from "../../atoms/hamburger-menu";
import MessageWrapper from "../../molecules/forms/message-wrapper";
import UserIcon from "../../../../assets/images/user-icon.svg";
import User from "../../../../assets/images/user.svg";

import "./navbar.m.css";

const NavBar = () => {
  // Import account modal dynamically
  const AccountModal = lazy(() => import("../../login/AccountModal"));
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const [showUserHandler, setUserHandler] = useState(false);
  const enableLogin = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enableLogin"], true));
  const isHamburgerMenuOpen = useSelector(state => get(state, ["isHamburgerMenuOpen"], false));
  const menu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "homeMenu"], []));
  const hamburgerMenu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "hamburgerMenu"], []));

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
      dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
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

  const userBtnClick = () => {
    setShowAccountModal(true);
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
                  <MenuItem item={item} toggleHandler={() => toggleHandler()} />
                </li>
              );
            })}
        </ul>
      </Fragment>
    );
  };

  const member = useSelector(state => get(state, ["member"], null));
  const enableAds = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enable_ads"], true));
  const loadAdsSynchronously = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "load_ads_synchronously"], false)
  );
  const imageUrl = member && member["avatar-url"] ? member["avatar-url"] : assetify(User);

  useEffect(() => {
    if (enableAds && !loadAdsSynchronously) {
      setTimeout(function() {
        var gads = document.createElement("script");
        var useSSL = document.location.protocol === "https:";
        gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
        var node = document.getElementsByTagName("script")[0];
        gads.setAttribute("async", "");
        node.parentNode.insertBefore(gads, node);
      }, 2000);
    }

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
    const Modal = lazy(() => import("../../login/modal"));
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
                <img
                  width="24"
                  height="24"
                  alt="user"
                  src={imageUrl}
                  styleName="member-img"
                  onClick={userAccountHandler}
                />
                {showUserHandler && (
                  <Fragment>
                    <div styleName="overlay" onClick={userAccountHandler}></div>
                    <ul styleName="dropdown-content user-account">
                      <li styleName="user-account-item" onClick={logoutHandler}>
                        Logout
                      </li>
                    </ul>
                  </Fragment>
                )}
              </>
            ) : (
              <>
                <button styleName="user-btn" onClick={() => userBtnClick()}>
                  <img width="18" height="20" src={assetify(UserIcon)} alt="user-icon" />
                </button>
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
