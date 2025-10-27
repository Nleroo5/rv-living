// Checklist Management

let checklistItems = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Load checklist from storage
  loadChecklist();

  // Add item form
  const addForm = document.getElementById('add-checklist-form');
  addForm.addEventListener('submit', handleAddItem);

  // Filter buttons
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderChecklist();
    });
  });

  // File upload
  setupFileUpload();
});

// Load checklist from storage
function loadChecklist() {
  checklistItems = Storage.get('checklistItems', []);
  renderChecklist();
  updateStats();
}

// Save checklist to storage
function saveChecklist() {
  Storage.set('checklistItems', checklistItems);
  updateStats();
}

// Handle add item form submission
function handleAddItem(e) {
  e.preventDefault();

  const title = document.getElementById('item-title').value.trim();
  const description = document.getElementById('item-description').value.trim();
  const category = document.getElementById('item-category').value;
  const priority = document.getElementById('item-priority').value;

  if (!title) {
    showToast('Please enter a title', 'error');
    return;
  }

  const newItem = {
    id: generateId(),
    title,
    description,
    category,
    priority,
    completed: false,
    createdAt: new Date().toISOString()
  };

  checklistItems.unshift(newItem); // Add to beginning
  saveChecklist();
  renderChecklist();

  // Reset form
  e.target.reset();

  showToast('Item added successfully!', 'success');
}

// Render checklist
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  const emptyMessage = document.getElementById('empty-message');

  // Filter items
  let filteredItems = checklistItems;

  if (currentFilter === 'completed') {
    filteredItems = checklistItems.filter(item => item.completed);
  } else if (currentFilter !== 'all') {
    filteredItems = checklistItems.filter(item => item.category === currentFilter);
  }

  // Clear container (except empty message)
  const items = container.querySelectorAll('.checklist-item');
  items.forEach(item => item.remove());

  if (filteredItems.length === 0) {
    emptyMessage.classList.remove('hidden');
    emptyMessage.textContent = currentFilter === 'all'
      ? 'No items yet. Add your first checklist item above!'
      : 'No items in this category yet.';
  } else {
    emptyMessage.classList.add('hidden');

    filteredItems.forEach(item => {
      const li = createChecklistItemElement(item);
      container.appendChild(li);
    });
  }
}

// Create checklist item element
function createChecklistItemElement(item) {
  const li = document.createElement('li');
  li.className = `checklist-item ${item.completed ? 'completed' : ''}`;
  li.dataset.id = item.id;

  const priorityColors = {
    high: 'var(--color-error)',
    medium: 'var(--color-accent)',
    low: 'var(--color-success)'
  };

  const categoryLabels = {
    purchase: 'To Purchase',
    organize: 'To Organize',
    sell: 'To Sell/Donate',
    research: 'Research Needed',
    documents: 'Documents',
    maintenance: 'Maintenance',
    other: 'Other'
  };

  li.innerHTML = `
    <input
      type="checkbox"
      class="checklist-checkbox"
      ${item.completed ? 'checked' : ''}
      aria-label="Mark as ${item.completed ? 'incomplete' : 'complete'}"
    >
    <div class="checklist-content">
      <div class="checklist-title">${sanitizeHTML(item.title)}</div>
      ${item.description ? `<div class="checklist-description">${sanitizeHTML(item.description)}</div>` : ''}
      <div style="margin-top: var(--space-1); display: flex; gap: var(--space-1); flex-wrap: wrap;">
        <span class="badge" style="background-color: rgba(5, 144, 140, 0.1); color: var(--color-primary);">
          ${categoryLabels[item.category]}
        </span>
        <span class="badge" style="background-color: ${priorityColors[item.priority]}20; color: ${priorityColors[item.priority]};">
          ${item.priority.toUpperCase()} Priority
        </span>
      </div>
    </div>
    <button
      class="file-item-remove"
      aria-label="Delete item"
      style="margin-left: auto;"
    >
      ✕
    </button>
  `;

  // Checkbox toggle
  const checkbox = li.querySelector('.checklist-checkbox');
  checkbox.addEventListener('change', () => {
    toggleItemComplete(item.id);
  });

  // Delete button
  const deleteBtn = li.querySelector('.file-item-remove');
  deleteBtn.addEventListener('click', async () => {
    const confirmed = await confirmDialog('Are you sure you want to delete this item?');
    if (confirmed) {
      deleteItem(item.id);
    }
  });

  return li;
}

