// New Destinations Management with Leaflet Map

let destinations = [];
let folders = [];
let map = null;
let markers = [];
let currentFolder = 'all';
let currentTypeFilter = 'all';
let currentRegionFilter = 'all';
let currentSearch = '';
let currentTab = 'my-destinations';
let currentDiscoverRegion = '';
let currentDiscoverType = 'all';
let nationalParksData = []; // Will hold all 63 National Parks
let discoverDestinations = []; // Will hold 200+ discover destinations (non-NP)

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadDestinations();
  await loadFolders();
  loadNationalParks();
  loadDiscoverDestinations();
  initializeMap();
  setupEventListeners();
  setupTabSwitching();
  renderFolders();
  renderDestinations();
  updateMap();
});

// Initialize Leaflet Map
function initializeMap() {
  // Center on continental US
  map = L.map('map').setView([39.8283, -98.5795], 4);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
    minZoom: 3
  }).addTo(map);
}

// Update map with current destinations and National Parks
function updateMap() {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Always add all 63 National Parks as blue pins (unless they're in user's destinations)
  nationalParksData.forEach(park => {
    if (park.latitude && park.longitude) {
      // Check if this National Park is in user's destinations
      const userDest = destinations.find(d => d.id === park.id);

      // Skip if user has added this park (it will be rendered with their chosen color)
      if (!userDest) {
        addMarker(park, '#3b82f6', false); // Blue for National Parks
      }
    }
  });

  // Get filtered user destinations
  const filtered = getFilteredDestinations();

  // Add markers for user's destinations
  filtered.forEach(dest => {
    if (dest.latitude && dest.longitude) {
      // Green for visited, Red for bucketlist
      const color = dest.visited ? '#10b981' : '#ef4444';
      addMarker(dest, color, true);
    }
  });

  // Don't auto-fit bounds - keep US view so users can see all pins
  // Users can zoom/pan manually
}

// Helper function to add a marker to the map
function addMarker(dest, color, isUserDestination) {
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
  });

  const popupContent = `
    <div style="min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; font-weight: bold;">${dest.name}</h4>
      <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${dest.state}</p>
      ${dest.rvCamping ? '<p style="margin: 4px 0; font-size: 13px;">RV Camping Available</p>' : ''}
      ${dest.bestSeason ? `<p style="margin: 4px 0; font-size: 13px;">Best: ${dest.bestSeason}</p>` : ''}
      ${isUserDestination
        ? `<button onclick="viewDestinationDetails('${dest.id}')" style="margin-top: 8px; padding: 4px 12px; background: var(--color-success); color: white; border: none; border-radius: 4px; cursor: pointer;">Visited</button>`
        : `<button onclick="addNationalParkToDestinations('${dest.id}')" style="margin-top: 8px; padding: 4px 12px; background: var(--color-success); color: white; border: none; border-radius: 4px; cursor: pointer;">Visited</button>`
      }
    </div>
  `;

  const marker = L.marker([dest.latitude, dest.longitude], { icon })
    .bindPopup(popupContent)
    .addTo(map);

  markers.push(marker);
}

// Setup event listeners
function setupEventListeners() {
  // Folder clicks
  document.getElementById('folder-list').addEventListener('click', (e) => {
    const folderItem = e.target.closest('.folder-item');
    if (folderItem) {
      currentFolder = folderItem.dataset.folder;

      // Update active state
      document.querySelectorAll('.folder-item').forEach(item => {
        item.classList.remove('active');
      });
      folderItem.classList.add('active');

      renderDestinations();
      updateMap();
    }
  });

  // Type filter clicks
  document.getElementById('type-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-filter')) {
      currentTypeFilter = e.target.dataset.type;

      // Update active state
      document.querySelectorAll('#type-filters .tag-filter').forEach(tag => {
        tag.classList.remove('active');
      });
      e.target.classList.add('active');

      renderDestinations();
      updateMap();
    }
  });

  // Region filter clicks
  document.getElementById('region-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-filter')) {
      currentRegionFilter = e.target.dataset.region;

      // Update active state
      document.querySelectorAll('#region-filters .tag-filter').forEach(tag => {
        tag.classList.remove('active');
      });
      e.target.classList.add('active');

      renderDestinations();
      updateMap();
    }
  });

  // Search input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', debounce(() => {
    currentSearch = searchInput.value.trim().toLowerCase();
    renderDestinations();
    updateMap();
  }, 300));

  // Create folder button
  document.getElementById('create-folder-btn').addEventListener('click', createFolder);

  // Export/Import
  document.getElementById('export-btn').addEventListener('click', exportDestinations);
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-input').click();
  });
  document.getElementById('import-input').addEventListener('change', importDestinations);
  document.getElementById('clear-all-btn').addEventListener('click', clearAllDestinations);

  // Discover tab - region selector
  document.getElementById('region-selector').addEventListener('change', (e) => {
    currentDiscoverRegion = e.target.value;
    renderDiscoverDestinations();
  });
  
  // Visited tab - sort selector
  document.getElementById('visited-sort').addEventListener('change', (e) => {
    renderVisitedDestinations();
  });

  // Discover tab - type filters
  document.getElementById('discover-filters').addEventListener('click', (e) => {
    if (e.target.classList.contains('tag-filter')) {
      currentDiscoverType = e.target.dataset.discoverType;

      // Update active state
      document.querySelectorAll('#discover-filters .tag-filter').forEach(tag => {
        tag.classList.remove('active');
      });
      e.target.classList.add('active');

      renderDiscoverDestinations();
    }
  });
}

