import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";
import { ListView } from "./list-view";
import { GridView } from "./grid-view";
import { YearDropDown } from "./year-drop-down";

export function MpwDetailPage({ data, pageType, config }) {
  const rankingEntitySlug = get(data, ["rankingEntitySlug"]);
  const mpwDetailData = get(data, ["mpwDetailData"]);
  const [viewType, setViewType] = useState("list");
  const [selectedYear, setSelectedYear] = useState("2024");

  return (
    <div className="mpw-detail-page">
      <Helmet>
        <title>{`MPW Detail - ${rankingEntitySlug}`}</title>
        <meta name="description" content={`MPW Detail rankings for ${rankingEntitySlug}`} />
      </Helmet>

      <div className="rankings-container">
        <h1>MPW Detail: {rankingEntitySlug}</h1>

        <div className="controls">
          <YearDropDown
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />

          <div className="view-toggle">
            <button
              className={viewType === "list" ? "active" : ""}
              onClick={() => setViewType("list")}
            >
              List View
            </button>
            <button
              className={viewType === "grid" ? "active" : ""}
              onClick={() => setViewType("grid")}
            >
              Grid View
            </button>
          </div>
        </div>

        {mpwDetailData && (
          <>
            {viewType === "list" ? (
              <ListView data={mpwDetailData} config={config} />
            ) : (
              <GridView data={mpwDetailData} config={config} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
