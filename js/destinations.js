// Destinations Management

let destinations = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Load destinations
  loadDestinations();

  // Add destination form
  const addForm = document.getElementById('add-destination-form');
  addForm.addEventListener('submit', handleAddDestination);

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
    createdAt: new Date().toISOString()
  };

  destinations.unshift(newDestination);
  saveDestinations();
  renderDestinations();

  // Reset form
  e.target.reset();

  showToast('Destination added!', 'success');
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

  if (currentFilter === 'visited') {
    filtered = destinations.filter(d => d.visited);
  } else if (currentFilter !== 'all') {
    filtered = destinations.filter(d => d.type === currentFilter);
  }

  // Clear container
  const cards = container.querySelectorAll('.card:not(#empty-destinations)');
  cards.forEach(card => card.remove());

  if (filtered.length === 0) {
    emptyMessage.style.display = 'block';
    emptyMessage.querySelector('p').textContent = currentFilter === 'all'
      ? 'Start adding places you want to visit!'
      : 'No destinations in this category yet.';
  } else {
    emptyMessage.style.display = 'none';

    filtered.forEach(destination => {
      const card = createDestinationCard(destination);
      container.appendChild(card);
    });
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
      ${dest.notes ? `<p style="color: var(--color-text-secondary); font-size: var(--text-sm);">${sanitizeHTML(dest.notes)}</p>` : ''}
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
function toggleVisited(destId) {
  const dest = destinations.find(d => d.id === destId);
  if (dest) {
    dest.visited = !dest.visited;
    saveDestinations();
    renderDestinations();
    showToast(dest.visited ? 'Marked as visited!' : 'Marked as not visited', 'success');
  }
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
}