// Setup tab switching
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      // Update active tab button
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.style.borderBottom = '3px solid transparent';
        b.style.color = 'var(--color-text-secondary)';
      });
      btn.classList.add('active');
      btn.style.borderBottom = '3px solid var(--color-primary)';
      btn.style.color = 'inherit';

      // Show/hide tab content
      document.getElementById('my-destinations-tab').style.display =
        tabName === 'my-destinations' ? 'block' : 'none';
      document.getElementById('discover-tab').style.display =
        tabName === 'discover' ? 'block' : 'none';
      document.getElementById('visited-tab').style.display =
        tabName === 'visited' ? 'block' : 'none';

      currentTab = tabName;
      
      // Render visited tab content when switching to it
      if (tabName === 'visited') {
        renderVisitedDestinations();
      }
    });
  });
}

// Get filtered destinations
function getFilteredDestinations() {
  let filtered = destinations;

  // Filter by folder
  if (currentFolder === 'bucketlist') {
    filtered = filtered.filter(d => !d.visited);
  } else if (currentFolder !== 'all') {
    filtered = filtered.filter(d => d.folder === currentFolder);
  }

  // Filter by type
  if (currentTypeFilter !== 'all') {
    filtered = filtered.filter(d => d.type === currentTypeFilter);
  }

  // Filter by region
  if (currentRegionFilter !== 'all') {
    filtered = filtered.filter(d => d.region === currentRegionFilter);
  }

  // Filter by search
  if (currentSearch) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(currentSearch) ||
      d.state.toLowerCase().includes(currentSearch) ||
      (d.notes && d.notes.toLowerCase().includes(currentSearch))
    );
  }

  return filtered;
}

// Render folders in sidebar
function renderFolders() {
  const folderList = document.getElementById('folder-list');

  // Clear custom folders (keep default ones)
  const customFolders = folderList.querySelectorAll('.folder-item[data-folder]:not([data-folder="all"]):not([data-folder="bucketlist"]):not([data-folder="visited"])');
  customFolders.forEach(folder => folder.remove());

  // Add custom folders
  folders.forEach(folder => {
    const count = destinations.filter(d => d.folder === folder.id).length;
    const li = document.createElement('li');
    li.className = 'folder-item';
    li.dataset.folder = folder.id;
    li.innerHTML = `
      <span>${folder.name}</span>
      <span class="folder-count">${count}</span>
    `;
    folderList.appendChild(li);
  });

  // Update counts
  document.getElementById('count-all').textContent = destinations.length;
}

// Render destinations grid
function renderDestinations() {
  const grid = document.getElementById('destinations-grid');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredDestinations();

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  filtered.forEach(dest => {
    const card = createDestinationCard(dest);
    grid.appendChild(card);
  });
}

