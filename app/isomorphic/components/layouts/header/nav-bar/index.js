import React, { Fragment, useEffect, useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

import { OPEN_HAMBURGER_MENU, OPEN_SEARCHBAR, MEMBER_UPDATED } from "../../../store/actions";
import { MenuItem } from "../../menu-item";
import HamburgerMenu from "../../../atoms/hamburger-menu";
import MessageWrapper from "../../../molecules/forms/message-wrapper";
import { generateRedirect } from "../../../utils";

import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";

import "./navbar.m.css";

const NavBar = () => {
  // Import account modal dynamically
  const AccountModal = lazy(() => import("../../../login/AccountModal"));
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const [showUserHandler, setUserHandler] = useState(false);
  const enableLogin = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enableLogin"], true));
  const isHamburgerMenuOpen = useSelector(state => get(state, ["isHamburgerMenuOpen"], false));
  const menu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "homeMenu"], []));
  const hamburgerMenu = useSelector(state => get(state, ["qt", "data", "navigationMenu", "hamburgerMenu"], []));
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [originUrl, setOriginUrl] = useState(null);
  const enableSSO = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "enable_sso"]));
  // const ssoHost = useSelector(state => get(state, ["qt", "config", "publisher-attributes", "sso_host"]));
  const integrationId = 51;

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

    setCallbackUrl(global.location.origin);
    setOriginUrl(global.location.href);

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

  const onClick = async (callbackUrl, integrationId) => {
    const redirectUri = `${callbackUrl}/user/signup`;
    const authUrl = await generateRedirect(integrationId, redirectUri);
    window.location.href = `${authUrl}&origin_url=${originUrl}`;
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
                      <li styleName="user-account-item" onClick={logoutHandler}>
                        Logout
                      </li>
                    </ul>
                  </Fragment>
                )}
              </>
            ) : (
              <>
                {enableSSO ? (
                  <span onClick={() => onClick(callbackUrl, integrationId)}>
                    <SvgIconHandler type="user-icon" width="18" height="20" viewBox="0 0 18 20" />
                  </span>
                ) : (
                  <button styleName="user-btn" onClick={() => userBtnClick()}>
                    <SvgIconHandler type="user-icon" width="18" height="20" viewBox="0 0 18 20" />
                  </button>
                )}
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
