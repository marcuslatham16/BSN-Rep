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

  const tableBody = document.getElementById("projectsTableBody");
  const gridContainer = document.getElementById("projectsGrid");
  if (!tableBody || !gridContainer) return;

  tableBody.innerHTML = "";
  gridContainer.innerHTML = "";

  sortedProjects.forEach((project, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${project.name}</td>
      <td>${project.owner}</td>
      <td>${new Date(project.dateCreated).toLocaleDateString()}</td>
      <td><span class="status-badge status-${project.status}">${project.status}</span></td>
      <td><span class="permission-badge permission-${project.permission}">${project.permission}</span></td>
      <td><span class="coaching-badge ${project.coachingRequired ? "" : "inactive"}">✔</span></td>
      <td>${project.folders?.length || 0}</td>
      <td class="row-actions">
        <button class="row-action-btn action-edit" onclick="editProject(${index})"><span class="material-symbols-outlined">edit</span></button>
        <button class="row-action-btn action-delete" onclick="confirmDelete(${index})"><span class="material-symbols-outlined">delete</span></button>
      </td>
    `;
    tableBody.appendChild(row);

    const card = document.createElement("div");
    card.className = "project-card";
    card.innerHTML = `
      <div class="card-header">
        <div class="project-title">${project.name}</div>
        <div class="card-badges">
          ${project.coachingRequired ? `<div class="coaching-badge">✔</div>` : ""}
        </div>
        <div class="project-description">${project.description}</div>
      </div>
      <div class="card-content">
        <div class="project-info">
          <div class="info-row"><span class="info-label">Owner:</span><span class="info-value">${project.owner}</span></div>
          <div class="info-row"><span class="info-label">Status:</span><span class="info-value">${project.status}</span></div>
          <div class="info-row"><span class="info-label">Permission:</span><span class="info-value">${project.permission}</span></div>
        </div>
      </div>
      <div class="card-footer">
        <button class="view-project-btn">View Project</button>
      </div>
    `;
    gridContainer.appendChild(card);
  });
}

function renderFollowedProjects() {
  const container = document.getElementById("followedProjectsContainer");
  if (!container) return;
  container.innerHTML = "";
  const followed = projects.filter(p => p.following);
  if (followed.length === 0) {
    container.innerHTML = "<p>No followed projects.</p>";
    return;
  }
  followed.forEach(project => {
    const card = document.createElement("div");
    card.className = "followed-project-card";
    card.innerHTML = `<h4>${project.name}</h4><p>${project.description}</p>`;
    container.appendChild(card);
  });
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
