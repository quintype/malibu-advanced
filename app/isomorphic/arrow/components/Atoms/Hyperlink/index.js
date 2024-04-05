import { Link } from "@quintype/components";
import React from "react";
import PropTypes from "prop-types";
import { HyperLinkIcon } from "../../Svgs/hyperlink";
import "./hyperlink.m.css";

export const HyperLink = ({ hyperLink = "" }) => {
  if (!hyperLink) return null;
  return (
    <Link
      href={hyperLink}
      aria-label="hyperlink-button"
      className="arr--hyperlink-button"
      target="_blank"
      rel="noopener noreferrer"
      styleName="hyperlink-button">
      <HyperLinkIcon />
    </Link>
  );
};

HyperLink.propTypes = {
  hyperLink: PropTypes.string
};