// Create destination card HTML
function createDestinationCard(dest) {
  const card = document.createElement('div');
  card.className = 'destination-card';

  card.innerHTML = `
    <div class="destination-header">
      <h3 class="destination-title">${sanitizeHTML(dest.name)}</h3>
      <p class="destination-location">${sanitizeHTML(dest.state)}</p>
    </div>

    <div class="destination-tags">
      <span class="destination-tag">${getTypeLabel(dest.type)}</span>
      ${dest.region ? `<span class="destination-tag">${getRegionLabel(dest.region)}</span>` : ''}
      ${dest.visited ? '<span class="destination-tag" style="background-color: #10b981; color: white;">Visited</span>' : ''}
    </div>

    <div class="destination-info">
      ${dest.rvCamping ? `
        <div class="info-row">
          <span class="info-label">RV Camping</span>
          <span class="info-value">${sanitizeHTML(dest.rvCampingDetails || 'Available')}</span>
        </div>
      ` : ''}

      ${dest.bestSeason ? `
        <div class="info-row">
          <span class="info-label">Best Season</span>
          <span class="info-value">${sanitizeHTML(dest.bestSeason)}</span>
        </div>
      ` : ''}

      ${dest.estimatedCost ? `
        <div class="info-row">
          <span class="info-label">Est. Cost</span>
          <span class="info-value">${sanitizeHTML(dest.estimatedCost)}</span>
        </div>
      ` : ''}
    </div>

    ${dest.mustSee ? `
      <div style="margin-bottom: var(--space-3); padding: var(--space-2); background: var(--color-background-alt); border-radius: var(--radius-md);">
        <p style="font-weight: var(--font-weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);">Must See:</p>
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sanitizeHTML(dest.mustSee)}</p>
      </div>
    ` : ''}

    ${dest.notes ? `
      <div style="margin-bottom: var(--space-3);">
        <p style="font-weight: var(--font-weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);">Notes:</p>
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sanitizeHTML(dest.notes)}</p>
      </div>
    ` : ''}

    <div style="display: flex; gap: var(--space-2); margin-top: auto;">
      <button class="btn btn-small ${dest.visited ? 'btn-outline' : 'btn-primary'}" onclick="toggleVisited('${dest.id}')">
        ${dest.visited ? 'Mark as Bucketlist' : 'Mark as Visited'}
      </button>
      <button class="btn btn-small btn-outline" onclick="editDestination('${dest.id}')">Edit</button>
      <button class="btn btn-small btn-outline" onclick="deleteDestination('${dest.id}')" style="margin-left: auto;">Delete</button>
    </div>
  `;

  return card;
}

// Helper functions for labels
function getTypeLabel(type) {
  const labels = {
    'national-park': 'National Park',
    'state-park': 'State Park',
    'city': 'City',
    'attraction': 'Attraction',
    'campground': 'Campground',
    'scenic': 'Scenic Route'
  };
  return labels[type] || type;
}

function getRegionLabel(region) {
  const labels = {
    'southwest': 'Southwest',
    'pacific-northwest': 'Pacific Northwest',
    'east-coast': 'East Coast',
    'southeast': 'Southeast',
    'midwest': 'Midwest',
    'rocky-mountains': 'Rocky Mountains'
  };
  return labels[region] || region;
}

// Create new folder
async function createFolder() {
  const name = await promptDialog('Create Folder', 'Enter folder name:');

  if (name) {
    const folder = {
      id: generateId(),
      name: name,
      createdAt: new Date().toISOString()
    };

    folders.push(folder);
    saveFolders();
    renderFolders();
    showToast('Folder created!', 'success');
  }
}

// Toggle visited status
async function toggleVisited(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (!dest) return;

  dest.visited = !dest.visited;

  if (dest.visited) {
    const result = await formDialog('Mark as Visited', [
      {
        id: 'visitedDate',
        label: 'When did you visit?',
        type: 'text',
        placeholder: 'e.g., June 2026',
        value: ''
      },
      {
        id: 'visitedNotes',
        label: 'Notes about your visit',
        type: 'textarea',
        placeholder: 'Share your experience...',
        value: ''
      }
    ]);

    if (result) {
      dest.visitedDate = result.visitedDate;
      dest.visitedNotes = result.visitedNotes;
    }
  }

  saveDestinations();
  renderDestinations();
  renderFolders();
  updateMap();
  showToast(dest.visited ? 'Marked as visited!' : 'Moved to bucketlist', 'success');
}

// Edit destination (placeholder - will implement full edit dialog)
function editDestination(destId) {
  showToast('Edit feature coming soon', 'info');
}

