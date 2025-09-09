import React from "react";
import { get } from "lodash";
import { Fortune500Ranking } from "../../arrow/components/Rows/Fortune500Ranking";

export function ListView({ data, config }) {
  const rankings = get(data, ["rankings"], []);

  return (
    <div className="list-view">
      <div className="rankings-list">
        {rankings.map((ranking, index) => (
          <div key={index} className="ranking-item">
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
