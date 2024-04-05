import React from "react";
import { connect } from "react-redux";
import { PropTypes } from "prop-types";
import { Link } from "@quintype/components";
import { useStateValue } from "../../SharedContext";
import get from "lodash.get";
import { getTextColor, getSlug, rgbToHex, clientWidth } from "../../../utils/utils";

import "./collection-name.m.css";

export const CollectionNameBase = ({
  collectionNameBorderColor = "",
  collection,
  config,
  collectionNameTemplate,
  headerLevel,
  customCollectionName = "",
  navigate = true,
}) => {
  const collectionTitle = useStateValue() || {};
  const showRowTitle = get(collectionTitle, ["showRowTitle"], true);
  const supportedTemplates = ["borderLeft", "borderBottom", "crossLine", "borderBottomFull"];
  const templateStyle = supportedTemplates.includes(collectionNameTemplate)
    ? ` collection-${collectionNameTemplate}`
    : "";
  const slug = (navigate && collection && getSlug(collection, config)) || "";
  const collectionName = customCollectionName || collection.name || "";
  const textColor = getTextColor(collectionTitle.theme);
  const HeaderTag = "h" + headerLevel;
  const CollectionNameBorderColor = rgbToHex(collectionNameBorderColor);

  const borderBottomFullStyle = templateStyle.includes("collection-borderBottomFull")
    ? `4px solid ${CollectionNameBorderColor}`
    : "none";

  const borderBottomStyle = () => {
    return templateStyle.includes("collection-borderBottom") &&
      !templateStyle.includes("collection-borderBottomFull") ? (
      <div
        styleName="border-bottom"
        style={{
          borderBottom: CollectionNameBorderColor ? `4px solid ${CollectionNameBorderColor}` : "none",
        }}
      ></div>
    ) : (
      ""
    );
  };

  const isMobile = clientWidth("mobile");

  const getBorderHeight = () => {
    if (isMobile) {
      switch (headerLevel) {
        case "1":
          return "32px";
        case "2":
          return "24px";
        case "3":
          return "20px";
        case "4":
          return "18px";
        case "5":
          return "16px";
        case "6":
          return "16px";
        default:
          return "20px";
      }
    }
    switch (headerLevel) {
      case "1":
        return "40px";
      case "2":
        return "32px";
      case "3":
        return "24px";
      case "4":
        return "20px";
      case "5":
        return "18px";
      case "6":
        return "16px";
      default:
        return "24px";
    }
  };

  return (
    <>
      {showRowTitle && collectionName && (
        <div
          className={`arr--collection-name arrow-component ${templateStyle}`}
          styleName={`collection ${templateStyle} ${textColor}`}
          style={{
            borderBottom: borderBottomFullStyle,
          }}
          data-test-id="collection-name"
        >
          {templateStyle.includes("collection-borderLeft") && (
            <span
              styleName="border-left"
              className="arr-collection-name-border-left"
              style={{
                color: CollectionNameBorderColor || "initial",
                fontSize: getBorderHeight(),
              }}
            ></span>
          )}
          {slug && !slug.includes(undefined) ? (
            <Link href={slug} aria-label="collection-name">
              <HeaderTag>{collectionName}</HeaderTag>
            </Link>
          ) : (
            <HeaderTag>{collectionName}</HeaderTag>
          )}
          {borderBottomStyle()}
        </div>
      )}
    </>
  );
};

CollectionNameBase.propTypes = {
  /** Collection name border color */
  collectionNameBorderColor: PropTypes.string,
  /** The Collection Object from the API response */
  collection: PropTypes.object,
  /** The publisher config from the API response */
  config: PropTypes.object,
  /** The style template for the component  */
  collectionNameTemplate: PropTypes.oneOf(["", "borderLeft", "borderBottom", "crossLine", "borderBottomFull"]),
  /** Header tags ranging h1-h6, where h[headerLevel] */
  headerLevel: PropTypes.string,
  customCollectionName: PropTypes.string,
  navigate: PropTypes.bool,
};

CollectionNameBase.defaultProps = {
  collectionNameTemplate: "",
  headerLevel: "2",
};

function mapStateToProps(state) {
  return {
    config: get(state, ["qt", "config"], {}),
  };
}

export const CollectionName = connect(mapStateToProps)(CollectionNameBase);
