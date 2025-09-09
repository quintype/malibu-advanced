import React from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function BestBSchoolsPage({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const bestBSchoolsPageData = get(data, ["bestBSchoolsPageData"]);

  return (
    <div className="best-b-schools-page">
      <Helmet>
        <title>{`Best B-Schools - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`Best B-Schools rankings for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>Best B-Schools: {rankingEntitySlug}</h1>

        {bestBSchoolsPageData && (
          <Fortune500Ranking
            data={bestBSchoolsPageData}
            config={config}
          />
        )}
      </div>
    </div>
  );
}
