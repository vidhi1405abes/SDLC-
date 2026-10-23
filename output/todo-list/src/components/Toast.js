import React from "react";

export default function Toast({ message, onUndo }) {
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      <button type="button" className="btn btn-link toast-undo" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}
