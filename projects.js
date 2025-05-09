// Storage key for projects data
const STORAGE_KEY = "projectRepository";
let projects = [];
let editingIndex = null;
let currentView = "table";
let currentSort = { column: "name", direction: "asc" };

/**
 * Formats a file size in bytes to a human-readable format
 * @param {number} bytes - The file size in bytes
 * @returns {string} - Human-readable file size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, etc.)
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  notification.innerHTML = `
    <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Set initial opacity for animation
  notification.style.opacity = '1';
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

/**
 * Loads projects from localStorage or initializes with sample data if none exists
 */
function loadProjects() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    projects = JSON.parse(data);
  } else {
    // Add sample projects for first-time users
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const lastWeek = new Date(Date.now() - 604800000).toISOString();
    
    projects = [
      {
        name: "Marketing Campaign",
        description: "Files and assets for Q2 marketing campaign",
        owner: "Sarah Johnson",
        dateCreated: now,
        status: "active",
        coachingRequired: true,
        permission: "readOnly",
        following: true,
        folders: [
          {
            folderName: "Social Media",
            files: ["facebook_ad.png", "instagram_post.psd", "twitter_banner.jpg"]
          },
          {
            folderName: "Print Materials",
            files: ["brochure.pdf", "flyer.pdf", "poster.ai"]
          }
        ]
      },
      {
        name: "Product Launch",
        description: "Documentation for the new product line",
        owner: "Michael Chen",
        dateCreated: yesterday,
        status: "pending",
        coachingRequired: false,
        permission: "download",
        following: false,
        folders: [
          {
            folderName: "Research",
            files: ["market_analysis.pdf", "competitor_review.docx"]
          },
          {
            folderName: "Specifications",
            files: ["product_spec.pdf", "technical_details.xlsx"]
          }
        ]
      },
      {
        name: "Website Redesign",
        description: "Assets and documentation for the company website refresh",
        owner: "Alex Wong",
        dateCreated: lastWeek,
        status: "completed",
        coachingRequired: true,
        permission: "full",
        following: true,
        folders: [
          {
            folderName: "Mockups",
            files: ["homepage.png", "about_page.png", "contact_page.png"]
          },
          {
            folderName: "Assets",
            files: ["logo.svg", "hero_image.jpg", "icons.ai"]
          },
          {
            folderName: "Code",
            files: ["index.html", "style.css", "script.js"]
          }
        ]
      },
      {
        name: "Annual Report 2024",
        description: "Financial reports and presentation materials",
        owner: "Emma Rodriguez",
        dateCreated: lastWeek,
        status: "archived",
        coachingRequired: false,
        permission: "read",
        following: false,
        folders: [
          {
            folderName: "Financial Data",
            files: ["q1_report.xlsx", "q2_report.xlsx", "q3_report.xlsx", "q4_report.xlsx"]
          },
          {
            folderName: "Presentations",
            files: ["executive_summary.pptx", "shareholder_presentation.pptx"]
          }
        ]
      }
    ];
    saveProjects();
  }
}

/**
 * Saves projects to localStorage
 */
function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/**
 * Opens the project dialog for creating or editing a project
 * @param {boolean} isEdit - Whether we're editing an existing project
 * @param {number|null} index - Index of the project to edit, if applicable
 */
function openProjectDialog(isEdit = false, index = null) {
  document.getElementById("projectDialog").showModal();
  document.getElementById("dialogTitle").textContent = isEdit ? "Edit Project" : "Create New Project";
  document.getElementById("saveBtnText").textContent = isEdit ? "Save" : "Create";

  if (isEdit && projects[index]) {
    document.getElementById("projectNameInput").value = projects[index].name;
    document.getElementById("projectDescInput").value = projects[index].description;
    document.getElementById("projectOwnerInput").value = projects[index].owner;
    document.getElementById("projectStatusSelect").value = projects[index].status || 'active';
    const coachingInput = document.getElementById("coachingRequiredInput");
  if (coachingInput) {
    coachingInput.checked = projects[index].coachingRequired || false;
  } else {
    console.warn("Coaching input not found.");
  }

    
    // Set permissions radio button
    const permissionValue = projects[index].permission || 'read';

    console.log(permissionValue, "permissionValue");

    const elem = `permission${permissionValue.charAt(0).toUpperCase() + permissionValue.slice(1)}`

    console.log(elem, "elem");

    const permissionInput = document.getElementById(elem);
  if (permissionInput) {
    permissionInput.checked = true;
  } else {
    console.warn("Permission input not found for:", permissionValue);
  }

    
    editingIndex = index;
    window.editingIndex = index;
  } else {
    clearForm();
    editingIndex = null;
  }
}

