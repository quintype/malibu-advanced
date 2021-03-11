import React, { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import { object, bool } from "prop-types";

import { MEMBER_UPDATED } from "../../store/actions";
import { NavbarSearch } from "../navbar-search";
import { MenuItem } from "../helper-components";
import { AppLogo } from "../app-logo";
import MessageWrapper from "../../molecules/forms/message-wrapper";
import { Modal } from "../../login/Modal";

import "./styles.m.css";

const NavBar = ({ menu, enableLogin }) => {
  // Import account modal dynamically
  const AccountModal = React.lazy(() => import("../../login/AccountModal"));
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();

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
      });
  };

  const member = useSelector(state => get(state, ["member"], null));

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

  return (
    <React.Fragment>
      <AppLogo />
      <ul styleName="navbar">
        {get(menu, ["default"], []).map((item, index) => {
          return (
            <li key={`${item.id}${index}`} styleName="menu-item desktop-view">
              <MenuItem item={item} />
            </li>
          );
        })}
        {enableLogin && (
          <li>
            {member && member["verification-status"] ? (
              <>
                <button onClick={logoutHandler}>Logout</button>
                <p>{`Username: ${get(member, ["name"], "")}`}</p>
              </>
            ) : (
              <>
                <button onClick={() => setShowAccountModal(true)}>Login</button>
                {showAccountModal && (
                  <Suspense fallback={<div></div>}>
                    <AccountModal onBackdropClick={() => setShowAccountModal(false)} />
                  </Suspense>
                )}
              </>
            )}
          </li>
        )}
        {message && (
          <Modal onBackdropClick={() => setMessage(null)}>
            <MessageWrapper message={message} />
          </Modal>
        )}
      </ul>
      <NavbarSearch />
    </React.Fragment>
  );
};

NavBar.propTypes = {
  menu: object,
  enableLogin: bool,
  isLoginOpen: bool
};

export { NavBar };
