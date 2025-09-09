import React from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function TopBillionairesPage({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const top100BillionairesData = get(data, ["top100BillionairesData"]);

  return (
    <div className="top-billionaires-page">
      <Helmet>
        <title>{`Top Billionaires - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`Top billionaires rankings for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>Top Billionaires: {rankingEntitySlug}</h1>

        {top100BillionairesData && (
          <Fortune500Ranking
            data={top100BillionairesData}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