// Delete destination
async function deleteDestination(destId) {
  const confirmed = await confirmDialog('Are you sure you want to delete this destination?');

  if (confirmed) {
    destinations = destinations.filter(d => d.id !== destId);
    saveDestinations();
    renderDestinations();
    renderFolders();
    updateMap();
    renderDiscoverDestinations(); // Refresh Discover tab to show deleted destination again
    showToast('Destination deleted', 'info');
  }
}

// View destination details (called from map popup)
window.viewDestinationDetails = function(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (!dest) return;

  // Initialize media array if it doesn't exist
  if (!dest.media) {
    dest.media = [];
  }

  // Generate media gallery HTML
  const mediaGalleryHTML = dest.media && dest.media.length > 0 ? `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--space-2); margin-top: var(--space-2);">
      ${dest.media.map((file, index) => {
        const isVideo = file.type.startsWith('video/');
        const mediaUrl = file.url || file.data; // Use Firebase URL or base64 data
        return `
          <div style="position: relative; border: 1px solid var(--color-border); border-radius: var(--border-radius); overflow: hidden; aspect-ratio: 1;">
            ${isVideo ? `
              <video src="${mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;"></video>
            ` : `
              <img src="${mediaUrl}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">
            `}
            <button
              onclick="deleteDestinationMedia('${destId}', ${index})"
              style="position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;"
              title="Delete"
            >&times;</button>
          </div>
        `;
      }).join('')}
    </div>
  ` : '<p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: var(--space-2);">No photos or videos yet.</p>';

  const modalContent = `
    <div style="max-width: 600px;">
      <h4 style="margin: 0 0 var(--space-2) 0; color: var(--color-primary);">${dest.name}</h4>
      <p style="margin: 0 0 var(--space-3) 0; color: var(--color-text-secondary);">${dest.state}</p>

      ${dest.rvCamping ? `
        <div style="margin-bottom: var(--space-3);">
          <strong>RV Camping:</strong>
          <p style="margin: var(--space-1) 0 0 0; color: var(--color-text-secondary);">${dest.rvCampingDetails || 'Available'}</p>
        </div>
      ` : ''}

      ${dest.bestSeason ? `
        <div style="margin-bottom: var(--space-3);">
          <strong>Best Season:</strong>
          <p style="margin: var(--space-1) 0 0 0; color: var(--color-text-secondary);">${dest.bestSeason}</p>
        </div>
      ` : ''}

      ${dest.mustSee ? `
        <div style="margin-bottom: var(--space-3);">
          <strong>Must See:</strong>
          <p style="margin: var(--space-1) 0 0 0; color: var(--color-text-secondary);">${dest.mustSee}</p>
        </div>
      ` : ''}

      ${dest.estimatedCost ? `
        <div style="margin-bottom: var(--space-3);">
          <strong>Estimated Cost:</strong>
          <p style="margin: var(--space-1) 0 0 0; color: var(--color-text-secondary);">${dest.estimatedCost}</p>
        </div>
      ` : ''}

      <div style="margin-top: var(--space-4);">
        <label style="display: block; font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          Photos & Videos:
        </label>
        <div style="margin-bottom: var(--space-2);">
          <input
            type="file"
            id="media-upload-input"
            accept="image/*,video/*"
            multiple
            style="display: none;"
          >
          <button
            id="upload-media-btn"
            class="btn btn-outline btn-small"
            style="width: 100%;"
          >
            Upload Photos/Videos
          </button>
        </div>
        <div id="media-gallery">
          ${mediaGalleryHTML}
        </div>
      </div>

      <div style="margin-top: var(--space-4);">
        <label for="destination-notes" style="display: block; font-weight: var(--font-weight-semibold); margin-bottom: var(--space-2);">
          Your Notes:
        </label>
        <textarea
          id="destination-notes"
          rows="6"
          style="width: 100%; padding: var(--space-2); border: 1px solid var(--color-border); border-radius: var(--border-radius); font-family: inherit; font-size: var(--text-base); resize: vertical;"
          placeholder="Add your personal notes about this destination..."
        >${dest.notes || ''}</textarea>
      </div>
    </div>
  `;

  const modal = createModal(`Visited: ${dest.name}`, modalContent, [
    { text: 'Save', action: 'save', class: 'btn-primary' },
    { text: 'Close', action: 'close', class: 'btn-outline' }
  ]);

  // Handle file upload button click
  const uploadBtn = modal.querySelector('#upload-media-btn');
  const fileInput = modal.querySelector('#media-upload-input');

  uploadBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Show loading indicator
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    for (const file of files) {
      // Check file size (max 10MB for Firebase Storage)
      if (file.size > 10 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 10MB)`, 'error');
        continue;
      }

      try {
        let mediaData;

        // Use Firebase Storage if available, otherwise fallback to base64
        if (window.FirebaseDB) {
          mediaData = await window.FirebaseDB.uploadMedia(file, destId);
        } else {
          // Fallback to base64
          const reader = new FileReader();
          const base64Data = await new Promise((resolve) => {
            reader.onload = (event) => resolve(event.target.result);
            reader.readAsDataURL(file);
          });

          mediaData = {
            name: file.name,
            type: file.type,
            data: base64Data,
            uploadedAt: new Date().toISOString()
          };
        }

        dest.media.push(mediaData);
        await saveDestinations();

        // Refresh the gallery
        const gallery = modal.querySelector('#media-gallery');
        const isVideo = file.type.startsWith('video/');
        const mediaUrl = mediaData.url || mediaData.data;
        const newMediaHTML = `
          <div style="position: relative; border: 1px solid var(--color-border); border-radius: var(--border-radius); overflow: hidden; aspect-ratio: 1;">
            ${isVideo ? `
              <video src="${mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;"></video>
            ` : `
              <img src="${mediaUrl}" alt="Photo" style="width: 100%; height: 100%; object-fit: cover;">
            `}
            <button
              onclick="deleteDestinationMedia('${destId}', ${dest.media.length - 1})"
              style="position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1;"
              title="Delete"
            >&times;</button>
          </div>
        `;

        // If gallery was empty, replace the "no photos" message
        if (gallery.querySelector('p')) {
          gallery.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: var(--space-2); margin-top: var(--space-2);">${newMediaHTML}</div>`;
        } else {
          // Append to existing grid
          gallery.querySelector('div').insertAdjacentHTML('beforeend', newMediaHTML);
        }

        showToast('Media uploaded successfully!', 'success');
      } catch (error) {
        console.error('Error uploading media:', error);
        showToast(`Failed to upload ${file.name}`, 'error');
      }
    }

    // Reset button
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload Photos/Videos';
    fileInput.value = '';
  });

  // Handle save button
  const buttons = modal.querySelectorAll('[data-action]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'save') {
        const notes = modal.querySelector('#destination-notes').value;
        dest.notes = notes;
        saveDestinations();
        showToast('Saved successfully!', 'success');
        modal.remove();
      } else if (btn.dataset.action === 'close') {
        modal.remove();
      }
    });
  });

  document.body.appendChild(modal);
};