/**
 * Closes the project dialog
 */
function closeProjectDialog() {
  document.getElementById("projectDialog").close();
  clearForm();
  editingIndex = null;
}

/**
 * Clears the project form
 */
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

/**
 * Handles saving a new or edited project
 */
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

  if (editingIndex !== null && projects[editingIndex]) {
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

function deleteProject(index) {
  const projectModal = document.createElement('dialog');
  projectModal.className = 'confirmation-dialog';
  projectModal.innerHTML = `
    <div class="confirmation-content">
      <span class="material-symbols-outlined warning-icon">warning</span>
      <h3>Delete Project?</h3>
      <p>Are you sure you want to delete "${projects[index].name}"? This action cannot be undone.</p>
      <div class="dialog-actions">
        <button class="delete-btn" id="confirmDelete">
          <span class="material-symbols-outlined">delete</span>
          Delete
        </button>
        <button class="secondary-btn" id="cancelDelete">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(projectModal);
  projectModal.showModal();

  document.getElementById('confirmDelete').addEventListener('click', () => {
    projects.splice(index, 1);
    saveProjects();
    renderProjects();
    projectModal.close();
    document.body.removeChild(projectModal);
    showNotification("Project deleted successfully!", "success");
  });

  document.getElementById('cancelDelete').addEventListener('click', () => {
    projectModal.close();
    document.body.removeChild(projectModal);
  });
}

function deleteFolder(projectIndex, folderIndex) {
  const folder = projects[projectIndex].folders[folderIndex];
  const folderModal = document.createElement('dialog');
  folderModal.className = 'confirmation-dialog';

  folderModal.innerHTML = `
    <div class="confirmation-content">
      <span class="material-symbols-outlined warning-icon">warning</span>
      <h3>Delete Folder?</h3>
      <p>Are you sure you want to delete the folder "<strong>${folder.folderName}</strong>" and all its files? This action cannot be undone.</p>
      <div class="dialog-actions">
        <button class="delete-btn" id="confirmFolderDelete">
          <span class="material-symbols-outlined">delete</span>
          Delete
        </button>
        <button class="secondary-btn" id="cancelFolderDelete">
          <span class="material-symbols-outlined">close</span>
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(folderModal);
  folderModal.showModal();

  document.getElementById('confirmFolderDelete').addEventListener('click', () => {
    projects[projectIndex].folders.splice(folderIndex, 1);
    saveProjects();
    renderProjects();
    folderModal.close();
    document.body.removeChild(folderModal);
    showNotification(`Folder "${folder.folderName}" deleted`, "success");
  });

  document.getElementById('cancelFolderDelete').addEventListener('click', () => {
    folderModal.close();
    document.body.removeChild(folderModal);
  });
}


  document.body.appendChild(projectModal);
  projectModal.showModal();
  
  document.getElementById('confirmDelete').addEventListener('click', () => {
    projects.splice(index, 1);
    saveProjects();
    renderProjects();
    projectModal.close();
    document.body.removeChild(projectModal);
    
    // Show success notification
    showNotification("Project deleted successfully!", "success");
  });
  
  

/**
 * Formats a date string to a more readable format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Gets the count of total files in a project
 * @param {Object} project - The project object
 * @returns {number} - Total files count
 */
function getTotalFilesCount(project) {
  return project.folders.reduce((sum, folder) => sum + folder.files.length, 0);
}

/**
 * Sort projects based on the current sort settings
 * @param {Array} projectsList - The projects array to sort
 * @returns {Array} - Sorted projects array
 */
function sortProjects(projectsList) {
  const { column, direction } = currentSort;
  const sortMultiplier = direction === 'asc' ? 1 : -1;
  
  return [...projectsList].sort((a, b) => {
    let valueA, valueB;
    
    switch (column) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'owner':
        valueA = a.owner.toLowerCase();
        valueB = b.owner.toLowerCase();
        break;
      case 'date':
        valueA = new Date(a.dateCreated).getTime();
        valueB = new Date(b.dateCreated).getTime();
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'files':
        valueA = getTotalFilesCount(a);
        valueB = getTotalFilesCount(b);
        break;
      default:
        return 0;
    }
    
    if (valueA < valueB) return -1 * sortMultiplier;
    if (valueA > valueB) return 1 * sortMultiplier;
    return 0;
  });
}

