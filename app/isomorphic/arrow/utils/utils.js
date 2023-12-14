import get from "lodash/get";
import camelCase from "lodash.camelcase";
import kebabCase from "lodash.kebabcase";
import PropTypes from "prop-types";
import upperCase from "lodash/upperCase";
import Timeago from "react-timeago";
import React from "react";
import lowerCase from "lodash/lowerCase";
import { format, utcToZonedTime } from "date-fns-tz";
import { Dot } from "../components/Atoms/Dot/dot";
import { Divider } from "../components/Atoms/Divider/";
import { STORY_TEMPLATES } from "../constants";

const canUseDOM = !!(typeof window !== "undefined" && window.document && window.document.createElement);

export const sharePageUrl = canUseDOM && window.location.href;

export function truncate(string = "", limit = 60, ellipsis = true) {
  const putEllipsis = ellipsis ? " ..." : "";
  return typeof string === "string" && string.length > limit ? string.substring(0, limit) + putEllipsis : string;
}

export const timestampToFormat = (value, unit, suffix, timestamp, config = {}, languageCode = "en-IN") => {
  const {
    showTime = false,
    isTimeFirst = false,
    isUpperCase = false,
    disableMeridiem = false,
    dateFormat,
    localizedMeridiem,
    localizedMonths,
    direction = "ltr"
  } = config;

  const monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateTime = new Date(timestamp);
  const date = dateTime
    .getDate()
    .toString()
    .padStart(2, 0);
  const month = monthList[dateTime.getMonth()];
  let localizedMonth = month;

  if (isUpperCase) {
    localizedMonth = upperCase(month);
  }

  const year = dateTime.getFullYear();
  const rtlWithoutCustomLabels = direction === "rtl" && !localizedMeridiem && !localizedMonths;

  const timeWithLocalizedMeridiem = formatAMPM(timestamp, languageCode, config, isTimeFirst);

  let timetoShow = "";
  let rtlTimetoShow = "";

  if (showTime) {
    timetoShow = `, ${timeWithLocalizedMeridiem}`;
    if (isTimeFirst && rtlWithoutCustomLabels) {
      rtlTimetoShow = `${timeWithLocalizedMeridiem}`;
    } else rtlTimetoShow = `${timeWithLocalizedMeridiem} ,`;
  }

  if (localizedMonths) {
    localizedMonth = get(localizedMonths, [lowerCase(month)]) || month;
  }
  const localizedDate = date.toLocaleString(languageCode);
  const localizedYear = year.toLocaleString(languageCode).replace(/,/g, "");

  if (disableMeridiem) {
    return `${localizedMonth} ${localizedDate}, ${localizedYear}`;
  } else if (isTimeFirst) {
    if (rtlWithoutCustomLabels) {
      return `${localizedYear} ${localizedMonth} ${localizedDate}, ${rtlTimetoShow}`;
    }
    return `${timeWithLocalizedMeridiem}, ${localizedDate} ${localizedMonth} ${localizedYear}`;
  } else if (dateFormat === "mon-dd-yyyy") {
    if (rtlWithoutCustomLabels) {
      return `${rtlTimetoShow}${localizedYear} ,${localizedDate} ${localizedMonth}`;
    }
    return `${localizedMonth} ${localizedDate}, ${localizedYear}${timetoShow}`;
  } else {
    if (rtlWithoutCustomLabels) {
      return `${rtlTimetoShow}${localizedYear} ${localizedMonth} ${localizedDate}`;
    }
    return `${localizedDate} ${localizedMonth} ${localizedYear}${timetoShow}`;
  }
};

