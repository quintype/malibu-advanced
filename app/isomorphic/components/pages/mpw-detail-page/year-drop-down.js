import React from "react";

export function YearDropDown({ selectedYear, onYearChange }) {
  const years = ["2024", "2023", "2022", "2021", "2020"];

  return (
    <div className="year-dropdown">
      <label htmlFor="year-select">Select Year:</label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
      >
        {years.map(year => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}