/**
 * Updates sort indicators in the table headers below
 */
function updateSortIndicators() {
  // Clear all sort indicators
  document.querySelectorAll('.sortable').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
  });
  
  // Set the active sort indicator
  const sortableColumn = document.querySelector(`.column-${currentSort.column}`);
  if (sortableColumn) {
    sortableColumn.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
  }
}

/**
 * Renders projects in the current view (table or grid)
 */
function renderProjects() {
  // Sort the projects
  const sortedProjects = sortProjects(projects);
  
  // Update table and grid view
  renderTableView(sortedProjects);
  renderGridView(sortedProjects);
  
  // Update sort indicators
  updateSortIndicators();
}

/**
 * Renders projects in table view
 * @param {Array} projectsList - The projects to render 
 */
function renderTableView(projectsList) {
  const tableBody = document.getElementById('projectsTableBody');
  tableBody.innerHTML = '';
  
  projectsList.forEach((project, i) => {
    const totalFiles = getTotalFilesCount(project);
    const formattedDate = project.dateCreated ? formatDate(project.dateCreated) : 'N/A';
    
    // Create permission badge HTML
    let permissionText = 'Read Only';
    let permissionIcon = 'visibility';
    let permissionClass = 'read';
    
    if (project.permission === 'download') {
      permissionText = 'Read & Download';
      permissionIcon = 'download';
      permissionClass = 'download';
    } else if (project.permission === 'full') {
      permissionText = 'Full Control';
      permissionIcon = 'edit';
      permissionClass = 'full';
    }
    
    // Create status badge HTML
    let statusClass = 'active';
    if (project.status) {
      statusClass = project.status;
    }
    
    // Create coaching icon HTML
    const coachingClass = project.coachingRequired ? '' : 'inactive';
    
    // Create follow state HTML
    const isFollowing = project.following !== false; // Default to true if not set
    const followClass = isFollowing ? 'following' : '';
    const followIcon = isFollowing ? 'notifications_active' : 'notifications';
    
    const row = document.createElement('tr');
    row.className = 'project-row';
    row.dataset.projectIndex = projects.findIndex(p =>
      p.name === project.name &&
      p.owner === project.owner &&
      p.dateCreated === project.dateCreated
    );
    
    row.innerHTML = `
      <td class="column-name">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="expand-btn" onclick="toggleExpandRow(this)" aria-label="Expand project">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
          <span class="material-symbols-outlined" style="color: var(--primary);">folder</span>
          ${project.name}
          ${isFollowing ? `
            <span class="following-badge" title="You are following this project">
              <span class="material-symbols-outlined">notifications</span>
            </span>
          ` : ''}
        </div>
      </td>
      <td class="column-owner">${project.owner}</td>
      <td class="column-date">${formattedDate}</td>
      <td class="column-status">
        <span class="status-badge status-${statusClass}">
          ${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}
        </span>
      </td>
      <td class="column-permission">
        <span class="permission-badge permission-${permissionClass}">
          <span class="material-symbols-outlined">${permissionIcon}</span>
          <span>${permissionText}</span>
        </span>
      </td>
      <td class="column-coaching">
        <span class="coaching-badge ${coachingClass}" title="${project.coachingRequired ? 'Coaching Required' : 'No Coaching Required'}">
          <span class="material-symbols-outlined" style="font-size: 16px;">psychology</span>
        </span>
      </td>
      <td class="column-files">${totalFiles} files</td>
      <td class="column-actions">
        <div class="row-actions">
          <button class="row-action-btn follow-btn ${followClass}" onclick="toggleFollowProject(${i}, event)" title="${isFollowing ? 'Unfollow Project' : 'Follow Project'}">
            <span class="material-symbols-outlined">${followIcon}</span>
          </button>
          <button class="row-action-btn action-folder" onclick="addFolderToProject(${i})" title="Add Folder">
            <span class="material-symbols-outlined">create_new_folder</span>
          </button>
          <button class="row-action-btn action-upload" onclick="uploadFilesToProject(${i})" title="Upload Files">
            <span class="material-symbols-outlined">upload_file</span>
          </button>
          <button class="row-action-btn action-edit" onclick="openProjectDialog(true, ${i})" title="Edit Project">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button class="row-action-btn action-delete" onclick="deleteProject(${i})" title="Delete Project">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
    
    // Create the expandable details row
    const detailsRow = document.createElement('tr');
    detailsRow.className = 'details-row';
    detailsRow.style.display = 'none';
    
    // Create the cell that spans all columns
    const detailsCell = document.createElement('td');
    detailsCell.colSpan = 8;
    
    // Generate content for the details cell
    let detailsContent = `
      <div class="project-details">
        <div class="details-header">
      <div class="project-info">
        <h3>Project Files</h3>
      </div>
      </div>
        <div class="folder-list">
    `;
    
    if (project.folders && project.folders.length > 0) {
      project.folders.forEach((folder, folderIndex) => {
        detailsContent += `
          <div class="folder-item-details">
            <div class="folder-header-details">
              <span class="material-symbols-outlined">folder</span>
              <span class="folder-name">${folder.folderName}</span>
              <span class="file-count">${folder.files.length} files</span>
              <button class="row-action-btn action-delete" onclick="deleteFolder(${i}, ${folderIndex})" title="Delete Folder">
            <span class="material-symbols-outlined">delete</span>
          </button>
            </div>
            <div class="file-list">
        `;
        
        if (folder.files && folder.files.length > 0) {
          folder.files.forEach(file => {
            // Determine file icon based on extension
            let fileIcon = 'description';
            const ext = file.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
              fileIcon = 'image';
            } else if (['doc', 'docx'].includes(ext)) {
              fileIcon = 'article';
            } else if (['xls', 'xlsx'].includes(ext)) {
              fileIcon = 'table';
            } else if (['pdf'].includes(ext)) {
              fileIcon = 'picture_as_pdf';
            }
            
            detailsContent += `
              <div class="file-item">
                <span class="material-symbols-outlined file-icon">${fileIcon}</span>
                <span class="file-name">${file}</span>
                <div class="file-actions">
                  <button title="Preview File" class="file-action-btn">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                  <button title="Download File" class="file-action-btn">
                    <span class="material-symbols-outlined">download</span>
                  </button>
                </div>
              </div>
            `;
          });
        } else {
          detailsContent += `<div class="empty-files">No files in this folder</div>`;
        }
        
        detailsContent += `
            </div>
            <div class="folder-actions-details">
              <button class="row-action-btn action-upload" onclick="openFileUploadForFolder(${i}, ${folderIndex})" title="Upload Files">
                <span class="material-symbols-outlined">upload_file</span>
              </button>
            </div>

          </div>
        `;
      });
    } else {
      detailsContent += `
        
      `;
    }
    
    detailsContent += `
        </div>
      </div>
    `;
    
    detailsCell.innerHTML = detailsContent;
    detailsRow.appendChild(detailsCell);
    
    tableBody.appendChild(detailsRow);
  });
}


 //Toggle following status for a project

 function toggleFollowProject(_index, event) {
  // Prevent event from propagating to parent row expansion
  event.stopPropagation();

  // Get the closest <tr> and read its data-project-index
  const row = event.currentTarget.closest('tr');
  const index = parseInt(row?.dataset.projectIndex);

  if (isNaN(index)) {
    console.warn('Could not determine project index from clicked row.');
    return;
  }

  // Toggle the following status
  projects[index].following = !projects[index].following;

  // Update the UI
  const followBtn = event.currentTarget;
  if (projects[index].following) {
    followBtn.classList.add('following');
    followBtn.title = 'Unfollow Project';
    followBtn.querySelector('.material-symbols-outlined').textContent = 'notifications_active';
    showNotification(`You are now following ${projects[index].name}`, 'success');
  } else {
    followBtn.classList.remove('following');
    followBtn.title = 'Follow Project';
    followBtn.querySelector('.material-symbols-outlined').textContent = 'notifications';
    showNotification(`You are no longer following ${projects[index].name}`, 'info');
  }

  saveProjects();

  // Update the notification badge in the project name cell
  const projectRow = document.querySelector(`tr[data-project-index="${index}"]`);
  if (projectRow) {
    const nameCell = projectRow.querySelector('.column-name div');
    let followingBadge = nameCell.querySelector('.following-badge');

    if (projects[index].following) {
      if (!followingBadge) {
        followingBadge = document.createElement('span');
        followingBadge.className = 'following-badge';
        followingBadge.title = 'You are following this project';
        followingBadge.innerHTML = '<span class="material-symbols-outlined">notifications</span>';
        nameCell.appendChild(followingBadge);
      }
    } else if (followingBadge) {
      nameCell.removeChild(followingBadge);
    }
  }
}

/**
 * Opens file upload dialog directly for a specific folder
 * @param {number} projectIndex - The index of the project
 * @param {number} folderIndex - The index of the folder
 */
function openFileUploadForFolder(projectIndex, folderIndex) {
  openFileUploadDialog(projectIndex, folderIndex);
}

/**
 * Renders projects in grid view
 * @param {Array} projectsList - The projects to render 
 */
function renderGridView(projectsList) {
  const gridContainer = document.getElementById('projectsGrid');
  gridContainer.innerHTML = '';
  
  projectsList.forEach((project, i) => {
    const totalFiles = getTotalFilesCount(project);
    const formattedDate = project.dateCreated ? formatDate(project.dateCreated) : 'N/A';
    
    // Create permission badge HTML
    let permissionText = 'Read Only';
    let permissionIcon = 'visibility';
    let permissionClass = 'read';
    
    if (project.permission === 'download') {
      permissionText = 'Read & Download';
      permissionIcon = 'download';
      permissionClass = 'download';
    } else if (project.permission === 'full') {
      permissionText = 'Full Control';
      permissionIcon = 'edit';
      permissionClass = 'full';
    }
    
    // Create status badge HTML
    let statusClass = 'active';
    if (project.status) {
      statusClass = project.status;
    }
    
    // Create follow state HTML
    const isFollowing = project.following !== false; // Default to true if not set
    
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="card-header">
        <div class="project-title">
          <span class="material-symbols-outlined">folder</span>
          ${project.name}
          ${isFollowing ? `
            <span class="following-badge-small" title="You are following this project">
              <span class="material-symbols-outlined">notifications</span>
            </span>
          ` : ''}
        </div>
        <div class="project-description">${project.description || "No description provided"}</div>
        <div class="card-badges">
          <span class="status-badge status-${statusClass}">
            ${statusClass.charAt(0).toUpperCase() + statusClass.slice(1)}
          </span>
        </div>
      </div>
      <div class="card-content">
        <div class="project-info">
          <div class="info-row">
            <div class="info-label">Owner:</div>
            <div class="info-value">${project.owner}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Created:</div>
            <div class="info-value">${formattedDate}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Folders:</div>
            <div class="info-value">${project.folders.length}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Files:</div>
            <div class="info-value">${totalFiles}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Permission:</div>
            <div class="info-value">
              <span class="permission-badge permission-${permissionClass}">
                <span class="material-symbols-outlined">${permissionIcon}</span>
                <span>${permissionText}</span>
              </span>
            </div>
          </div>
          ${project.coachingRequired ? `
            <div class="info-row">
              <div class="info-label">Coaching:</div>
              <div class="info-value">Required</div>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="card-footer">
        <button class="row-action-btn follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollowProject(${i}, event)" title="${isFollowing ? 'Unfollow Project' : 'Follow Project'}">
          <span class="material-symbols-outlined">${isFollowing ? 'notifications_active' : 'notifications'}</span>
        </button>
        <button class="row-action-btn action-folder" onclick="addFolderToProject(${i})" title="Add Folder">
          <span class="material-symbols-outlined">create_new_folder</span>
        </button>        
        <button class="row-action-btn action-edit" onclick="openProjectDialog(true, ${i})" title="Edit Project">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button class="row-action-btn action-delete" onclick="deleteProject(${i})" title="Delete Project">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
    
    gridContainer.appendChild(card);
  });
}

