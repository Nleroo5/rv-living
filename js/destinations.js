// Destinations Management

let destinations = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'date-desc';

document.addEventListener('DOMContentLoaded', () => {
  // Load destinations
  loadDestinations();

  // Add destination form
  const addForm = document.getElementById('add-destination-form');
  addForm.addEventListener('submit', handleAddDestination);

  // Search input
  const searchInput = document.getElementById('destinations-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentSearch = searchInput.value.trim().toLowerCase();
      renderDestinations();
    }, 300));
  }

  // Sort select
  const sortSelect = document.getElementById('destinations-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderDestinations();
    });
  }

  // Filter buttons
  const filterButtons = document.querySelectorAll('.dest-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderDestinations();
    });
  });

  // Quick add buttons
  const quickAddButtons = document.querySelectorAll('.quick-add-btn');
  quickAddButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const state = btn.dataset.state;
      const type = btn.dataset.type;

      quickAddDestination(name, state, type);
    });
  });

  // Export/Import buttons
  const exportBtn = document.getElementById('export-destinations-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      DataManager.exportPageData('destinations', 'destinations');
    });
  }

  const importBtn = document.getElementById('import-destinations-btn');
  const importInput = document.getElementById('import-destinations-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await DataManager.importData(file);
      }
      e.target.value = ''; // Reset input
    });
  }
});

// Load destinations from storage
function loadDestinations() {
  destinations = Storage.get('destinations', []);
  renderDestinations();
  updateStats();
}

// Save destinations to storage
function saveDestinations() {
  Storage.set('destinations', destinations);
  updateStats();
}

// Handle add destination form
function handleAddDestination(e) {
  e.preventDefault();

  const name = document.getElementById('dest-name').value.trim();
  const state = document.getElementById('dest-state').value.trim();
  const type = document.getElementById('dest-type').value;
  const notes = document.getElementById('dest-notes').value.trim();
  const priority = document.getElementById('dest-priority').value;
  const season = document.getElementById('dest-season').value;

  if (!name || !state) {
    showToast('Please enter location name and state', 'error');
    return;
  }

  const newDestination = {
    id: generateId(),
    name,
    state,
    type,
    notes,
    priority,
    season,
    visited: false,
    visitedDates: null,
    visitedNotes: '',
    createdAt: new Date().toISOString()
  };

  destinations.unshift(newDestination);
  saveDestinations();
  renderDestinations();

  // Reset form
  e.target.reset();

  showToast('Destination added!', 'success');
  showSaveIndicator();
}

// Quick add destination
function quickAddDestination(name, state, type) {
  const newDestination = {
    id: generateId(),
    name,
    state,
    type,
    notes: '',
    priority: 'wishlist',
    season: 'any',
    visited: false,
    visitedDates: null,
    visitedNotes: '',
    createdAt: new Date().toISOString()
  };

  destinations.unshift(newDestination);
  saveDestinations();
  renderDestinations();

  showToast(`${name} added to your list!`, 'success');
}

// Render destinations
function renderDestinations() {
  const container = document.getElementById('destinations-container');
  const emptyMessage = document.getElementById('empty-destinations');

  // Filter destinations
  let filtered = destinations;

  // Apply category filter
  if (currentFilter === 'visited') {
    filtered = filtered.filter(d => d.visited);
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(d => d.type === currentFilter);
  }

  // Apply search
  if (currentSearch) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(currentSearch) ||
      d.state.toLowerCase().includes(currentSearch) ||
      (d.notes && d.notes.toLowerCase().includes(currentSearch))
    );
  }

  // Apply sort
  filtered = sortDestinations(filtered, currentSort);

  // Clear container
  const cards = container.querySelectorAll('.card:not(#empty-destinations)');
  cards.forEach(card => card.remove());

  if (filtered.length === 0) {
    emptyMessage.style.display = 'block';
    if (currentSearch) {
      emptyMessage.querySelector('p').textContent = `No destinations match "${currentSearch}"`;
    } else {
      emptyMessage.querySelector('p').textContent = currentFilter === 'all'
        ? 'Start adding places you want to visit!'
        : 'No destinations in this category yet.';
    }
  } else {
    emptyMessage.style.display = 'none';

    filtered.forEach(destination => {
      const card = createDestinationCard(destination);
      container.appendChild(card);
    });
  }
}

// Sort destinations
function sortDestinations(items, sortBy) {
  const sorted = [...items];

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'priority-high':
      const priorityOrder = { high: 0, medium: 1, low: 2, wishlist: 3 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    default:
      return sorted;
  }
}