// Delete media from destination
window.deleteDestinationMedia = async function(destId, mediaIndex) {
  if (!confirm('Are you sure you want to delete this photo/video?')) {
    return;
  }

  const dest = destinations.find(d => d.id === destId);
  if (!dest || !dest.media) return;

  const mediaItem = dest.media[mediaIndex];

  // Delete from Firebase Storage if it has a path
  if (mediaItem.path && window.FirebaseDB) {
    try {
      await window.FirebaseDB.deleteMedia(mediaItem.path);
    } catch (error) {
      console.error('Error deleting from Firebase Storage:', error);
    }
  }

  // Remove the media item from array
  dest.media.splice(mediaIndex, 1);
  await saveDestinations();

  // Re-open the modal to refresh the view
  viewDestinationDetails(destId);
  showToast('Media deleted successfully', 'success');
};

// Export destinations
function exportDestinations() {
  DataManager.exportPageData('destinations', 'destinations');
}

// Import destinations
async function importDestinations(e) {
  const file = e.target.files[0];
  if (file) {
    await DataManager.importData(file);
  }
  e.target.value = '';
}

// Clear all destinations
function clearAllDestinations() {
  if (confirm('Are you sure you want to clear ALL destinations and folders? This cannot be undone!')) {
    destinations = [];
    folders = [];
    saveDestinations();
    saveFolders();
    renderDestinations();
    renderFolders();
    updateMap();
    alert('All destinations and folders have been cleared.');
  }
}

// Load/Save functions
async function loadDestinations() {
  if (window.FirebaseDB) {
    destinations = await window.FirebaseDB.loadDestinations();
  } else {
    destinations = Storage.get('destinations', []);
  }
}

