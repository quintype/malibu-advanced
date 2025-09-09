import React from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function RankingsTablePage({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const rankingsTableData = get(data, ["rankingsTableData"]);

  return (
    <div className="rankings-table-page">
      <Helmet>
        <title>{`Rankings Table - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`Rankings table for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>Rankings Table: {rankingEntitySlug}</h1>

        {rankingsTableData && (
          <Fortune500Ranking
            data={rankingsTableData}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
