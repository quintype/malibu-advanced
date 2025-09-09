import React from "react";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function GridView({ data, config }) {
  const rankings = get(data, ["rankings"], []);

  return (
    <div className="grid-view">
      <div className="rankings-grid">
        {rankings.map((ranking, index) => (
          <div key={index} className="ranking-card">
            <div className="rank-number">{index + 1}</div>
            <div className="ranking-content">
              <Fortune500Ranking
                data={ranking}
                config={config}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