async function saveDestinations() {
  if (window.FirebaseDB) {
    await window.FirebaseDB.saveDestinations(destinations);
  } else {
    Storage.set('destinations', destinations);
  }
}

async function loadFolders() {
  if (window.FirebaseDB) {
    folders = await window.FirebaseDB.loadFolders();
  } else {
    folders = Storage.get('folders', []);
  }
}

async function saveFolders() {
  if (window.FirebaseDB) {
    await window.FirebaseDB.saveFolders(folders);
  } else {
    Storage.set('folders', folders);
  }
}

function loadNationalParks() {
  // Load complete National Parks database if available
  if (typeof NATIONAL_PARKS_COMPLETE !== 'undefined') {
    nationalParksData = NATIONAL_PARKS_COMPLETE;
  } else if (typeof SAMPLE_DESTINATIONS !== 'undefined') {
    // Fallback to sample data
    nationalParksData = SAMPLE_DESTINATIONS.filter(d => d.type === 'national-park');
  } else {
    nationalParksData = [];
  }
}

function loadDiscoverDestinations() {
  // Load discover destinations database (non-National Parks)
  if (typeof ALL_DISCOVER_DESTINATIONS !== 'undefined') {
    discoverDestinations = ALL_DISCOVER_DESTINATIONS;
    console.log(`Loaded ${discoverDestinations.length} discover destinations`);
  } else if (typeof DISCOVER_DESTINATIONS !== 'undefined') {
    discoverDestinations = DISCOVER_DESTINATIONS;
    console.log(`Loaded ${discoverDestinations.length} discover destinations (fallback)`);
  } else {
    discoverDestinations = [];
    console.log('No discover destinations loaded');
  }
}

// Render Discover tab recommendations
function renderDiscoverDestinations() {
  const grid = document.getElementById('recommended-grid');
  const emptyState = document.getElementById('discover-empty');

  // If no region selected, show empty state
  if (!currentDiscoverRegion || currentDiscoverRegion === '') {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  // Use ONLY Discover destinations (NOT National Parks - those are only in Bucketlist)
  let allDestinations = [...discoverDestinations];

  // FILTER OUT destinations already in Bucketlist
  allDestinations = allDestinations.filter(d => {
    return !destinations.find(userDest => userDest.id === d.id);
  });

  let filtered = allDestinations;

  // Filter by specific state or region (skip if 'all' is selected)
  if (currentDiscoverRegion && currentDiscoverRegion !== 'all') {
    // List of valid regions
    const regions = ['southwest', 'pacific-northwest', 'rocky-mountains', 'midwest', 'southeast', 'east-coast', 'alaska', 'hawaii', 'territories'];

    if (regions.includes(currentDiscoverRegion.toLowerCase())) {
      // Filter by region
      filtered = filtered.filter(d => d.region === currentDiscoverRegion.toLowerCase());
    } else {
      // Filter by state/province name (check if state contains the search term)
      filtered = filtered.filter(d =>
        d.state.toLowerCase().includes(currentDiscoverRegion.toLowerCase())
      );
    }
  }

  // Filter by type (no National Parks - those are only in Bucketlist)
  if (currentDiscoverType === 'state-park') {
    filtered = filtered.filter(d => d.type === 'state-park');
  } else if (currentDiscoverType === 'city') {
    filtered = filtered.filter(d => d.type === 'city');
  } else if (currentDiscoverType === 'attraction') {
    filtered = filtered.filter(d => d.type === 'attraction');
  } else if (currentDiscoverType === 'scenic') {
    filtered = filtered.filter(d => d.type === 'scenic');
  }

  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = 'No destinations found';
    emptyState.querySelector('p').textContent = 'Try selecting a different region or filter';
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  filtered.forEach(dest => {
    const card = createRecommendationCard(dest);
    grid.appendChild(card);
  });
}

// Create recommendation card for Discover tab
function createRecommendationCard(dest) {
  const card = document.createElement('div');
  card.className = 'destination-card';

  // Check if already in user's destinations
  const alreadyAdded = destinations.find(d => d.id === dest.id);

  card.innerHTML = `
    <div class="destination-header">
      <h3 class="destination-title">${sanitizeHTML(dest.name)}</h3>
      <p class="destination-location">${sanitizeHTML(dest.state)}</p>
    </div>

    <div class="destination-tags">
      <span class="destination-tag">${getTypeLabel(dest.type)}</span>
      ${dest.region ? `<span class="destination-tag">${getRegionLabel(dest.region)}</span>` : ''}
      ${alreadyAdded ? '<span class="destination-tag" style="background-color: #10b981; color: white;">In Destinations</span>' : ''}
    </div>

    <div class="destination-info">
      ${dest.rvCamping ? `
        <div class="info-row">
          <span class="info-label">RV Camping</span>
          <span class="info-value">${sanitizeHTML(dest.rvCampingDetails || 'Available')}</span>
        </div>
      ` : ''}

      ${dest.bestSeason ? `
        <div class="info-row">
          <span class="info-label">Best Season</span>
          <span class="info-value">${sanitizeHTML(dest.bestSeason)}</span>
        </div>
      ` : ''}

      ${dest.estimatedCost ? `
        <div class="info-row">
          <span class="info-label">Est. Cost</span>
          <span class="info-value">${sanitizeHTML(dest.estimatedCost)}</span>
        </div>
      ` : ''}
    </div>

    ${dest.mustSee ? `
      <div style="margin-bottom: var(--space-3); padding: var(--space-2); background: var(--color-background-alt); border-radius: var(--radius-md);">
        <p style="font-weight: var(--font-weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);">Must See:</p>
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sanitizeHTML(dest.mustSee)}</p>
      </div>
    ` : ''}

    ${dest.notes ? `
      <div style="margin-bottom: var(--space-3);">
        <p style="font-weight: var(--font-weight-semibold); font-size: var(--text-sm); margin-bottom: var(--space-1);">Notes:</p>
        <p style="font-size: var(--text-sm); color: var(--color-text-secondary);">${sanitizeHTML(dest.notes)}</p>
      </div>
    ` : ''}

    <div style="display: flex; gap: var(--space-2); margin-top: auto; flex-wrap: wrap;">
      ${!alreadyAdded ? `
        <button class="btn btn-small btn-primary" onclick="addNationalParkToDestinations('${dest.id}')">
          Add to Bucketlist
        </button>
        <button class="btn btn-small btn-outline" onclick="addToFolderFromDiscover('${dest.id}')">
          Add to Folder...
        </button>
      ` : `
        <button class="btn btn-small btn-outline" disabled>
          Already Added
        </button>
      `}
    </div>
  `;

  return card;
}

