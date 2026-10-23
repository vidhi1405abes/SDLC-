import React, { useEffect, useRef, useState } from "react";
import PrioritySelect, { PriorityBadge } from "./PrioritySelect";
import { EMPTY_TASK_MESSAGE, MAX_TASK_LENGTH } from "../utils/tasks";

function EditForm({ task, onSave, onCancel }) {
  const [text, setText] = useState(task.text);
  const [priority, setPriority] = useState(task.priority);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(EMPTY_TASK_MESSAGE);
      inputRef.current.focus();
      return;
    }
    onSave(task.id, { text: trimmed, priority });
  }

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  const inputId = `edit-${task.id}`;
  const errorId = `edit-error-${task.id}`;

  return (
    <form className="edit-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate>
      <div className="edit-row">
        <label htmlFor={inputId} className="visually-hidden">
          Edit task
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          className="text-input"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError("");
          }}
          maxLength={MAX_TASK_LENGTH}
          autoComplete="off"
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
        />
        <PrioritySelect id={`edit-priority-${task.id}`} value={priority} onChange={setPriority} />
      </div>
      <div className="item-actions">
        <button type="submit" className="btn btn-primary btn-small">
          Save
        </button>
        <button type="button" className="btn btn-secondary btn-small" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && (
        <p id={errorId} className="error-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default function TodoItem({
  task,
  isEditing,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) {
  const editButtonRef = useRef(null);
  const wasEditing = useRef(isEditing);

  // Return keyboard focus to the Edit button after saving or cancelling.
  useEffect(() => {
    if (wasEditing.current && !isEditing && editButtonRef.current) {
      editButtonRef.current.focus();
    }
    wasEditing.current = isEditing;
  }, [isEditing]);

  const className = `todo-item${task.completed ? " completed" : ""}${isEditing ? " editing" : ""}`;

  if (isEditing) {
    return (
      <li className={className}>
        <EditForm task={task} onSave={onSave} onCancel={onCancelEdit} />
      </li>
    );
  }

  const checkboxId = `toggle-${task.id}`;

  return (
    <li className={className}>
      <input
        id={checkboxId}
        type="checkbox"
        className="todo-checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <label
        htmlFor={checkboxId}
        className="todo-text"
        onDoubleClick={(event) => {
          event.preventDefault();
          onStartEdit(task.id);
        }}
        title="Double-click to edit"
      >
        {task.text}
      </label>
      <PriorityBadge priority={task.priority} />
      <div className="item-actions">
        <button
          type="button"
          ref={editButtonRef}
          className="btn btn-secondary btn-small"
          onClick={() => onStartEdit(task.id)}
          aria-label={`Edit "${task.text}"`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger btn-small"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete "${task.text}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