// Create destination card
function createDestinationCard(dest) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = dest.id;

  const typeIcons = {
    'national-park': '🏔️',
    'state-park': '🌲',
    'campground': '🏕️',
    'city': '🏙️',
    'scenic': '🛣️',
    'attraction': '🎡',
    'other': '📍'
  };

  const typeLabels = {
    'national-park': 'National Park',
    'state-park': 'State Park',
    'campground': 'Campground',
    'city': 'City',
    'scenic': 'Scenic Route',
    'attraction': 'Attraction',
    'other': 'Other'
  };

  const priorityColors = {
    wishlist: 'var(--color-text-secondary)',
    high: 'var(--color-error)',
    medium: 'var(--color-accent)',
    low: 'var(--color-primary)'
  };

  const priorityLabels = {
    wishlist: 'Wishlist',
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
  };

  card.innerHTML = `
    <div class="card-header">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="font-size: var(--text-2xl); margin-bottom: var(--space-1);">
            ${typeIcons[dest.type]}
          </div>
          <h3 class="card-title" style="margin-bottom: var(--space-1);">${sanitizeHTML(dest.name)}</h3>
          <p class="card-subtitle">${sanitizeHTML(dest.state)}</p>
        </div>
        <button class="file-item-remove" data-id="${dest.id}" aria-label="Delete destination">
          ✕
        </button>
      </div>
    </div>
    <div class="card-body">
      <div style="display: flex; gap: var(--space-1); flex-wrap: wrap; margin-bottom: var(--space-2);">
        <span class="badge badge-primary">${typeLabels[dest.type]}</span>
        <span class="badge" style="background-color: ${priorityColors[dest.priority]}20; color: ${priorityColors[dest.priority]};">
          ${priorityLabels[dest.priority]}
        </span>
        ${dest.season !== 'any' ? `
          <span class="badge" style="background-color: rgba(59, 130, 246, 0.1); color: var(--color-info);">
            ${dest.season.charAt(0).toUpperCase() + dest.season.slice(1)}
          </span>
        ` : ''}
        ${dest.visited ? '<span class="badge badge-success">✓ Visited</span>' : ''}
      </div>
      ${dest.notes ? `<p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-2);">${sanitizeHTML(dest.notes)}</p>` : ''}

      ${dest.visited && dest.visitedDates ? `
        <div style="background-color: var(--color-background-alt); padding: var(--space-2); border-radius: var(--radius-md); margin-top: var(--space-2);">
          <div style="font-weight: var(--font-weight-semibold); color: var(--color-success); font-size: var(--text-sm); margin-bottom: var(--space-1);">
            📅 Visited: ${dest.visitedDates}
          </div>
          ${dest.visitedNotes ? `
            <div style="color: var(--color-text-secondary); font-size: var(--text-sm); font-style: italic;">
              "${sanitizeHTML(dest.visitedNotes)}"
            </div>
          ` : ''}
        </div>
      ` : ''}
    </div>
    <div class="card-footer">
      <div style="display: flex; gap: var(--space-2); width: 100%;">
        <button class="btn btn-small ${dest.visited ? 'btn-outline' : 'btn-primary'} mark-visited-btn" style="flex: 1;" data-id="${dest.id}">
          ${dest.visited ? '↩️ Mark as Not Visited' : '✓ Mark as Visited'}
        </button>
        <button class="btn btn-small btn-outline edit-btn" data-id="${dest.id}">
          ✏️ Edit
        </button>
      </div>
    </div>
  `;

  // Mark visited button
  const visitedBtn = card.querySelector('.mark-visited-btn');
  visitedBtn.addEventListener('click', () => {
    toggleVisited(dest.id);
  });

  // Edit button
  const editBtn = card.querySelector('.edit-btn');
  editBtn.addEventListener('click', () => {
    editDestination(dest.id);
  });

  // Delete button
  const deleteBtn = card.querySelector('.file-item-remove');
  deleteBtn.addEventListener('click', async () => {
    const confirmed = await confirmDialog(`Delete "${dest.name}"?`);
    if (confirmed) {
      deleteDestination(dest.id);
    }
  });

  return card;
}

// Toggle visited status
async function toggleVisited(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (!dest) return;

  if (!dest.visited) {
    // Marking as visited - use modal form
    const result = await formDialog(`Mark "${dest.name}" as Visited`, [
      {
        id: 'visitedDates',
        label: 'When did you visit?',
        type: 'text',
        placeholder: 'e.g., June 5-7, 2026 or July 2026',
        value: ''
      },
      {
        id: 'visitedNotes',
        label: 'Memorable moments or tips (optional)',
        type: 'textarea',
        placeholder: 'Share your experience...',
        value: ''
      }
    ]);

    if (result) {
      dest.visited = true;
      dest.visitedDates = result.visitedDates || 'Visited';
      dest.visitedNotes = result.visitedNotes || '';
      showToast('Marked as visited! 🎉', 'success');
    } else {
      return;
    }
  } else {
    // Unmarking as visited - clear the data
    const confirmed = await confirmDialog(`Remove visited status for ${dest.name}?\n\nThis will clear dates and notes.`);

    if (confirmed) {
      dest.visited = false;
      dest.visitedDates = null;
      dest.visitedNotes = '';
      showToast('Marked as not visited', 'info');
    } else {
      return;
    }
  }

  saveDestinations();
  renderDestinations();
  showSaveIndicator();
}

// Edit destination
function editDestination(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (!dest) return;

  // Populate form
  document.getElementById('dest-name').value = dest.name;
  document.getElementById('dest-state').value = dest.state;
  document.getElementById('dest-type').value = dest.type;
  document.getElementById('dest-notes').value = dest.notes || '';
  document.getElementById('dest-priority').value = dest.priority;
  document.getElementById('dest-season').value = dest.season;

  // Delete the old one
  deleteDestination(destId, false);

  // Scroll to form
  document.getElementById('add-destination-form').scrollIntoView({ behavior: 'smooth' });

  showToast('Edit the destination and submit to save changes', 'info');
}

// Delete destination
function deleteDestination(destId, showMessage = true) {
  destinations = destinations.filter(d => d.id !== destId);
  saveDestinations();
  renderDestinations();
  if (showMessage) {
    showToast('Destination deleted', 'info');
  }
}

// Update statistics
function updateStats() {
  const total = destinations.length;
  const visited = destinations.filter(d => d.visited).length;
  const wishlist = destinations.filter(d => !d.visited).length;

  document.getElementById('destinations-total').textContent = total;
  document.getElementById('destinations-visited').textContent = visited;
  document.getElementById('destinations-wishlist').textContent = wishlist;

  // Update map stats
  updateMapStats();
}

// Load destinations from database
function loadDestinationsFromDatabase(categoryData, categoryName) {
  let addedCount = 0;
  let skippedCount = 0;

  categoryData.forEach(item => {
    // Check if destination already exists
    const exists = destinations.some(d =>
      d.name.toLowerCase() === item.name.toLowerCase() &&
      d.state.toLowerCase() === item.state.toLowerCase()
    );

    if (!exists) {
      const newDestination = {
        id: generateId(),
        name: item.name,
        state: item.state,
        type: item.type,
        notes: item.notes || '',
        priority: 'wishlist',
        season: 'any',
        visited: false,
        visitedDates: null,
        visitedNotes: '',
        createdAt: new Date().toISOString()
      };

      destinations.unshift(newDestination);
      addedCount++;
    } else {
      skippedCount++;
    }
  });

  if (addedCount > 0) {
    saveDestinations();
    renderDestinations();
    updateMapVisualization();

    if (skippedCount > 0) {
      showToast(`Added ${addedCount} new destinations! (${skippedCount} already in your list)`, 'success');
    } else {
      showToast(`Added ${addedCount} ${categoryName} to your list!`, 'success');
    }
  } else {
    showToast(`All ${categoryName} are already in your list!`, 'info');
  }
}

// Load category button handlers
document.addEventListener('DOMContentLoaded', () => {
  // National Parks button
  const nationalParksBtn = document.getElementById('load-national-parks-btn');
  if (nationalParksBtn) {
    nationalParksBtn.addEventListener('click', () => {
      if (typeof NATIONAL_PARKS !== 'undefined') {
        loadDestinationsFromDatabase(NATIONAL_PARKS, 'National Parks');
      } else {
        showToast('Database not loaded. Please refresh the page.', 'error');
      }
    });
  }

  // State Parks button
  const stateParksBtn = document.getElementById('load-state-parks-btn');
  if (stateParksBtn) {
    stateParksBtn.addEventListener('click', () => {
      if (typeof STATE_PARKS !== 'undefined') {
        loadDestinationsFromDatabase(STATE_PARKS, 'State Parks');
      } else {
        showToast('Database not loaded. Please refresh the page.', 'error');
      }
    });
  }

  // Attractions button
  const attractionsBtn = document.getElementById('load-attractions-btn');
  if (attractionsBtn) {
    attractionsBtn.addEventListener('click', () => {
      if (typeof MUST_SEE_ATTRACTIONS !== 'undefined') {
        loadDestinationsFromDatabase(MUST_SEE_ATTRACTIONS, 'Attractions');
      } else {
        showToast('Database not loaded. Please refresh the page.', 'error');
      }
    });
  }

  // RV-Friendly button
  const rvFriendlyBtn = document.getElementById('load-rv-friendly-btn');
  if (rvFriendlyBtn) {
    rvFriendlyBtn.addEventListener('click', () => {
      if (typeof RV_FRIENDLY !== 'undefined') {
        loadDestinationsFromDatabase(RV_FRIENDLY, 'RV-Friendly Destinations');
      } else {
        showToast('Database not loaded. Please refresh the page.', 'error');
      }
    });
  }

  // Load ALL button
  const loadAllBtn = document.getElementById('load-all-destinations-btn');
  if (loadAllBtn) {
    loadAllBtn.addEventListener('click', async () => {
      const confirmed = await confirmDialog(
        'Add ALL 160+ destinations to your list?\n\nThis includes all National Parks, State Parks, attractions, and RV-friendly spots!'
      );

      if (confirmed) {
        let totalAdded = 0;

        if (typeof NATIONAL_PARKS !== 'undefined') {
          const before = destinations.length;
          loadDestinationsFromDatabase(NATIONAL_PARKS, 'destinations');
          totalAdded += destinations.length - before;
        }

        if (typeof STATE_PARKS !== 'undefined') {
          const before = destinations.length;
          loadDestinationsFromDatabase(STATE_PARKS, 'destinations');
          totalAdded += destinations.length - before;
        }

        if (typeof MUST_SEE_ATTRACTIONS !== 'undefined') {
          const before = destinations.length;
          loadDestinationsFromDatabase(MUST_SEE_ATTRACTIONS, 'destinations');
          totalAdded += destinations.length - before;
        }

        if (typeof RV_FRIENDLY !== 'undefined') {
          const before = destinations.length;
          loadDestinationsFromDatabase(RV_FRIENDLY, 'destinations');
          totalAdded += destinations.length - before;
        }

        showToast(`Added ${totalAdded} destinations to your list! 🎉`, 'success');
      }
    });
  }
});

// Map visualization functions
function updateMapStats() {
  const mapStats = document.getElementById('map-stats');
  if (mapStats) {
    const count = destinations.length;
    mapStats.textContent = count === 1 ? '1 destination' : `${count} destinations`;
  }
}

function updateMapVisualization() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || destinations.length === 0) return;

  // Simple visual representation using dots on a stylized US map
  mapContainer.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
      <div style="text-align: center;">
        <div style="font-size: var(--text-6xl); margin-bottom: var(--space-3);">🗺️</div>
        <div style="font-size: var(--text-xl); font-weight: var(--font-weight-bold); color: var(--color-primary); margin-bottom: var(--space-2);">
          ${destinations.length} Destinations Added!
        </div>
        <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; justify-content: center; max-width: 600px; margin: 0 auto;">
          ${getDestinationBreakdown()}
        </div>
      </div>
    </div>
  `;
}

function getDestinationBreakdown() {
  const types = {
    'national-park': { icon: '🏔️', label: 'National Parks', count: 0 },
    'state-park': { icon: '🌲', label: 'State Parks', count: 0 },
    'campground': { icon: '🏕️', label: 'Campgrounds', count: 0 },
    'attraction': { icon: '🎡', label: 'Attractions', count: 0 },
    'city': { icon: '🏙️', label: 'Cities', count: 0 },
    'scenic': { icon: '🛣️', label: 'Scenic Routes', count: 0 },
    'other': { icon: '📍', label: 'Other', count: 0 }
  };

  destinations.forEach(d => {
    if (types[d.type]) {
      types[d.type].count++;
    }
  });

  return Object.entries(types)
    .filter(([_, data]) => data.count > 0)
    .map(([_, data]) => `
      <div style="background: white; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
        <div style="font-size: var(--text-2xl);">${data.icon}</div>
        <div style="font-size: var(--text-sm); font-weight: var(--font-weight-semibold); margin-top: var(--space-1);">${data.count}</div>
        <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">${data.label}</div>
      </div>
    `).join('');
}

// Initialize map on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (destinations.length > 0) {
      updateMapVisualization();
    }
  }, 500);
});
