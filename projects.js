let projects = [];
let editingIndex = null;

document.addEventListener("DOMContentLoaded", function () {
  loadProjects();
  renderProjects();

  document.getElementById("saveBtn").addEventListener("click", handleSaveProject);
  document.getElementById("createFolderBtn").addEventListener("click", handleCreateFolder);
  document.getElementById("cancelFolderBtn").addEventListener("click", () => {
    document.getElementById("folderDialog").close();
  });

  document.getElementById("fileInput").addEventListener("change", handleFileSelection);
  document.querySelector(".file-select-btn").addEventListener("click", () => {
    document.getElementById("fileInput").click();
  });

  document.getElementById("uploadFilesBtn").addEventListener("click", handleFileUpload);
  document.getElementById("cancelUploadBtn").addEventListener("click", () => {
    document.getElementById("fileUploadDialog").close();
  });

  if (document.getElementById("menu-toggle")) {
    document.getElementById("menu-toggle").addEventListener("click", toggleSidebar);
  }
});

function renderProjects() {
  const sortedProjects = sortProjects(projects);
  renderTableView(sortedProjects);
  renderGridView(sortedProjects);
  updateSortIndicators();
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
