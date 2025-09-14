// Simple in-memory todo store
let todos = [];
let nextTodoId = 1;

export const getTodos = async () => {
  return [...todos];
};

export const getTodosForDate = async (date) => {
  const targetDate = new Date(date).toDateString();
  return todos.filter(
    (todo) => new Date(todo.dueDate).toDateString() === targetDate
  );
};

export const createTodo = async (todo) => {
  const newTodo = {
    id: nextTodoId++,
    title: todo.title,
    description: todo.description || null,
    dueDate: todo.dueDate,
    completed: false,
    priority: todo.priority || "medium", // low, medium, high
    category: todo.category || "general", // general, follow-up, birthday, etc.
    personId: todo.personId || null, // link to a person if relevant
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  todos.push(newTodo);
  return newTodo.id;
};

export const updateTodo = async (id, updates) => {
  const todoIndex = todos.findIndex((t) => t.id === id);
  if (todoIndex !== -1) {
    todos[todoIndex] = {
      ...todos[todoIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return todos[todoIndex];
  }
  return null;
};

export const deleteTodo = async (id) => {
  todos = todos.filter((t) => t.id !== id);
  return true;
};

export const toggleTodoComplete = async (id) => {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    todo.updated_at = new Date().toISOString();
    return todo;
  }
  return null;
};

// Get todos for tomorrow
export const getTodosForTomorrow = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTodosForDate(tomorrow);
};
