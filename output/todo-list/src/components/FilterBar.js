import React from "react";
import { itemsLeftLabel } from "../utils/tasks";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function FilterBar({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
}) {
  return (
    <footer className="filter-bar">
      <span className="items-left" aria-live="polite">
        {itemsLeftLabel(activeCount)}
      </span>
      <div className="filters" role="group" aria-label="Filter tasks">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`btn btn-filter${filter === value ? " selected" : ""}`}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {completedCount > 0 && (
        <button type="button" className="btn btn-link" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
}
