import React, { useEffect } from "react";
import { string, number } from "prop-types";
import { scriptLoader } from "../index";

const MetypeCommentsWidget = (props) => {
  const {
    primaryColor,
    host,
    accountId,
    className,
    secondaryColor,
    fontColor,
    pageURL,
    windowHeight,
    windowWidth,
    fontUrl,
    fontFamily,
    message = null,
    jwt,
    storyId,
  } = props;
  const randomNumber = storyId;

  const initWidget = () => {
    if (window.talktype && typeof window.talktype.commentWidgetIframe === "function") {
      jwt &&
        !message &&
        window.talktype.accountUserLogin({
          jwt: jwt,
        });
      window.talktype.commentWidgetIframe(document.getElementById(`metype-container-${randomNumber}`));
    }
  };

  useEffect(() => {
    if (window.talktype && typeof window.talktype.commentWidgetIframe === "function") {
      // Real implementation already loaded
      initWidget();
    } else if (window.talktype) {
      // Queue stub exists (from EJS feed widget) — wait for real implementation via queue
      window.talktype(function () {
        initWidget();
      });
    } else {
      // No talktype at all — load script ourselves
      scriptLoader(host, () => initWidget());
    }
  }, []);

  useEffect(() => {
    if (message !== null) {
      window.talktype.accountUserLogout();
      initWidget();
    }
  }, [message]);

  return (
    <div>
      <div
        id={`metype-container-${randomNumber}`}
        className={`iframe-container ${className || ""}`}
        data-metype-account-id={accountId}
        data-metype-host={host}
        data-metype-primary-color={primaryColor || "#3a9fdd"}
        data-metype-bg-color={secondaryColor || "transparent"}
        data-metype-font-color={fontColor || "#4a4a4a"}
        data-metype-window-width={windowWidth || (!global ? window.screen.width : 700)}
        data-metype-window-height={windowHeight || (!global ? window.screen.height : 700)}
        data-metype-page-url={pageURL}
        data-metype-font-url={fontUrl || ""}
        data-metype-font-family={fontFamily || ""}
      ></div>
    </div>
  );
};

MetypeCommentsWidget.propTypes = {
  primaryColor: string,
  host: string,
  accountId: string,
  className: string,
  secondaryColor: string,
  fontColor: string,
  pageURL: string,
  windowHeight: number,
  windowWidth: number,
  fontUrl: string,
  fontFamily: string,
  message: string,
  jwt: string,
  storyId: string,
};

export { MetypeCommentsWidget };
