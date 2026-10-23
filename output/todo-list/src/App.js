import React, { useEffect, useState } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import FilterBar from "./components/FilterBar";
import ThemeToggle from "./components/ThemeToggle";
import Toast from "./components/Toast";
import { loadTasks, saveTasks, loadTheme, saveTheme } from "./utils/storage";
import { createTask, filterTasks } from "./utils/tasks";

const UNDO_TIMEOUT_MS = 5000;

// Re-inserts removed tasks at their original indexes, skipping any already present.
function restoreTasks(currentTasks, removed) {
  const restored = [...currentTasks];
  const presentIds = new Set(currentTasks.map((task) => task.id));
  removed
    .filter(({ task }) => !presentIds.has(task.id))
    .sort((a, b) => a.index - b.index)
    .forEach(({ task, index }) => {
      restored.splice(Math.min(index, restored.length), 0, task);
    });
  return restored;
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [theme, setTheme] = useState(loadTheme);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), UNDO_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const visibleTasks = filterTasks(tasks, filter);
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;
  const allCompleted = tasks.length > 0 && activeCount === 0;

  function addTask(text, priority) {
    setTasks((prev) => [createTask(text, priority), ...prev]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task))
    );
  }

  function updateTask(id, changes) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...changes } : task)));
    setEditingId(null);
  }

  function removeTasks(shouldRemove, message) {
    const removed = tasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => shouldRemove(task));
    if (removed.length === 0) return;
    setTasks((prev) => prev.filter((task) => !shouldRemove(task)));
    if (removed.some(({ task }) => task.id === editingId)) setEditingId(null);
    setToast({ id: Date.now(), message, removed });
  }

  function deleteTask(id) {
    removeTasks((task) => task.id === id, "Task deleted");
  }

  function clearCompleted() {
    const label = completedCount === 1 ? "completed task" : "completed tasks";
    removeTasks((task) => task.completed, `${completedCount} ${label} cleared`);
  }

  function undoRemove() {
    if (!toast) return;
    setTasks((prev) => restoreTasks(prev, toast.removed));
    setToast(null);
  }

  function toggleAll() {
    const nextCompleted = !allCompleted;
    setTasks((prev) => prev.map((task) => ({ ...task, completed: nextCompleted })));
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    saveTheme(nextTheme);
  }

  return (
    <div className="app">
      <main className="card">
        <header className="app-header">
          <h1>To-Do List</h1>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        <TodoInput onAdd={addTask} />

        {tasks.length > 0 && (
          <div className="toolbar">
            <button type="button" className="btn btn-secondary" onClick={toggleAll}>
              {allCompleted ? "Mark all active" : "Mark all complete"}
            </button>
          </div>
        )}

        <TodoList
          tasks={visibleTasks}
          totalCount={tasks.length}
          filter={filter}
          editingId={editingId}
          onToggle={toggleTask}
          onStartEdit={setEditingId}
          onCancelEdit={() => setEditingId(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />

        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          activeCount={activeCount}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />
      </main>

      {toast && <Toast key={toast.id} message={toast.message} onUndo={undoRemove} />}
    </div>
  );
}
