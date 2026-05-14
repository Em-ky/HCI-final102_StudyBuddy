let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let history = JSON.parse(localStorage.getItem("history")) || [];

let currentFilter = "all";

// AUTH
let users =
  JSON.parse(localStorage.getItem("users")) || [];

function signUp() {

  let username =
    document.getElementById("username")
    .value.trim();

  let password =
    document.getElementById("password")
    .value.trim();

  if (username === "" || password === "") {

    alert("Please fill all fields.");

    return;
  }

  let existingUser = users.find(
    user => user.username === username
  );

  if (existingUser) {

    alert("Username already exists.");

    return;
  }

  users.push({
    username,
    password
  });

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

  alert("Account created successfully!");

  document.getElementById("username").value = "";

  document.getElementById("password").value = "";
}

function login() {

  let username =
    document.getElementById("username")
    .value.trim();

  let password =
    document.getElementById("password")
    .value.trim();

  let validUser = users.find(
    user =>
      user.username === username &&
      user.password === password
  );

  if (validUser) {

    localStorage.setItem(
      "currentUser",
      username
    );

    document.getElementById("auth")
      .style.display = "none";

    document.getElementById("home")
      .classList.add("active");

    renderTasks();

  } else {

    alert("Invalid username or password.");
  }
}

function logout() {

  localStorage.removeItem("currentUser");

  document.getElementById("home")
    .classList.remove("active");

  document.getElementById("auth")
    .style.display = "flex";

  document.getElementById("username").value = "";

  document.getElementById("password").value = "";
}

// DARK MODE
function toggleDarkMode() {

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
}

if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

// MODAL
function openModal() {
  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// SAVE
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function saveHistory() {
  localStorage.setItem("history", JSON.stringify(history));
}

// ADD TASK
function addTask() {

  let name =
    document.getElementById("taskInput")
    .value.trim();

  let due =
    document.getElementById("dateInput")
    .value;

  let priority =
    document.getElementById("priorityInput")
    .value;

  let category =
    document.getElementById("categoryInput")
    .value;

  if (name === "" || due === "") {

    alert("Please fill all fields.");

    return;
  }

  tasks.push({
    name,
    due: new Date(due).getTime(),
    priority,
    category,
    completed: false
  });

  tasks.sort((a, b) => a.due - b.due);

  saveTasks();

  renderTasks();

  closeModal();
}

function setFilter(filter) {

  currentFilter = filter;

  renderTasks();
}

// RENDER TASKS
function renderTasks() {

  let list =
    document.getElementById("taskList");

  let empty =
    document.getElementById("emptyState");

  let search =
    document.getElementById("searchInput")
    .value.toLowerCase();

  list.innerHTML = "";

  let filtered = tasks.filter(task => {

    let matchSearch =
      task.name.toLowerCase().includes(search);

    let overdue =
      task.due < Date.now() && !task.completed;

    if (currentFilter === "completed") {
      return task.completed && matchSearch;
    }

    if (currentFilter === "pending") {
      return !task.completed && !overdue && matchSearch;
    }

    if (currentFilter === "overdue") {
      return overdue && matchSearch;
    }

    return matchSearch;
  });

  if (filtered.length === 0) {

    empty.style.display = "block";

  } else {

    empty.style.display = "none";
  }

  filtered.forEach((task, index) => {

    let li = document.createElement("li");

    li.classList.add(`priority-${task.priority}`);

    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <div class="task-content">

        <strong>${task.name}</strong>

        <p>${task.category}</p>

        <small id="countdown-${index}">
          Loading...
        </small>

      </div>

      <div class="task-buttons">

        <button class="complete-btn"
          onclick="toggleComplete(${index})">
          Done
        </button>

        <button class="delete-btn"
          onclick="deleteTask(${index})">
          Delete
        </button>

      </div>
    `;

    list.appendChild(li);
  });

  updateDashboard();
}

function updateDashboard() {

  let completed =
    tasks.filter(t => t.completed).length;

  let pending =
    tasks.filter(t => !t.completed).length;

  let overdue =
    tasks.filter(
      t => t.due < Date.now() && !t.completed
    ).length;

  document.getElementById("taskCount")
    .innerText = `${tasks.length} Tasks`;

  document.getElementById("completedCount")
    .innerText = completed;

  document.getElementById("pendingCount")
    .innerText = pending;

  document.getElementById("overdueCount")
    .innerText = overdue;
}

// COMPLETE
function toggleComplete(index) {

  tasks[index].completed =
    !tasks[index].completed;

  if (tasks[index].completed) {

    history.push({
      name: tasks[index].name,
      status: "Completed",
      date: new Date().toLocaleString()
    });

    saveHistory();
  }

  saveTasks();

  renderTasks();
}

// DELETE
function deleteTask(index) {

  if (confirm("Delete this task?")) {

    history.push({
      name: tasks[index].name,
      status: "Deleted",
      date: new Date().toLocaleString()
    });

    saveHistory();

    tasks.splice(index, 1);

    saveTasks();

    renderTasks();
  }
}

// COUNTDOWN
function updateCountdowns() {

  tasks.forEach((task, index) => {

    let el =
      document.getElementById(`countdown-${index}`);

    if (!el) return;

    if (task.completed) {

      el.innerHTML = "Completed";

      return;
    }

    let distance =
      task.due - Date.now();

    if (distance < 0) {

      el.innerHTML = "Overdue";

      el.className = "overdue";

      return;
    }

    let d =
      Math.floor(distance /
      (1000 * 60 * 60 * 24));

    let h =
      Math.floor((distance /
      (1000 * 60 * 60)) % 24);

    let m =
      Math.floor((distance /
      (1000 * 60)) % 60);

    let s =
      Math.floor((distance /
      1000) % 60);

    el.innerHTML =
      `${d}d ${h}h ${m}m ${s}s`;

    if (distance < 60000) {
      el.className = "urgent";
    }
  });
}

// HISTORY
function toggleHistory() {

  let section =
    document.getElementById("historySection");

  if (section.style.display === "block") {

    section.style.display = "none";

  } else {

    section.style.display = "block";

    renderHistory();
  }
}

function renderHistory() {

  let list =
    document.getElementById("historyList");

  list.innerHTML = "";

  history.forEach(item => {

    let li = document.createElement("li");

    li.innerHTML = `
      <div class="task-content">

        <strong>${item.name}</strong>

        <small>
          ${item.status} • ${item.date}
        </small>

      </div>
    `;

    list.appendChild(li);
  });
}

// CLOSE MODAL
window.onclick = function(event) {

  let modal =
    document.getElementById("modal");

  if (event.target === modal) {
    closeModal();
  }
};

renderTasks();

setInterval(updateCountdowns, 1000);