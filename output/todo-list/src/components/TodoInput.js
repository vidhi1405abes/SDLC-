import React, { useRef, useState } from "react";
import PrioritySelect from "./PrioritySelect";
import { EMPTY_TASK_MESSAGE, MAX_TASK_LENGTH } from "../utils/tasks";

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError(EMPTY_TASK_MESSAGE);
      inputRef.current.focus();
      return;
    }
    onAdd(trimmed, priority);
    setText("");
    setPriority("medium");
    setError("");
    inputRef.current.focus();
  }

  function handleChange(event) {
    setText(event.target.value);
    if (error) setError("");
  }

  return (
    <form className="todo-input" onSubmit={handleSubmit} noValidate>
      <div className="todo-input-row">
        <label htmlFor="new-task" className="visually-hidden">
          New task
        </label>
        <input
          id="new-task"
          ref={inputRef}
          type="text"
          className="text-input"
          placeholder="What needs to be done?"
          value={text}
          onChange={handleChange}
          maxLength={MAX_TASK_LENGTH}
          autoComplete="off"
          autoFocus
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "new-task-error" : undefined}
        />
        <PrioritySelect id="new-task-priority" value={priority} onChange={setPriority} />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </div>
      {error && (
        <p id="new-task-error" className="error-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
