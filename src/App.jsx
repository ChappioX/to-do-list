import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaTimes, FaCheck } from "react-icons/fa";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const API = "https://api.restful-api.dev/objects";
  const OWNER = "mytodolistapp";

  // Load Tasks from API
  useEffect(() => {
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        const taskList = data
          .filter(
            (obj) => obj.data?.type === "tasks" && obj.data?.owner === OWNER
          )
          .map((obj) => ({
            id: obj.id,
            name: obj.name,
            completed: obj.data?.completed ?? false,
          }));
        setTasks(taskList);
      })
      .catch((err) => {
        console.error("Error fetching objects:", err);
      });
  }, []);

  // Add Task
  const addTask = async () => {
    if (!newTask.trim()) return;

    const body = {
      name: newTask,
      data: {
        completed: false,
        type: "tasks",
        owner: OWNER,
      },
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const newObj = await res.json();

    const newTaskObj = {
      id: newObj.id,
      name: newObj.name,
      completed: newObj.data?.completed ?? false,
    };

    setTasks([...tasks, newTaskObj]);
    setNewTask("");
  };

  // toggle completed
  const toggleTask = async (task) => {
    const updatedBody = {
      name: task.name,
      data: {
        completed: !task.completed,
        type: "tasks",
        owner: OWNER,
      },
    };

    const res = await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBody),
    });

    const updatedObj = await res.json();

    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
              id: updatedObj.id,
              name: updatedObj.name,
              completed: updatedObj.data?.completed ?? false,
            }
          : t
      )
    );
  };

  // Start Editing
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.name);
  };

  // Save Edit
  const saveEdit = async (task) => {
    const updatedBody = {
      name: editingText,
      data: {
        completed: task.completed,
        type: "tasks",
        owner: OWNER,
      },
    };

    const res = await fetch(`${API}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedBody),
    });

    const updatedObj = await res.json();

    setTasks(
      tasks.map((t) =>
        t.id === task.id
          ? {
              id: updatedObj.id,
              name: updatedObj.name,
              completed: updatedObj.data?.completed ?? false,
            }
          : t
      )
    );

    setEditingId(null);
    setEditingText("");
  };

  // Delete Task
  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div>
      <h1 className="title">To Do List</h1>

      <div className="input-row">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter new task..."
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />

            {editingId === task.id ? (
              <>
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />

                <button
                  className="icon-btn icon-check"
                  onClick={() => saveEdit(task)}
                >
                  <FaCheck />
                </button>

                <button
                  className="icon-btn icon-cancel"
                  onClick={() => {
                    setEditingId(null);
                    setEditingText("");
                  }}
                >
                  <FaTimes />
                </button>
              </>
            ) : (
              <>
                <span
                  className={`task-name ${task.completed ? "completed" : ""}`}
                >
                  {task.name}
                </span>

                <button
                  className="icon-btn icon-edit"
                  onClick={() => startEdit(task)}
                >
                  <FaEdit />
                </button>
              </>
            )}

            <button
              className="icon-btn icon-delete"
              onClick={() => deleteTask(task.id)}
            >
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
