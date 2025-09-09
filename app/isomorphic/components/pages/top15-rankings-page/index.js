import React from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function Top15RankingsPage({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const top15RankingsData = get(data, ["top15RankingsData"]);

  return (
    <div className="top15-rankings-page">
      <Helmet>
        <title>{`Top 15 Rankings - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`Top 15 rankings for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>Top 15 Rankings: {rankingEntitySlug}</h1>

        {top15RankingsData && (
          <Fortune500Ranking
            data={top15RankingsData}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
