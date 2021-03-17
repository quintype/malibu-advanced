import React from "react";
import { func, object, bool } from "prop-types";
import ReactModal from "react-modal";

import { CloseIcon } from "../../icons/CloseIcon";

import "./modal.m.css";

const Modal = ({ onClose, children, hideCloseIcon }) => {
  return (
    <ReactModal className="malibu-modal" overlayClassName="modal-backdrop" isOpen={true} onRequestClose={onClose}>
      <div className="modal-content">
        {children}
        {!hideCloseIcon && (
          <button aria-label="close-button" styleName="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        )}
      </div>
    </ReactModal>
  );
};

Modal.propTypes = {
  onClose: func,
  children: object,
  hideCloseIcon: bool
};

export default Modal;
