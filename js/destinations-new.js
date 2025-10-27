// New Destinations Management with Leaflet Map

let destinations = [];
let folders = [];
let map = null;
let markers = [];
let currentFolder = 'all';
let currentTypeFilter = 'all';
let currentRegionFilter = 'all';
let currentSearch = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDestinations();
  loadFolders();
  initializeMap();
  setupEventListeners();
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

// Update map with current destinations
function updateMap() {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // Get filtered destinations
  const filtered = getFilteredDestinations();

  // Add markers for each destination
  filtered.forEach(dest => {
    if (dest.latitude && dest.longitude) {
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${dest.visited ? '#10b981' : '#3b82f6'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([dest.latitude, dest.longitude], { icon })
        .bindPopup(`
          <div style="min-width: 200px;">
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${dest.name}</h4>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${dest.state}</p>
            ${dest.rvCamping ? '<p style="margin: 4px 0; font-size: 13px;">✓ RV Camping Available</p>' : ''}
            ${dest.bestSeason ? `<p style="margin: 4px 0; font-size: 13px;">Best: ${dest.bestSeason}</p>` : ''}
            <button onclick="viewDestinationDetails('${dest.id}')" style="margin-top: 8px; padding: 4px 12px; background: var(--color-primary); color: white; border: none; border-radius: 4px; cursor: pointer;">View Details</button>
          </div>
        `)
        .addTo(map);

      markers.push(marker);
    }
  });

  // Adjust map bounds if there are markers
  if (markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
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
}

// Get filtered destinations
function getFilteredDestinations() {
  let filtered = destinations;

  // Filter by folder
  if (currentFolder === 'wishlist') {
    filtered = filtered.filter(d => !d.visited);
  } else if (currentFolder === 'visited') {
    filtered = filtered.filter(d => d.visited);
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
  const customFolders = folderList.querySelectorAll('.folder-item[data-folder]:not([data-folder="all"]):not([data-folder="wishlist"]):not([data-folder="visited"])');
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
  document.getElementById('count-wishlist').textContent = destinations.filter(d => !d.visited).length;
  document.getElementById('count-visited').textContent = destinations.filter(d => d.visited).length;
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
        ${dest.visited ? 'Mark as Wishlist' : 'Mark as Visited'}
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
  showToast(dest.visited ? 'Marked as visited!' : 'Moved to wishlist', 'success');
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
    showToast('Destination deleted', 'info');
  }
}

// View destination details (called from map popup)
window.viewDestinationDetails = function(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (dest) {
    // Scroll to the destination card
    renderDestinations();
    // Could enhance this to highlight the specific card
  }
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

// Load/Save functions
function loadDestinations() {
  destinations = Storage.get('destinations', []);
}

function saveDestinations() {
  Storage.set('destinations', destinations);
}

function loadFolders() {
  folders = Storage.get('folders', []);
}

function saveFolders() {
  Storage.set('folders', folders);
}