export function formatter(value, unit, suffix, date, config, languageCode, isLocalizedNumber, timeAgoFormat) {
  const showDateForUnits = ["day", "week", "month", "year"];
  // suffix here refers to ago
  // unit here refers to seconds, minute, minutes,...
  const localizedSuffix = get(config, ["localizedPublishTime", suffix]) || suffix;
  let localizedUnitOfTime;

  const localeDateLanguageCode = isLocalizedNumber ? languageCode : "en";

  const timeFormatObj = {
    time: value.toLocaleString(localeDateLanguageCode),
    unit: localizedUnitOfTime,
    ago: localizedSuffix,
    since: get(config, ["localizedPublishTime", "since"]) || "since"
  };

  const getFormattedDate = (timeFormat) => {
    const timeStr = timeAgoFormat.replace(/time|unit|ago|since/gi, (item) => timeFormat[item]);
    return monkeyPatchForArabic(timeStr);
  };

  if ((unit === "hour" && value > 23) || showDateForUnits.indexOf(unit) !== -1) {
    return timestampToFormat(value, unit, suffix, date, config, localeDateLanguageCode);
  } else if (value > 1) {
    localizedUnitOfTime = get(config, ["localizedPublishTime", `${unit}s`]) || `${unit}s`;
    timeFormatObj["unit"] = localizedUnitOfTime;
    return getFormattedDate(timeFormatObj);
  }
  localizedUnitOfTime = get(config, ["localizedPublishTime", unit]) || unit;
  timeFormatObj["unit"] = localizedUnitOfTime;

  return getFormattedDate(timeFormatObj);
}

function monkeyPatchForArabic(timeStr = "") {
  const replacements = {
    "منذ 2 ثواني": "منذ ثانيتان",
    "منذ 1 دقيقة": "منذ دقيقة",
    "منذ 2 دقائق": "منذ دقيقتان",
    "منذ 1 ساعة": "منذ ساعة",
    "منذ 2 ساعات": "منذ ساعتان"
  };
  const re = new RegExp(Object.keys(replacements).join("|"), "gi");
  const str = timeStr.replace(re, (match) => replacements[match]);
  return str;
}