// Add destination to user's list from map or Discover tab
window.addNationalParkToDestinations = async function(destId) {
  // Find in National Parks or Discover destinations
  let destination = nationalParksData.find(p => p.id === destId);
  if (!destination) {
    destination = discoverDestinations.find(d => d.id === destId);
  }
  if (!destination) return;

  // Check if already exists
  if (destinations.find(d => d.id === destId)) {
    showToast('This destination is already in your list', 'info');
    return;
  }

  // Add to destinations (automatically marked as visited - will be green pin)
  destinations.push({
    ...destination,
    visited: true,
    folder: null,
    addedDate: new Date().toISOString()
  });

  await saveDestinations();
  renderDestinations();
  renderFolders();
  updateMap();
  renderDiscoverDestinations(); // Refresh Discover tab to show "Already Added"
  showToast(`${destination.name} added to your destinations!`, 'success');
};

// Add to folder from Discover tab
window.addToFolderFromDiscover = async function(destId) {
  // Find in National Parks or Discover destinations
  let destination = nationalParksData.find(p => p.id === destId);
  if (!destination) {
    destination = discoverDestinations.find(d => d.id === destId);
  }
  if (!destination) return;

  // Check if already exists
  if (destinations.find(d => d.id === destId)) {
    showToast('This destination is already in your list', 'info');
    return;
  }

  // Show folder selection
  if (folders.length === 0) {
    showToast('Create a folder first before adding to folder', 'info');
    return;
  }

  const folderOptions = folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
  const modal = createModal('Add to Folder', `
    <p style="margin-bottom: var(--space-3);">Add <strong>${sanitizeHTML(destination.name)}</strong> to which folder?</p>
    <select id="folder-select" class="form-select">
      <option value="">Select folder...</option>
      ${folderOptions}
    </select>
  `, [
    { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
    { text: 'Add', class: 'btn-primary', action: 'add' }
  ]);

  const buttons = modal.querySelectorAll('[data-action]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (action === 'add') {
        const folderId = modal.querySelector('#folder-select').value;
        if (!folderId) {
          showToast('Please select a folder', 'error');
          return;
        }

        // Add to destinations with folder
        destinations.push({
          ...destination,
          visited: false,
          folder: folderId,
          addedDate: new Date().toISOString()
        });

        saveDestinations();
        renderDestinations();
        renderFolders();
        updateMap();
        renderDiscoverDestinations();

        const folder = folders.find(f => f.id === folderId);
        showToast(`${destination.name} added to ${folder.name}!`, 'success');
      }

      modal.remove();
    });
  });
};

