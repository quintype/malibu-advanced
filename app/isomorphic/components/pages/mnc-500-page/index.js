import React from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function Mnc500Page({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const mnc500PageData = get(data, ["mnc500PageData"]);

  return (
    <div className="mnc-500-page">
      <Helmet>
        <title>{`MNC 500 - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`MNC 500 rankings for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>MNC 500: {rankingEntitySlug}</h1>

        {mnc500PageData && (
          <Fortune500Ranking
            data={mnc500PageData}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
