import React from "react";
import { PRIORITIES } from "../utils/storage";

const LABELS = { low: "Low", medium: "Medium", high: "High" };

export default function PrioritySelect({ id, value, onChange }) {
  return (
    <>
      <label htmlFor={id} className="visually-hidden">
        Priority
      </label>
      <select
        id={id}
        className="priority-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {PRIORITIES.map((priority) => (
          <option key={priority} value={priority}>
            {LABELS[priority]}
          </option>
        ))}
      </select>
    </>
  );
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{LABELS[priority]}</span>;
}
