const TASKS_KEY = "todo-list.tasks";
const THEME_KEY = "todo-list.theme";

export const PRIORITIES = ["low", "medium", "high"];

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    task.id.length > 0 &&
    typeof task.text === "string" &&
    task.text.trim().length > 0 &&
    typeof task.completed === "boolean" &&
    typeof task.createdAt === "number"
  );
}

function normalizeTask(task) {
  return {
    id: task.id,
    text: task.text.trim(),
    completed: task.completed,
    priority: PRIORITIES.includes(task.priority) ? task.priority : "medium",
    createdAt: task.createdAt,
  };
}

// Returns a clean array of tasks; anything invalid in storage yields [].
export function loadTasks() {
  try {
    const raw = window.localStorage.getItem(TASKS_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidTask).map(normalizeTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // Storage full or blocked: the app keeps working in memory.
  }
}

export function loadTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Fall through to the system preference.
  }
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore: the theme just won't persist.
  }
}
