import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="btn btn-secondary theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span> {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