/**
 * Toggles column visibility in the table
 * @param {string} columnName - The column to toggle
 * @param {boolean} visible - Whether the column should be visible
 */
function toggleColumnVisibility(columnName, visible) {
  const columnElements = document.querySelectorAll(`.column-${columnName}`);
  columnElements.forEach(el => {
    if (visible) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });
}

/**
 * Switches between table and grid view
 * @param {string} view - The view to switch to ('table' or 'grid')
 */
function switchView(view) {
  const tableView = document.getElementById('projectsTable').parentElement;
  const gridView = document.getElementById('projectsGrid');
  
  // Update view buttons
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`.view-toggle-btn[data-view="${view}"]`).classList.add('active');
  
  // Show the selected view
  if (view === 'table') {
    tableView.style.display = '';
    gridView.style.display = 'none';
  } else {
    tableView.style.display = 'none';
    gridView.style.display = 'grid';
  }
  
  currentView = view;
}

/**
 * Handles column sorting when a table header is clicked
 * @param {string} column - The column to sort by
 */
function handleSort(column) {
  if (currentSort.column === column) {
    // Toggle direction if already sorting by this column
    currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // Set new sort column with default ascending direction
    currentSort.column = column;
    currentSort.direction = 'asc';
  }
  
  renderProjects();
}
 // Toggle row expansion for project details

  function addFolderToProject(index) {
    const folderDialog = document.getElementById('folderDialog');
    const folderNameInput = document.getElementById('folderNameInput');
    const folderNameError = document.getElementById('folderNameError');

    // Clear any previous state
    folderNameInput.value = '';
    folderNameError.style.display = 'none';

    // Set the correct index cleanly
    folderDialog.dataset.projectIndex = '';
    folderDialog.dataset.projectIndex = index;

    // Reset old event listener
    const newCreateBtn = folderDialog.querySelector('#createFolderBtn');
    const oldBtn = newCreateBtn.cloneNode(true);
    newCreateBtn.parentNode.replaceChild(oldBtn, newCreateBtn);

    // Attach listener with correct context
    oldBtn.addEventListener('click', handleCreateFolder);
    folderDialog.showModal();
  }