// Render visited destinations
function renderVisitedDestinations() {
  const grid = document.getElementById('visited-grid');
  const emptyState = document.getElementById('visited-empty');
  
  // Filter only visited destinations
  const visitedDestinations = destinations.filter(d => d.visited === true);
  
  grid.innerHTML = '';
  
  if (visitedDestinations.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  grid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  // Sort visited destinations based on select value
  const sortSelect = document.getElementById('visited-sort');
  const sortValue = sortSelect ? sortSelect.value : 'date-desc';
  
  let sorted = [...visitedDestinations];
  switch (sortValue) {
    case 'date-desc':
      sorted.sort((a, b) => new Date(b.visitedDate || b.addedDate) - new Date(a.visitedDate || a.addedDate));
      break;
    case 'date-asc':
      sorted.sort((a, b) => new Date(a.visitedDate || a.addedDate) - new Date(b.visitedDate || b.addedDate));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'state':
      sorted.sort((a, b) => a.state.localeCompare(b.state));
      break;
  }
  
  sorted.forEach(dest => {
    const card = createVisitedCard(dest);
    grid.appendChild(card);
  });
}

// Create visited destination card
function createVisitedCard(dest) {
  const card = document.createElement('div');
  card.className = 'destination-card';
  
  card.innerHTML = `
    <div class="destination-header">
      <h3 class="destination-title">${sanitizeHTML(dest.name)}</h3>
      <p class="destination-location">${sanitizeHTML(dest.state)}</p>
    </div>
    
    <div class="destination-tags">
      <span class="destination-tag">${getTypeLabel(dest.type)}</span>
      ${dest.region ? `<span class="destination-tag">${getRegionLabel(dest.region)}</span>` : ''}
      <span class="destination-tag" style="background-color: #10b981; color: white;">Visited</span>
    </div>
    
    <div class="destination-info">
      ${dest.visitedDate ? `
        <div class="info-row">
          <span class="info-label">Visited Date</span>
          <span class="info-value">${new Date(dest.visitedDate).toLocaleDateString()}</span>
        </div>
      ` : ''}
      
      ${dest.rating ? `
        <div class="info-row">
          <span class="info-label">Rating</span>
          <span class="info-value">${'★'.repeat(dest.rating)}${'☆'.repeat(5 - dest.rating)}</span>
        </div>
      ` : ''}
      
      ${dest.notes ? `
        <div class="info-row">
          <span class="info-label">Notes</span>
          <span class="info-value">${sanitizeHTML(dest.notes)}</span>
        </div>
      ` : ''}
    </div>
    
    <div style="display: flex; gap: var(--space-2); margin-top: var(--space-3);">
      <button class="btn btn-outline btn-small" onclick="editDestination('${dest.id}')">
        Edit
      </button>
      <button class="btn btn-outline btn-small" onclick="toggleVisited('${dest.id}')">
        Mark as Not Visited
      </button>
    </div>
  `;
  
  return card;
}

// Toggle visited status
window.toggleVisited = function(id) {
  const dest = destinations.find(d => d.id === id);
  if (dest) {
    dest.visited = !dest.visited;
    if (dest.visited) {
      if (!dest.visitedDate) {
        dest.visitedDate = new Date().toISOString();
      }
      // Clear notes when marking as visited so user can write fresh visit notes
      dest.notes = '';
    }
    saveDestinations();
    renderDestinations();
    renderFolders();
    updateMap();
    if (currentTab === 'visited') {
      renderVisitedDestinations();
    }
    showToast(`${dest.name} marked as ${dest.visited ? 'visited' : 'not visited'}`, 'success');
  }
};
