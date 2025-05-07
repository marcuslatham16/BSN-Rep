// projects.js
const STORAGE_KEY = "projectRepository";
let projects = [];
let editingIndex = null;
let currentView = "table";
let currentSort = { column: "name", direction: "asc" };

function loadProjects() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    projects = JSON.parse(stored);
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

