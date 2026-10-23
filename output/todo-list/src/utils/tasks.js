export const EMPTY_TASK_MESSAGE = "Task cannot be empty";
export const MAX_TASK_LENGTH = 200;

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createTask(text, priority = "medium") {
  return {
    id: generateId(),
    text,
    completed: false,
    priority,
    createdAt: Date.now(),
  };
}

export function filterTasks(tasks, filter) {
  if (filter === "active") return tasks.filter((task) => !task.completed);
  if (filter === "completed") return tasks.filter((task) => task.completed);
  return tasks;
}

export function itemsLeftLabel(count) {
  return `${count} ${count === 1 ? "item" : "items"} left`;
}
