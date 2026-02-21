import { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000/api";

function App() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  const [taskForm, setTaskForm] = useState({ description: "", category: "" });
  const [categoryError, setCategoryError] = useState("");
  const [taskErrors, setTaskErrors] = useState({});
  const [loading, setLoading] = useState({
    categories: false,
    tasks: false,
    addCategory: false,
    addTask: false,
    updatingTaskId: null,
    deletingTaskId: null,
  });
  const [filterCategory, setFilterCategory] = useState("all");
  const [globalError, setGlobalError] = useState("");

  const fetchJson = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    });
    let body = null;
    try {
      body = await response.json();
    } catch (err) {
      body = null;
    }
    if (!response.ok) {
      const error = new Error("Request failed");
      error.status = response.status;
      error.data = body;
      throw error;
    }
    return body;
  };

  const refreshCategories = useCallback(async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    setGlobalError("");
    try {
      const data = await fetchJson("/categories/");
      setCategories(data);
    } catch (err) {
      setGlobalError("Impossible de charger les catégories.");
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    setLoading((prev) => ({ ...prev, tasks: true }));
    setGlobalError("");
    const filterQuery =
      filterCategory && filterCategory !== "all"
        ? `?category_id=${filterCategory}`
        : "";
    try {
      const data = await fetchJson(`/tasks/${filterQuery}`);
      setTasks(data);
    } catch (err) {
      setGlobalError("Impossible de charger les tâches.");
    } finally {
      setLoading((prev) => ({ ...prev, tasks: false }));
    }
  }, [filterCategory]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryError("");
    setLoading((prev) => ({ ...prev, addCategory: true }));
    try {
      const newCategory = await fetchJson("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: categoryForm.name.trim() }),
      });
      setCategories((prev) => [...prev, newCategory]);
      setCategoryForm({ name: "" });
    } catch (err) {
      const errorMessage = err?.data?.name?.join(" ") || "Création impossible.";
      setCategoryError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, addCategory: false }));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setTaskErrors({});
    setLoading((prev) => ({ ...prev, addTask: true }));
    try {
      const payload = {
        description: taskForm.description.trim(),
        category: taskForm.category ? Number(taskForm.category) : null,
      };
      const newTask = await fetchJson("/tasks/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setTasks((prev) => [newTask, ...prev]);
      setTaskForm({ description: "", category: "" });
    } catch (err) {
      setTaskErrors(err?.data || { detail: "Création impossible." });
    } finally {
      setLoading((prev) => ({ ...prev, addTask: false }));
    }
  };

  const handleToggleTask = async (taskId, currentValue) => {
    setLoading((prev) => ({ ...prev, updatingTaskId: taskId }));
    try {
      const updated = await fetchJson(`/tasks/${taskId}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_completed: !currentValue }),
      });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch {
      setGlobalError("Impossible de mettre à jour la tâche.");
    } finally {
      setLoading((prev) => ({ ...prev, updatingTaskId: null }));
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading((prev) => ({ ...prev, deletingTaskId: taskId }));
    try {
      await fetchJson(`/tasks/${taskId}/`, { method: "DELETE" });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch {
      setGlobalError("Impossible de supprimer la tâche.");
    } finally {
      setLoading((prev) => ({ ...prev, deletingTaskId: null }));
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Ma To-Do List par Catégories</h1>

        {globalError && <div className="alert error">{globalError}</div>}

        <form className="row" onSubmit={handleCreateCategory}>
          <input
            type="text"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            placeholder="Nouvelle catégorie"
            required
          />
          <button type="submit" disabled={loading.addCategory || !categoryForm.name.trim()}>
            {loading.addCategory ? "..." : "Ajouter catégorie"}
          </button>
        </form>
        {categoryError && <div className="feedback error-text">{categoryError}</div>}

        <div className="row select-row">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <form className="row" onSubmit={handleCreateTask}>
          <input
            type="text"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Nouvelle tâche"
            required
          />
          <select
            value={taskForm.category}
            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
            required
          >
            <option value="">Choisissez une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={
              loading.addTask || !taskForm.description.trim() || !taskForm.category
            }
          >
            {loading.addTask ? "..." : "Ajouter"}
          </button>
        </form>
        {taskErrors.description && (
          <div className="feedback error-text">{taskErrors.description.join(" ")}</div>
        )}
        {taskErrors.category && (
          <div className="feedback error-text">{taskErrors.category.join(" ")}</div>
        )}
        {taskErrors.detail && <div className="feedback error-text">{taskErrors.detail}</div>}

        <button
          type="button"
          className="danger"
          style={{ marginBottom: 12, fontSize: 12 }}
          onClick={() => {
            Sentry.captureException(new Error("Test Sentry error from React frontend!"));
            alert("Erreur de test envoyée à Sentry !");
          }}
        >
          Test Sentry
        </button>

        <div className="tasks">
          {loading.tasks && <p className="muted">Chargement...</p>}
          {!loading.tasks && tasks.length === 0 && (
            <p className="muted">Aucune tâche à afficher.</p>
          )}
          {!loading.tasks &&
            tasks.map((task) => (
              <div key={task.id} className="task-row">
                <label className="task-left">
                  <input
                    type="checkbox"
                    checked={task.is_completed}
                    onChange={() => handleToggleTask(task.id, task.is_completed)}
                    disabled={loading.updatingTaskId === task.id}
                  />
                  <span className={`task-text ${task.is_completed ? "done" : ""}`}>
                    {task.description} ({task.category_name || "Sans catégorie"})
                  </span>
                </label>
                <button
                  type="button"
                  className="danger"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={loading.deletingTaskId === task.id}
                >
                  Supprimer
                </button>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}

export default App;
