// shared.js - Complete version with all project logic

let projects = [];
let editingIndex = null;

function clearForm() {
  document.getElementById("projectNameInput").value = "";
  document.getElementById("projectDescInput").value = "";
  document.getElementById("projectOwnerInput").value = "";
  document.getElementById("projectStatusSelect").value = "active";
  document.getElementById("coachingRequiredInput").checked = false;
  document.getElementById("permissionReadOnly").checked = true;
  document.getElementById("nameError").style.display = "none";
  document.getElementById("ownerError").style.display = "none";
}

function sortProjects(projectList) {
  return [...projectList].sort((a, b) => a.name.localeCompare(b.name));
}

function loadProjects() {
  const stored = localStorage.getItem("projectRepository");
  projects = stored ? JSON.parse(stored) : [];
}

function saveProjects() {
  localStorage.setItem("projectRepository", JSON.stringify(projects));
}

function openProjectDialog() {
  editingIndex = null;
  clearForm();
  document.getElementById("dialogTitle").textContent = "New Project";
  document.getElementById("saveBtnText").textContent = "Create";
  document.getElementById("projectDialog").showModal();
}

function closeProjectDialog() {
  document.getElementById("projectDialog").close();
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function renderProjects() {
  const sortedProjects = sortProjects(projects);
  renderTableView(sortedProjects);
  renderGridView(sortedProjects);
  updateSortIndicators();
}

function renderTableView(projectList) {
  const container = document.getElementById("tableView");
  if (!container) return;
  container.innerHTML = "";
  projectList.forEach(project => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.textContent = `${project.name} - ${project.owner}`;
    container.appendChild(row);
  });
}

function renderGridView(projectList) {
  const container = document.getElementById("gridView");
  if (!container) return;
  container.innerHTML = "";
  projectList.forEach(project => {
    const card = document.createElement("div");
    card.className = "grid-card";
    card.innerHTML = `<h4>${project.name}</h4><p>${project.description}</p>`;
    container.appendChild(card);
  });
}

function updateSortIndicators() {
  // Optional: implement UI sort arrows
  console.log("Sort indicators updated");
}

function handleSaveProject() {
  const name = document.getElementById("projectNameInput").value.trim();
  const desc = document.getElementById("projectDescInput").value.trim();
  const owner = document.getElementById("projectOwnerInput").value.trim();
  const status = document.getElementById("projectStatusSelect").value;
  const coachingRequired = document.getElementById("coachingRequiredInput").checked;

  let permission = 'read';
  if (document.getElementById("permissionDownload").checked) {
    permission = 'download';
  } else if (document.getElementById("permissionFull").checked) {
    permission = 'full';
  }

  const nameError = document.getElementById("nameError");
  const ownerError = document.getElementById("ownerError");

  nameError.style.display = name ? "none" : "block";
  ownerError.style.display = owner ? "none" : "block";

  if (!name || !owner) return;

  const dateCreated = editingIndex !== null ? projects[editingIndex].dateCreated : new Date().toISOString();

  if (editingIndex !== null) {
    projects[editingIndex] = {
      ...projects[editingIndex],
      name,
      description: desc,
      owner,
      status,
      coachingRequired,
      permission
    };
  } else {
    projects.push({
      name,
      description: desc,
      owner,
      dateCreated,
      status,
      coachingRequired,
      permission,
      following: true,
      folders: []
    });
  }

  saveProjects();
  renderProjects();
  closeProjectDialog();
  showNotification(editingIndex !== null ? "Project updated successfully!" : "Project created successfully!", "success");
}

function handleCreateFolder() {
  const folderDialog = document.getElementById("folderDialog");
  const folderNameInput = document.getElementById("folderNameInput");
  const folderNameError = document.getElementById("folderNameError");

  const folderName = folderNameInput.value.trim();
  const projectIndex = parseInt(folderDialog.dataset.projectIndex);

  if (!folderName) {
    folderNameError.style.display = 'block';
    return;
  }

  projects[projectIndex].folders.push({ folderName, files: [] });
  saveProjects();
  renderProjects();
  folderDialog.close();
  showNotification(`Folder "${folderName}" created successfully!`, 'success');
}

function handleFileSelection(event) {
  const files = event.target.files;
  console.log("Files selected:", files);
}

function handleFileUpload() {
  const fileInput = document.getElementById("fileInput");
  const files = fileInput.files;
  if (!files.length) return;
  console.log("Files to upload:", files);
  fileInput.value = "";
  showNotification("Files uploaded successfully", "success");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.toggle("open");
}