function formatAMPM(timestamp, languageCode, config, isTimeFirst) {
  const { timeFormat = "12hours", localizedZeroToPad, direction = "ltr", localizedMonths, localizedMeridiem } = config;
  const dateTime = new Date(timestamp);

  if (timeFormat === "24hours") {
    //  'en-GB' formats the time in 24-hours format
    return dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  let hours = dateTime.getHours();
  let minutes = dateTime.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours || 12;
  const padZero = languageCode.startsWith("en") ? "0" : localizedZeroToPad;
  minutes = minutes < 10 ? padZero + minutes.toLocaleString(languageCode) : minutes.toLocaleString(languageCode);
  let updatedAmPm = ampm.toLocaleString(languageCode);

  if (localizedMeridiem) {
    const { am = "am", pm = "pm" } = localizedMeridiem;
    updatedAmPm = ampm.toLocaleString(languageCode) === "am" ? am : pm;
  }

  if (direction === "rtl" && !localizedMeridiem && !localizedMonths) {
    if (isTimeFirst) {
      const strTime = hours.toLocaleString(languageCode) + ":" + minutes + " " + updatedAmPm;
      return strTime;
    }
    const strTime = updatedAmPm + " " + hours.toLocaleString(languageCode) + ":" + minutes;
    return strTime;
  }
  const strTime = hours.toLocaleString(languageCode) + ":" + minutes + " " + updatedAmPm;
  return strTime;
}

export const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

export const getLuminanceOfColor = (hex) => {
  const { r, g, b } = hexToRGB(hex);
  return r * 0.299 + g * 0.587 + b * 0.114;
};

export const rgbToHex = (color = "rgba(255, 255, 255, 0)") => {
  let rgba = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
  return rgba && rgba.length === 4
    ? "#" +
        ("0" + parseInt(rgba[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgba[3], 10).toString(16)).slice(-2)
    : color;
};

const clientWidths = {
  mobile: 767,
  tablet: 1024
};

export const clientWidth = (device) => {
  const foundDeviceWidth = get(clientWidths, device);
  if (foundDeviceWidth) {
    return get(global, "document.documentElement.clientWidth") <= foundDeviceWidth;
  }
  return false;
};

export const getTextColor = (theme = "rgb(255,255,255)") => {
  const isRegexCheck = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(theme);
  const getHexValue = !isRegexCheck ? rgbToHex(theme) : theme;
  const textColor = getLuminanceOfColor(getHexValue) < 155 ? "light" : "dark";
  return textColor;
};

export function getNumberOfStoriesToShow(numberOfStoriesToShow) {
  return numberOfStoriesToShow ? parseInt(numberOfStoriesToShow) : 1;
}

export const getSlot = (type, component, storyCallback, collectionCallback) => {
  switch (type) {
    case "story":
      return storyCallback();
    case "collection":
      return collectionCallback();
    default:
      return component ? component() : null;
  }
};

export const getSlug = (collection, config = {}) => {
  const { magazineSlug = "", isArchivePage = false } = config;
  if (isArchivePage) {
    return `/magazine/archive/${magazineSlug}`;
  }
  if (magazineSlug) {
    return `/magazine/${magazineSlug}/${collection.slug}`;
  }
  const isSection = collection.template === "section";
  if (isSection) {
    const sectionId = get(collection, ["metadata", "section", "0", "id"], "");
    const { sections } = config;
    const section = sections && sections.find((section) => section.id === sectionId);
    return section ? section["section-url"] : "/";
  }
  return `/collection/${collection.slug}`;
};

export function isExternalStory(story = {}) {
  const { "story-template": storyTemplate = "", metadata = {} } = story;
  return storyTemplate === "news-elsewhere" ? get(metadata, ["reference-url"], "") : "";
}

// Adds target='_blank' attribute to anchor tags if not present
export const updateContentLinks = (content) => {
  let updatedContent = content;
  const anchorTagsList = content.match(/(<a).*?(>)/g);
  anchorTagsList &&
    anchorTagsList.forEach((anchorTag) => {
      const isTargetPresent = /target=/g.test(anchorTag);
      if (!isTargetPresent) {
        updatedContent = updatedContent.replace(
          anchorTag,
          `<a aria-label='content' target='_blank'${anchorTag.substring(2)}`
        );
      }
    });
  return updatedContent;
};

export const isEmpty = (value) => {
  return (
    value == null || // From standard.js: Always use === - but value == null is allowed to check null || undefined
    (typeof value === "object" && Object.entries(value).length === 0 && value.constructor === Object) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

export const shapeConfig = PropTypes.shape({
  "sketches-host": PropTypes.string,
  "cdn-name": PropTypes.string,
  "cdn-image": PropTypes.string
});

export const shapeStory = PropTypes.shape({
  headline: PropTypes.string,
  "last-published-at": PropTypes.number,
  subheadline: PropTypes.string
});

export const getStoryUrl = (story, defaultValue = "", queryParam = {}) => {
  const param = new URLSearchParams(queryParam);
  const searchParam = param.toString();
  if (get(story, ["story-template"]) === "news-elsewhere") {
    const referenceUrl = get(story, ["metadata", "reference-url"], "");
    return searchParam ? `${referenceUrl}?${searchParam}` : referenceUrl;
  }
  const storyUrl = story.url || defaultValue;
  return searchParam ? `${storyUrl}?${searchParam}` : storyUrl;
};

export const detectComponent = (component, adComponent, widgetComp) => {
  const { type } = component;
  switch (type) {
    case "ad":
      return adComponent(component);
    case "widget":
      return widgetComp(component);
    default:
      return null;
  }
};

export const facebookMobileVideoResizeFix = () => {
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
    const applyFixAfterTime = 3000;
    const aspectRatioAdjustmentFactor = 0.7;
    setTimeout(() => {
      document
        .querySelectorAll(".story-element-jsembed.story-element-jsembed-facebook-post span")
        .forEach((element) => {
          if (!element.classList.contains("fixed-mobile-fb-video")) {
            element.style.height = `${Math.ceil(element.offsetHeight * aspectRatioAdjustmentFactor)}px`;
            element.classList.add("fixed-mobile-fb-video");
          }
        });
    }, applyFixAfterTime);
  }
};

export const navigateTo = (dispatch, url = "") => {
  global.app.navigateToPage(dispatch, url);
};

export const generateNavigateSlug = (collection = {}, config = {}, customUrlPath) => {
  if (customUrlPath) {
    return customUrlPath;
  }
  const { magazineSlug = "", isArchivePage = false } = config;
  if (isArchivePage) {
    return `/magazine/archive/${magazineSlug}`;
  }
  if (magazineSlug) {
    return `/magazine/${magazineSlug}/${collection.slug}`;
  }
  if (collection) {
    return getSlug(collection, config);
  }
  return "/";
};

export const getCollectionData = async (collectionSlug, mountAtPrefix = "") => {
  try {
    const result = await (await fetch(
      `${mountAtPrefix}/api/v1/collections/${collectionSlug}?item-type=story&limit=6`
    )).json();
    return result;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

export function getAuthorTwitterUrl(author) {
  const twitterUrl = get(author, ["social", "twitter", "url"], null);
  const twitterHandle = get(author, ["social", "twitter", "handle"], null);

  if (!author) return "";

  if (twitterUrl) {
    return twitterUrl;
  }

  if (twitterHandle && twitterHandle.startsWith("@")) {
    return `https://www.twitter.com/${twitterHandle.slice(1)}`;
  }

  if (twitterHandle) {
    return `https://www.twitter.com/${twitterHandle}`;
  }

  return "";
}

export const getTimeStamp = (
  date,
  formatter,
  config = {},
  languageCode,
  template,
  timezone = null,
  isLocalizedNumber,
  timeAgoFormat = ""
) => {
  const isRelatedCollection = get(config, ["isRelatedCollection"], false);
  if (timezone && template === "story") {
    const zonedTime = timezone && utcToZonedTime(date, timezone);
    const formatZonedTime = zonedTime && format(zonedTime, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone });
    const localeDateLanguageCode = isLocalizedNumber ? languageCode : "en";
    const timeStamp = timestampToFormat("", "", "", date, config, localeDateLanguageCode);
    return <time dateTime={formatZonedTime}>{timeStamp}</time>;
  }

  return (
    <Timeago
      date={date}
      component={isRelatedCollection ? "div" : "time"}
      className="arr__timeago"
      formatter={(value, unit, suffix, date) => {
        return formatter(value, unit, suffix, date, config, languageCode, isLocalizedNumber, timeAgoFormat);
      }}
    />
  );
};

export function removeHtmlTags(str) {
  if (str === null || str === "") return false;
  else str = str.toString();

  return str.replace(/(<([^>]+)>)/gi, "");
}

export const getSeparator = (separator, textColor) => {
  if (separator === "divider") {
    return <Divider color={textColor} />;
  }
  return <Dot color={textColor} />;
};

export function getStoryTemplate(story, config) {
  const { "story-template": storyTemplate } = story;
  const isCustomStory = !STORY_TEMPLATES.includes(storyTemplate);
  const customStoryTemplate =
    isCustomStory && get(config, ["customStory", `${camelCase(storyTemplate)}-story`, "storyType"], "text");
  return isCustomStory ? kebabCase(customStoryTemplate) : storyTemplate;
}

export function getTimeStampConfig(qtConfig) {
  const { dateFormat = "dd-mon-yyyy", localization = {}, timeFormat } = get(
    qtConfig,
    ["pagebuilder-config", "general"],
    {}
  );
  const { enableLocalization = false, localizedElements = {} } = localization;

  const timeStampConfig = {
    isUpperCase: false,
    disableMeridiem: false,
    dateFormat,
    timeFormat,
    localizedMonths: enableLocalization && get(localizedElements, ["months"]),
    localizedMeridiem: enableLocalization && get(localizedElements, ["meridiem"], {}),
    enableLocalization
  };

  return timeStampConfig;
}
