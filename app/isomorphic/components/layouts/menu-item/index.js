import React from "react";
import PT from "prop-types";
import { Link } from "@quintype/components";
import { useSelector } from "react-redux";
import get from "lodash/get";
import "./menu-item.m.css";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";

function MenuItem({ item, toggleHandler, menuStyle = "menu-link" }) {
  const iconCode = get(item, ["data", "icon-code"]) || "";
  let getIconStyle;
  switch (iconCode) {
    case "new-label":
      getIconStyle = "new-svg";
      break;
    case "trending":
      getIconStyle = "trending-svg";
      break;
    case "app-download":
      getIconStyle = "download-svg";
      break;
    default:
      getIconStyle = "";
  }
  const dubaiTemperature = useSelector((state) => get(state, ["dubaiWeather", "temperature"], ""));

  if (item["item-type"] === "placeholder") {
    return <span styleName="menu-link">{item.title}</span>;
  } else if (item["item-type"] === "link") {
    return (
      <a
        styleName={menuStyle}
        onClick={toggleHandler}
        className={menuStyle}
        target="_blank"
        rel="noopener noreferrer"
        href={item.completeUrl || "/"}
      >
        {item.title === "DUBAI" ? (
          <span>
            {item.title} {dubaiTemperature}
          </span>
        ) : (
          <>
            <span>{item.title}</span>
            {iconCode && (
              <span styleName={getIconStyle}>
                <SvgIconHandler type={iconCode} width="24px" height="24px" viewBox="0 0 24 24" />
              </span>
            )}
          </>
        )}
      </a>
    );
  } else {
    return (
      <Link
        styleName={menuStyle}
        aria-label="menu-item"
        callback={toggleHandler}
        className={menuStyle}
        href={item.completeUrl || "/"}
      >
        {item.title === "DUBAI" ? (
          <span>
            ${item.title} ${dubaiTemperature}
          </span>
        ) : (
          <>
            <span>{item.title}</span>
            {iconCode && (
              <span styleName={getIconStyle}>
                <SvgIconHandler type={iconCode} width="24px" height="24px" viewBox="0 0 24 24" />
              </span>
            )}
          </>
        )}
      </Link>
    );
  }
}

export default MenuItem;

MenuItem.propTypes = {
  item: PT.object,
  showIcon: PT.bool,
  toggleHandler: PT.func,
  menuStyle: PT.string,
  changeTextColor: PT.bool,
  changeTextWeight: PT.bool,
  temperature: PT.string,
};

export { MenuItem };
