/* To-Do List – JavaScript functionality */

(function () {
  "use strict";

  // ---------- DOM references ----------
  const form        = document.getElementById("taskForm");
  const input       = document.getElementById("taskInput");
  const errorMsg    = document.getElementById("errorMsg");
  const list        = document.getElementById("taskList");
  const emptyMsg    = document.getElementById("emptyMsg");
  const counter     = document.getElementById("taskCounter");
  const clearBtn    = document.getElementById("clearBtn");
  const filterBtns  = document.querySelectorAll(".filter-btn");

  // ---------- State ----------
  const STORAGE_KEY = "todoList.tasks";
  let tasks = loadTasks();          // [{ id, text, completed }]
  let currentFilter = "all";        // "all" | "active" | "completed"

  // ---------- Local Storage (optional challenge) ----------
  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* storage unavailable – app still works in memory */
    }
  }

  // ---------- Validation helpers ----------
  function showError(message) {
    errorMsg.textContent = message;
    input.classList.add("is-invalid");
  }

  function clearError() {
    input.classList.remove("is-invalid");
  }

  // ---------- Task actions ----------
  function addTask(text) {
    tasks.push({ id: Date.now() + Math.random(), text: text, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = tasks.find(function (t) { return t.id === id; });
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(function (t) { return !t.completed; });
    saveTasks();
    render();
  }

  // ---------- Rendering ----------
  function getVisibleTasks() {
    if (currentFilter === "active")    return tasks.filter(function (t) { return !t.completed; });
    if (currentFilter === "completed") return tasks.filter(function (t) { return t.completed; });
    return tasks;
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "list-group-item task-item" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.id = "task-" + task.id;
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");
    checkbox.addEventListener("change", function () { toggleTask(task.id); });

    const label = document.createElement("label");
    label.className = "task-text";
    label.htmlFor = checkbox.id;
    label.textContent = task.text;           // textContent prevents HTML injection

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", function () { deleteTask(task.id); });

    li.append(checkbox, label, delBtn);
    return li;
  }

  function render() {
    // Task list
    const visible = getVisibleTasks();
    list.innerHTML = "";
    visible.forEach(function (task) { list.appendChild(createTaskElement(task)); });

    // Empty-state message
    if (visible.length === 0) {
      if (tasks.length === 0) {
        emptyMsg.textContent = "No tasks yet. Add your first task!";
      } else if (currentFilter === "active") {
        emptyMsg.textContent = "No active tasks. Nice work!";
      } else {
        emptyMsg.textContent = "No completed tasks yet.";
      }
      emptyMsg.classList.remove("d-none");
    } else {
      emptyMsg.classList.add("d-none");
    }

    // Counter (incomplete tasks)
    const remaining = tasks.filter(function (t) { return !t.completed; }).length;
    counter.textContent = remaining + " remaining";

    // Clear Completed only makes sense when something is completed
    clearBtn.disabled = !tasks.some(function (t) { return t.completed; });

    // Filter button styles
    filterBtns.forEach(function (btn) {
      const isActive = btn.dataset.filter === currentFilter;
      btn.classList.toggle("btn-primary", isActive);
      btn.classList.toggle("btn-outline-primary", !isActive);
      btn.setAttribute("aria-pressed", isActive);
    });
  }

  // ---------- Event listeners ----------
  form.addEventListener("submit", function (event) {
    event.preventDefault();                  // no page reload
    const text = input.value.trim();

    if (text === "") {
      showError("Please enter a task. It cannot be empty or only spaces.");
      input.focus();
      return;
    }

    clearError();
    addTask(text);
    input.value = "";                        // clear input after success
    input.focus();
  });

  input.addEventListener("input", clearError);

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", clearCompleted);

  // ---------- Start ----------
  render();
})();