// Toggle item complete status
function toggleItemComplete(itemId) {
  const item = checklistItems.find(i => i.id === itemId);
  if (item) {
    item.completed = !item.completed;
    saveChecklist();
    renderChecklist();
  }
}

// Delete item
function deleteItem(itemId) {
  checklistItems = checklistItems.filter(i => i.id !== itemId);
  saveChecklist();
  renderChecklist();
  showToast('Item deleted', 'info');
}

// Update statistics
function updateStats() {
  const total = checklistItems.length;
  const completed = checklistItems.filter(item => item.completed).length;
  const remaining = total - completed;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  document.getElementById('checklist-stats-completed').textContent = completed;
  document.getElementById('checklist-stats-remaining').textContent = remaining;
  document.getElementById('checklist-stats-total').textContent = total;
  document.getElementById('checklist-progress-bar').style.width = progressPercent + '%';
}

// File Upload Setup
function setupFileUpload() {
  const uploadZone = document.getElementById('file-upload-zone');
  const fileInput = document.getElementById('file-upload-input');
  const fileList = document.getElementById('file-list');

  // Load saved files
  let uploadedFiles = Storage.get('uploadedFiles', []);
  renderFileList(uploadedFiles);

  // Click to upload
  uploadZone.addEventListener('click', () => {
    fileInput.click();
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
  });

  // Drag and drop
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = 'var(--color-primary)';
    uploadZone.style.backgroundColor = 'rgba(5, 144, 140, 0.05)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.borderColor = '';
    uploadZone.style.backgroundColor = '';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.borderColor = '';
    uploadZone.style.backgroundColor = '';
    handleFileUpload(e.dataTransfer.files);
  });
}

// Handle file upload
function handleFileUpload(files) {
  const uploadedFiles = Storage.get('uploadedFiles', []);
  const maxSize = 5 * 1024 * 1024; // 5MB

  Array.from(files).forEach(file => {
    if (file.size > maxSize) {
      showToast(`File "${file.name}" is too large (max 5MB)`, 'error');
      return;
    }

    // Read file as data URL for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = {
        id: generateId(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        // Note: Storing large files in localStorage is not ideal for production
        // This is just for demonstration. In production, use a file storage service.
        data: e.target.result
      };

      uploadedFiles.push(fileData);
      Storage.set('uploadedFiles', uploadedFiles);
      renderFileList(uploadedFiles);
      showToast(`File "${file.name}" uploaded successfully`, 'success');
    };

    reader.readAsDataURL(file);
  });
}

// Render file list
function renderFileList(files) {
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  if (files.length === 0) {
    fileList.innerHTML = '<p class="text-secondary text-center">No files uploaded yet</p>';
    return;
  }

  files.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <div>
        <div class="file-item-name">${sanitizeHTML(file.name)}</div>
        <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">
          ${formatFileSize(file.size)} • ${DateUtils.formatDateShort(file.uploadedAt)}
        </div>
      </div>
      <div style="display: flex; gap: var(--space-1);">
        <button class="btn btn-small btn-outline download-btn" data-id="${file.id}">
          Download
        </button>
        <button class="file-item-remove" data-id="${file.id}">
          ✕
        </button>
      </div>
    `;

    // Download button
    const downloadBtn = fileItem.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => {
      downloadFile(file);
    });

    // Remove button
    const removeBtn = fileItem.querySelector('.file-item-remove');
    removeBtn.addEventListener('click', async () => {
      const confirmed = await confirmDialog(`Delete "${file.name}"?`);
      if (confirmed) {
        removeFile(file.id);
      }
    });

    fileList.appendChild(fileItem);
  });
}

// Download file
function downloadFile(file) {
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  link.click();
}

// Remove file
function removeFile(fileId) {
  let files = Storage.get('uploadedFiles', []);
  files = files.filter(f => f.id !== fileId);
  Storage.set('uploadedFiles', files);
  renderFileList(files);
  showToast('File deleted', 'info');
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