//creation of a new folder from the folder dialog
function handleCreateFolder() {
  const folderDialog = document.getElementById('folderDialog');
  const folderNameInput = document.getElementById('folderNameInput');
  const folderNameError = document.getElementById('folderNameError');
  
  const rawIndex = folderDialog.dataset.projectIndex;

  const projectIndex = parseInt(rawIndex);
  console.log("Creating folder for project index:", projectIndex, "from raw:", rawIndex);


  if (isNaN(projectIndex) || !projects[projectIndex]) {
    console.error("Invalid project index:", projectIndex);
    showNotification("Unable to find the selected project.", "error");
    folderDialog.close();
    return;
  }

  const name = folderNameInput.value.trim();
  if (!name) {
    folderNameError.textContent = 'Folder name is required.';
    folderNameError.style.display = 'block';
    return;
  }

  const project = projects[projectIndex];
  if (!project.folders) {
    project.folders = [];
  }

  project.folders.push({
    folderName: name,
    files: []
  });

  saveProjects();
  renderProjects();
  folderDialog.close();

  showNotification(`Folder "${name}" added to "${project.name}"`, 'success');
}


//Function to handle uploading files to a project

function uploadFilesToProject(projectIndex) {
  // Check if the project has any folders
  if (projects[projectIndex].folders.length === 0) {
    // If no folders exist, prompt to create one first
    const confirmDialog = document.createElement('dialog');
    confirmDialog.className = 'confirmation-dialog';
    
    confirmDialog.innerHTML = `
      <div class="confirmation-content">
        <span class="material-symbols-outlined">info</span>
        <h3>No Folders Available</h3>
        <p>You need to create a folder first before uploading files.</p>
        <div class="dialog-actions">
          <button id="createFolderNowBtn" class="primary-btn">
            <span class="material-symbols-outlined">create_new_folder</span>
            Create Folder
          </button>
          <button id="cancelUploadBtn" class="secondary-btn">
            <span class="material-symbols-outlined">close</span>
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmDialog);
    confirmDialog.showModal();
    
    document.getElementById('createFolderNowBtn').addEventListener('click', () => {
      confirmDialog.close();
      document.body.removeChild(confirmDialog);
      addFolderToProject(projectIndex);
    });
    
    document.getElementById('cancelUploadBtn').addEventListener('click', () => {
      confirmDialog.close();
      document.body.removeChild(confirmDialog);
    });
    
    return;
  }
  
  // If project has folders, show folder selection dialog
  const folderSelectionDialog = document.createElement('dialog');
  folderSelectionDialog.className = 'folder-selection-dialog';
  
  let folderOptions = '';
  projects[projectIndex].folders.forEach((folder, idx) => {
    folderOptions += `<option value="${idx}">${folder.folderName}</option>`;
  });
  
  folderSelectionDialog.innerHTML = `
    <h2>Select Folder</h2>
    <div class="form-group">
      <label for="folderSelectInput">Choose a folder to upload files to:</label>
      <select id="folderSelectInput" class="folder-select">
        ${folderOptions}
      </select>
    </div>
    <div class="dialog-actions">
      <button id="confirmFolderBtn" class="primary-btn">
        <span class="material-symbols-outlined">check</span>
        Continue
      </button>
      <button id="cancelSelectionBtn" class="secondary-btn">
        <span class="material-symbols-outlined">close</span>
        Cancel
      </button>
    </div>
  `;
  
  document.body.appendChild(folderSelectionDialog);
  folderSelectionDialog.showModal();
  
  document.getElementById('confirmFolderBtn').addEventListener('click', () => {
    const folderIndex = document.getElementById('folderSelectInput').value;
    folderSelectionDialog.close();
    document.body.removeChild(folderSelectionDialog);
    
    // Open the file upload dialog for the selected folder
    openFileUploadDialog(projectIndex, folderIndex);
  });
  
  document.getElementById('cancelSelectionBtn').addEventListener('click', () => {
    folderSelectionDialog.close();
    document.body.removeChild(folderSelectionDialog);
  });
}

/**
 * Opens the file upload dialog for a specific folder
 * @param {number} projectIndex - The index of the project
 * @param {number} folderIndex - The index of the folder
 */
function openFileUploadDialog(projectIndex, folderIndex) {
  const fileUploadDialog = document.getElementById('fileUploadDialog');
  const selectedFilesDiv = document.getElementById('selectedFiles');
  const fileInput = document.getElementById('fileInput');
  
  // Clear previous selections
  fileInput.value = '';
  selectedFilesDiv.innerHTML = '';
  
  // Store the project and folder indices for later use
  fileUploadDialog.dataset.projectIndex = projectIndex;
  fileUploadDialog.dataset.folderIndex = folderIndex;
  
  // Update dialog title to show which folder we're uploading to
  const folderName = projects[projectIndex].folders[folderIndex].folderName;
  fileUploadDialog.querySelector('h2').textContent = `Upload Files to "${folderName}"`;
  
  // Show the dialog
  fileUploadDialog.showModal();
}

/**
 * Handles the file upload process after files are selected
 */
function handleFileUpload() {
  const fileUploadDialog = document.getElementById('fileUploadDialog');
  const fileInput = document.getElementById('fileInput');
  
  const projectIndex = parseInt(fileUploadDialog.dataset.projectIndex);
  const folderIndex = parseInt(fileUploadDialog.dataset.folderIndex);
  
  if (fileInput.files.length > 0) {
    // In a real application, we would upload the files to a server here
    // For this demo, we'll just add the filenames to the project data
    
    for (let i = 0; i < fileInput.files.length; i++) {
      projects[projectIndex].folders[folderIndex].files.push(fileInput.files[i].name);
    }
    
    saveProjects();
    renderProjects();
    
    // Show success notification
    showNotification('Files uploaded successfully!', 'success');
  }
  
  // Close the dialog
  fileUploadDialog.close();
}

//Handles the search functionality
 
function handleSearch() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  
  // Filter projects based on search query
  const filteredProjects = projects.filter(project => {
    // Search in project name and description
    if (
      project.name.toLowerCase().includes(searchQuery) ||
      (project.description && project.description.toLowerCase().includes(searchQuery)) ||
      project.owner.toLowerCase().includes(searchQuery)
    ) {
      return true;
    }
    
    // Search in folder names
    const folderMatch = project.folders.some(folder => 
      folder.folderName.toLowerCase().includes(searchQuery)
    );
    
    if (folderMatch) return true;
    
    // Search in file names
    const fileMatch = project.folders.some(folder => 
      folder.files.some(file => file.toLowerCase().includes(searchQuery))
    );
    
    return fileMatch;
  });
  
  // Render filtered projects
  renderTableView(filteredProjects);
  renderGridView(filteredProjects);
}

function handleFileSelection() {
  const fileInput = document.getElementById("fileInput");
  const selectedFilesDiv = document.getElementById("selectedFiles");

  selectedFilesDiv.innerHTML = "";

  for (let i = 0; i < fileInput.files.length; i++) {
    const file = fileInput.files[i];

    const item = document.createElement("div");
    item.className = "selected-file-item";

    item.innerHTML = `
      <span class="material-symbols-outlined">description</span>
      <span class="file-name">${file.name}</span>
      <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
    `;

    selectedFilesDiv.appendChild(item);
  }
}

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
  // Load projects data
  loadProjects();
  
  // Render projects
  renderProjects();
  
  // Set up column selector
  const columnSelectorBtn = document.getElementById('columnSelectorBtn');
  const columnOptions = document.getElementById('columnOptions');
  
  columnSelectorBtn.addEventListener('click', function() {
    columnOptions.classList.toggle('show');
  });
  
  // Hide column options when clicking outside
  document.addEventListener('click', function(event) {
    if (!columnSelectorBtn.contains(event.target) && !columnOptions.contains(event.target)) {
      columnOptions.classList.remove('show');
    }
  });
  
  // Set up column visibility toggles
  document.querySelectorAll('.column-option input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const column = this.dataset.column;
      toggleColumnVisibility(column, this.checked);
    });
  });
  
  // Set up view toggle buttons
  document.querySelectorAll('.view-toggle-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const view = this.dataset.view;
      switchView(view);
    });
  });
  
  // Set up sortable columns
  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', function() {
      const column = this.dataset.sort;
      handleSort(column);
    });
  });
  
  // Project dialog event listeners
  document.getElementById("saveBtn").addEventListener("click", handleSaveProject);
  
  // Folder dialog event listeners
  document.getElementById("createFolderBtn").addEventListener("click", handleCreateFolder);
  document.getElementById("cancelFolderBtn").addEventListener("click", function() {
    document.getElementById("folderDialog").close();
  });
  
  // File upload dialog event listeners
  document.getElementById("fileInput").addEventListener("change", handleFileSelection);
  
  document.querySelector(".file-select-btn").addEventListener("click", function() {
    document.getElementById("fileInput").click();
  });
  
  document.getElementById("uploadFilesBtn").addEventListener("click", handleFileUpload);
  
  document.getElementById("cancelUploadBtn").addEventListener("click", function() {
    document.getElementById("fileUploadDialog").close();
  });
  
  // Mobile menu toggle
  if (document.getElementById('menu-toggle')) {
    document.getElementById('menu-toggle').addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }
});