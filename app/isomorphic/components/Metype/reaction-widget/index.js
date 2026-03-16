import React, { useEffect } from "react";
import { scriptLoader } from "../index";

const MetypeReactionsWidget = (props) => {
  // eslint-disable-next-line react/prop-types
  const { accountId, host, storyUrl, storyId, fontUrl, fontFamily } = props;

  const initPageReactions = () => {
    const el = document.getElementById(`metype-page-reactions-container-${storyId}`);
    if (el && window.talktype && typeof window.talktype.pageReactionsIframe === "function") {
      window.talktype.pageReactionsIframe(el);
    }
  };

  useEffect(() => {
    if (window.talktype && window.talktype.pageReactionsIframe) {
      // Real implementation already loaded
      initPageReactions();
    } else if (window.talktype) {
      // Queue stub exists (from EJS feed widget) — wait for real implementation via queue
      window.talktype(function () {
        initPageReactions();
      });
    } else {
      // No talktype at all — load script ourselves
      scriptLoader(host, () => initPageReactions());
    }
  }, []);

  return (
    <div
      style={{ marginTop: "20px" }}
      id={`metype-page-reactions-container-${storyId}`}
      data-metype-account-id={accountId}
      data-metype-host={host}
      data-metype-page-url={storyUrl}
      data-metype-font-url={fontUrl || ""}
      data-metype-font-family={fontFamily || ""}
    ></div>
  );
};

export { MetypeReactionsWidget };
