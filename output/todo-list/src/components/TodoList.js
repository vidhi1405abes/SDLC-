import React from "react";
import TodoItem from "./TodoItem";

const FILTER_EMPTY_MESSAGES = {
  active: "No active tasks.",
  completed: "No completed tasks.",
};

export default function TodoList({
  tasks,
  totalCount,
  filter,
  editingId,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}) {
  if (totalCount === 0) {
    return <p className="empty-state">No tasks yet. Add one above!</p>;
  }

  if (tasks.length === 0) {
    return <p className="empty-state">{FILTER_EMPTY_MESSAGES[filter]}</p>;
  }

  return (
    <ul className="todo-list">
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          isEditing={task.id === editingId}
          onToggle={onToggle}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
