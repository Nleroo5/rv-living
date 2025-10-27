// Checklist Management

let checklistItems = [];
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'date-desc';

document.addEventListener('DOMContentLoaded', () => {
  // Load checklist from storage
  loadChecklist();

  // Setup quick-load buttons
  setupQuickLoadButtons();

  // Add item form
  const addForm = document.getElementById('add-checklist-form');
  addForm.addEventListener('submit', handleAddItem);

  // Search input
  const searchInput = document.getElementById('checklist-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      currentSearch = searchInput.value.trim().toLowerCase();
      renderChecklist();
    }, 300));
  }

  // Sort select
  const sortSelect = document.getElementById('checklist-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderChecklist();
    });
  }

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

  // Export/Import buttons
  const exportBtn = document.getElementById('export-checklist-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      DataManager.exportPageData('checklist', 'checklistItems');
    });
  }

  const importBtn = document.getElementById('import-checklist-btn');
  const importInput = document.getElementById('import-checklist-input');
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

  // File upload
  setupFileUpload();

  // Update storage display
  updateStorageDisplay();
});

// Essential RV Items - Research prompts
const ESSENTIAL_RV_ITEMS = [
  { title: 'Research surge protector options', description: 'Look for 30A or 50A surge protectors (check your RV\'s amp rating). Popular brands: Progressive Industries, Surge Guard. Protects from power surges at campgrounds.', category: 'research', priority: 'high' },
  { title: 'Research water pressure regulator', description: 'Prevents high water pressure from damaging RV plumbing. Look for adjustable models (40-50 PSI recommended). Check RV forums for recommendations.', category: 'research', priority: 'high' },
  { title: 'Research sewer hose kit', description: 'Need: hose, fittings, gloves, storage bag. Look for heavy-duty options. Check reviews on Amazon/RV forums.', category: 'research', priority: 'high' },
  { title: 'Research drinking water hoses', description: 'Must be labeled "drinking water safe" - NOT regular garden hoses. Need 25ft + 10ft lengths. Research brands on RV forums.', category: 'research', priority: 'high' },
  { title: 'Research leveling blocks/chocks', description: 'Lynx or Camco leveling blocks commonly recommended. Also need wheel chocks. Check what size works for your RV.', category: 'research', priority: 'high' },
  { title: 'Research RV-specific GPS or app', description: 'Options: RV Life app, Good Sam GPS, Google Maps (be careful with height/weight). Research which works best for Class C.', category: 'research', priority: 'medium' },
  { title: 'Get RV insurance quotes', description: 'Contact Progressive, Good Sam, National General. Ask about full-timer coverage if living in RV full-time.', category: 'research', priority: 'high' },
  { title: 'Research campground memberships', description: 'Options: Passport America, KOA, Harvest Hosts, Thousand Trails. Compare costs vs. benefits for your travel style.', category: 'research', priority: 'medium' },
  { title: 'Order Starlink for RVs', description: 'Visit Starlink.com for current pricing and plans. Essential for remote work. Research installation tips on RV forums.', category: 'purchase', priority: 'high' },
  { title: 'Research tire pressure monitoring system', description: 'TPMS helps prevent blowouts. Popular: TST, TireMinder, EEZTire. Check reviews and compatibility with your RV.', category: 'research', priority: 'high' },
  { title: 'First aid kit + fire extinguisher', description: 'Verify RV has working fire extinguisher. Stock comprehensive first aid kit. Check expiration dates.', category: 'purchase', priority: 'high' },
  { title: 'Basic tool kit for RV', description: 'Screwdrivers, pliers, wrench set, duct tape, zip ties, electrical tape, multimeter. Research RV-specific tools needed.', category: 'purchase', priority: 'medium' },
  { title: 'Research RV-specific mattress', description: 'RV mattresses are often odd sizes. Measure your bed, then research options. Many full-timers upgrade immediately.', category: 'research', priority: 'medium' }
];

const MINNIE_WINNIE_SPECIFIC_ITEMS = [
  { title: 'Check Minnie Winnie 22R known issues', description: 'Research common problems on RV forums: iRV2, Reddit r/GoRVing. Check for: water heater issues, leveling jack problems, roof condition.', category: 'research', priority: 'high' },
  { title: 'Research generator maintenance schedule', description: 'Minnie Winnie has Onan generator. Find service manual, check oil change schedule, load test recommendations. Search YouTube for tutorials.', category: 'research', priority: 'high' },
  { title: 'Check Ford E-450 chassis specifications', description: 'Verify your chassis year, engine type (V10 Triton common). Research maintenance schedules, common issues, MPG expectations.', category: 'research', priority: 'medium' },
  { title: 'Research awning maintenance', description: 'Electric awning common on Minnie Winnie. Learn how to manually retract if motor fails. Check fabric condition, clean regularly.', category: 'maintenance', priority: 'medium' },
  { title: 'Check fresh water tank capacity', description: 'Minnie Winnie 22R typically has ~44 gal fresh, ~40 gal gray, ~30 gal black. Verify your specific model. Plan water management accordingly.', category: 'research', priority: 'low' },
  { title: 'Research backup camera functionality', description: 'Check if backup camera works properly. If not, research replacement options. Critical safety feature for Class C.', category: 'maintenance', priority: 'high' },
  { title: 'Verify slide-out operation', description: 'Test slide-out multiple times. Research lubrication schedule. Check seals for leaks. Find manual override procedure.', category: 'maintenance', priority: 'high' },
  { title: 'Research Ford E-450 tire specifications', description: 'Check tire size, PSI requirements, age of current tires. Tires over 6 years old should be replaced regardless of tread depth.', category: 'research', priority: 'high' }
];

// Legal & Documents Items
const LEGAL_DOCUMENTS_ITEMS = [
  { title: 'Get RV registered in your name', description: 'Complete registration after purchase. Research domicile state options (SD, TX, FL popular for full-timers). Budget for registration fees.', category: 'documents', priority: 'high' },
  { title: 'Set up mail forwarding service', description: 'Research: Escapees, Americas Mailbox, or Traveling Mailbox. Compare pricing and services. You need this for official mail, banking, insurance.', category: 'documents', priority: 'high' },
  { title: 'Update driver\'s licenses to new address', description: 'If changing domicile state, get new licenses. Some states require in-person visit. Research requirements for your chosen state.', category: 'documents', priority: 'high' },
  { title: 'Update vehicle registration/insurance address', description: 'Notify insurance and DMV of address change. Use mail forwarding service address as official residence.', category: 'documents', priority: 'high' },
  { title: 'Set up digital document storage', description: 'Scan all important documents: insurance, RV title, licenses, passports, medical records. Store in Google Drive/Dropbox with backup.', category: 'documents', priority: 'high' },
  { title: 'Update voter registration', description: 'Register to vote in your new domicile state. Research absentee/mail-in voting options for nomads.', category: 'documents', priority: 'medium' },
  { title: 'Notify banks of travel plans', description: 'Tell banks you\'ll be traveling nationwide. Set up online/mobile banking. Consider a travel-friendly bank (Charles Schwab, Ally).', category: 'documents', priority: 'high' },
  { title: 'Update emergency contacts', description: 'Give family/friends your mail forwarding info. Set up ICE (In Case of Emergency) contacts in both phones.', category: 'organize', priority: 'medium' },
  { title: 'Research full-timer RV insurance', description: 'Regular RV insurance might not cover full-time living. Get quotes for full-timer policies. Ask about personal property coverage.', category: 'research', priority: 'high' },
  { title: 'Cancel or transfer utilities', description: 'Close accounts for electricity, gas, water, trash. Keep phone/internet until you move. Transfer what you can (phone numbers).', category: 'organize', priority: 'high' },
  { title: 'Forward or close any PO Boxes', description: 'Close local PO boxes. Forward any mail to new mail forwarding service.', category: 'organize', priority: 'medium' },
  { title: 'Update Amazon/online shopping addresses', description: 'Consider Amazon Locker or ship to campgrounds. Update default shipping address to mail forwarding service.', category: 'organize', priority: 'low' }
];

// Remote Work Setup Items
const REMOTE_WORK_ITEMS = [
  { title: 'Order Starlink for RVs', description: 'Visit Starlink.com for current pricing. Order equipment. Research installation for Minnie Winnie roof. Budget $500+ setup, $150/month.', category: 'purchase', priority: 'high' },
  { title: 'Get backup mobile hotspot plan', description: 'Research unlimited data plans: Verizon, T-Mobile, AT&T. Have backup for when Starlink isn\'t available. Budget $50-80/month.', category: 'research', priority: 'high' },
  { title: 'Test remote work setup before departure', description: 'Work from RV (even if parked) for a week. Test Starlink, backup hotspot, power needs, desk setup. Find issues now!', category: 'organize', priority: 'high' },
  { title: 'Set up mobile office in RV', description: 'Create dedicated workspace. Test ergonomics. Ensure comfortable chair, good lighting, proper monitor height. Consider standing desk converter.', category: 'organize', priority: 'high' },
  { title: 'Discuss remote work plans with employer', description: 'Confirm you can work from anywhere. Discuss any state tax implications. Get written approval if needed. Clarify expectations.', category: 'organize', priority: 'high' },
  { title: 'Research coworking spaces on route', description: 'Find backup workspaces for video calls or when you need reliable internet. Budget $20-40/day for coworking.', category: 'research', priority: 'medium' },
  { title: 'Set up cloud backup for work files', description: 'Use Backblaze, Carbonite, or cloud storage. Ensure automatic backup. You can\'t afford to lose work files on the road.', category: 'organize', priority: 'high' },
  { title: 'Get power bank/battery backup', description: 'For laptop and phone during power outages or boondocking. Research portable power stations (Jackery, Goal Zero).', category: 'research', priority: 'medium' },
  { title: 'Download offline work tools', description: 'Ensure you have offline access to critical files and apps. Download offline maps, docs, etc.', category: 'organize', priority: 'medium' },
  { title: 'Set up VPN for secure connections', description: 'For public wifi at campgrounds. Research: NordVPN, ExpressVPN. Essential for security on shared networks.', category: 'research', priority: 'medium' }
];

// Move Out & Declutter Items
const MOVE_OUT_ITEMS = [
  { title: 'Research storage unit options', description: 'Get quotes for climate-controlled units. Compare sizes (5x10, 10x10, 10x15). Budget $50-200/month. Book for January move-in.', category: 'research', priority: 'high' },
  { title: 'Inventory items going to storage', description: 'Create detailed list with photos. Consider what you actually need to keep. Could you sell instead?', category: 'organize', priority: 'high' },
  { title: 'Sell furniture on Facebook Marketplace/Craigslist', description: 'Start early (Nov-Dec). Price to sell. Heavy furniture is hard to sell - be realistic. Consider donating if no bites.', category: 'sell', priority: 'high' },
  { title: 'Donate items to Goodwill/charity', description: 'Get tax receipt for donations. Clothes, kitchenware, decor you won\'t need. Schedule pickup for large items.', category: 'sell', priority: 'medium' },
  { title: 'Digitize important documents', description: 'Scan photos, papers, receipts. Save to cloud. Consider scanning service for large photo collections. Shred originals after scanning.', category: 'organize', priority: 'high' },
  { title: 'Cancel subscriptions you won\'t need', description: 'Gym membership (unless national chain), local services, newspaper, etc. Keep streaming services you\'ll use on road.', category: 'organize', priority: 'medium' },
  { title: 'Return/sell items to stores', description: 'Unused items with receipts. Store credit is fine. Clear out closets. Be ruthless about what you actually need.', category: 'sell', priority: 'low' },
  { title: 'Plan and execute garage sale', description: 'If you have lots of small items. Price to move quickly. Consider "everything must go" final day pricing.', category: 'sell', priority: 'medium' },
  { title: 'Give away items to friends/family', description: 'Offer specific items to people who\'d appreciate them. Better than storage/selling. Schedule pickups.', category: 'organize', priority: 'low' },
  { title: 'Measure RV storage spaces', description: 'Know exact dimensions of cabinets, closets, under-bed storage. Only keep what fits. Minnie Winnie has limited space!', category: 'organize', priority: 'high' },
  { title: 'Rent moving truck for storage move', description: 'Book U-Haul/Penske for late January. Budget $100-200 depending on distance to storage. Get help from friends.', category: 'organize', priority: 'high' },
  { title: 'Clean out current residence', description: 'Deep clean for security deposit return. Schedule final walkthrough with landlord. Take photos of clean apartment.', category: 'organize', priority: 'high' },
  { title: 'Cancel lease or sell home', description: 'Give proper notice to landlord (usually 60 days). Coordinate end date with Feb 28 departure. Or list home for sale if you own.', category: 'organize', priority: 'high' },
  { title: 'Set aside RV essentials separately', description: 'Pack a "load first" box of immediate needs: bedding, clothes, kitchen basics, toiletries. Don\'t bury these in storage!', category: 'organize', priority: 'high' },
  { title: 'Take final meter readings', description: 'Photo utility meters on move-out day. Send to utility companies to ensure accurate final bills.', category: 'organize', priority: 'low' }
];

// Health & Medical Items
const HEALTH_MEDICAL_ITEMS = [
  { title: 'Schedule full health checkups', description: 'Both of you get complete physicals before Dec. Address any issues before living on road. Get doctor clearance for travel.', category: 'organize', priority: 'high' },
  { title: 'Get dental checkups and cleanings', description: 'Schedule for December. Handle any needed work before departure. Harder to find dentists on road.', category: 'organize', priority: 'high' },
  { title: 'Stock up on prescriptions', description: 'Request 90-day supplies. Check insurance limits. Transfer prescriptions to national pharmacy (CVS, Walgreens). Set up mail order.', category: 'purchase', priority: 'high' },
  { title: 'Research nomad health insurance', description: 'If losing employer coverage. Options: ACA marketplace, travel insurance, Cigna Global, SafetyWing. Compare costs and coverage.', category: 'research', priority: 'high' },
  { title: 'Get vision exam and extra contacts/glasses', description: 'Update prescriptions. Order 6-12 month supply of contacts. Get backup glasses.', category: 'purchase', priority: 'medium' },
  { title: 'Update vaccinations', description: 'Check if you need: flu shot, Tdap, etc. Keep vaccination records digital. Some campgrounds/countries may require proof.', category: 'organize', priority: 'medium' },
  { title: 'Create digital health records folder', description: 'Scan insurance cards, prescription lists, doctor contact info, medical history. Keep in cloud for emergencies.', category: 'organize', priority: 'high' },
  { title: 'Research telemedicine options', description: 'Sign up for virtual doctor visits. Most insurance covers this now. Essential for minor issues on road.', category: 'research', priority: 'medium' }
];

// Route & Camping Planning Items
const ROUTE_PLANNING_ITEMS = [
  { title: 'Plan first 3 months of route', description: 'Feb-May 2026: Head south! Research Arizona, New Mexico, Southern CA, Texas. Avoid cold weather. Map out general path.', category: 'research', priority: 'high' },
  { title: 'Download campground apps', description: 'Get: Campendium, The Dyrt, iOverlander, RV Parky. Create accounts. Research which ones you\'ll use most.', category: 'organize', priority: 'high' },
  { title: 'Research campground memberships', description: 'Passport America, KOA, Harvest Hosts, Thousand Trails, Boondockers Welcome. Calculate if worth cost for your travel style.', category: 'research', priority: 'high' },
  { title: 'Book first week of campgrounds', description: 'Reserve Feb 28-Mar 7. Don\'t wing it your first week! Book work-friendly sites with good reviews and full hookups.', category: 'organize', priority: 'high' },
  { title: 'Research BLM land and free camping', description: 'Learn rules, find locations, understand limitations (14-day limits). Download maps for offline use. Great for budget.', category: 'research', priority: 'medium' },
  { title: 'Download offline maps', description: 'Google Maps offline, Gaia GPS, or AllTrails. Save regions you\'ll visit. Essential for areas without cell service.', category: 'organize', priority: 'medium' },
  { title: 'Join RV Facebook groups', description: 'r/GoRVing, Winnebago Owners groups, Full-Time RVers, RV Living. Ask questions, get recommendations, make friends.', category: 'research', priority: 'low' },
  { title: 'Research national park passes', description: 'America the Beautiful Pass ($80/year) pays for itself fast. Covers entrance to all national parks. Buy in January.', category: 'research', priority: 'medium' },
  { title: 'Create packing list for launch day', description: 'Everything you need on Day 1. Don\'t forget: power cords, hoses, leveling blocks, critical tools, first aid kit.', category: 'organize', priority: 'high' }
];

// Final Week Items (Week of Feb 21-28, 2026)
const FINAL_WEEK_ITEMS = [
  { title: 'Stock RV pantry with 2 weeks of food', description: 'Non-perishables, canned goods, basics. You don\'t want to grocery shop your first few days on road.', category: 'purchase', priority: 'high' },
  { title: 'Fill fresh water tank', description: 'Fill to capacity. Test water pump. Ensure everything works before you leave.', category: 'maintenance', priority: 'high' },
  { title: 'Fill propane tanks', description: 'Top off both tanks. You\'ll need propane for heat, hot water, cooking. Find local propane station.', category: 'purchase', priority: 'high' },
  { title: 'Check tire pressure on all tires', description: 'Including spare! Inflate to recommended PSI (check door jamb sticker). Low tires = blowout risk.', category: 'maintenance', priority: 'high' },
  { title: 'Test all RV systems one final time', description: 'Generator, AC, heater, water heater, fridge, stove, outlets, lights, slide-out, awning. Fix anything broken NOW.', category: 'maintenance', priority: 'high' },
  { title: 'Update insurance that you\'re departing', description: 'Notify RV insurance of departure date. Confirm full coverage is active. Get roadside assistance numbers saved.', category: 'documents', priority: 'high' },
  { title: 'Charge all devices and batteries', description: 'Phones, laptops, cameras, portable batteries, headlamps. Start trip with everything at 100%.', category: 'organize', priority: 'medium' },
  { title: 'Print/download important documents offline', description: 'Insurance cards, registration, campground confirmations, maps, emergency contacts. Have paper backups.', category: 'documents', priority: 'high' },
  { title: 'Do final goodbye to friends/family', description: 'Last dinners, gatherings, farewells. Exchange contact info. Plan future meetups on your route.', category: 'other', priority: 'medium' },
  { title: 'Take final photos of RV pre-departure', description: 'Document condition before first trip. Insurance purposes. Also fun to look back on later!', category: 'other', priority: 'low' }
];

function setupQuickLoadButtons() {
  document.getElementById('load-essentials-btn')?.addEventListener('click', () => {
    loadEssentialItems();
  });

  document.getElementById('load-minnie-winnie-btn')?.addEventListener('click', () => {
    loadMinnieWinnieItems();
  });

  document.getElementById('load-legal-btn')?.addEventListener('click', () => {
    loadCategoryItems(LEGAL_DOCUMENTS_ITEMS, 'Legal & Documents');
  });

  document.getElementById('load-remote-work-btn')?.addEventListener('click', () => {
    loadCategoryItems(REMOTE_WORK_ITEMS, 'Remote Work Setup');
  });

  document.getElementById('load-move-out-btn')?.addEventListener('click', () => {
    loadCategoryItems(MOVE_OUT_ITEMS, 'Move Out & Declutter');
  });

  document.getElementById('load-health-btn')?.addEventListener('click', () => {
    loadCategoryItems(HEALTH_MEDICAL_ITEMS, 'Health & Medical');
  });

  document.getElementById('load-route-btn')?.addEventListener('click', () => {
    loadCategoryItems(ROUTE_PLANNING_ITEMS, 'Route & Camping');
  });

  document.getElementById('load-final-week-btn')?.addEventListener('click', () => {
    loadCategoryItems(FINAL_WEEK_ITEMS, 'Final Week Prep');
  });

  document.getElementById('load-all-categories-btn')?.addEventListener('click', () => {
    loadAllCategories();
  });
}

function loadEssentialItems() {
  const existingTitles = checklistItems.map(item => item.title.toLowerCase());
  let addedCount = 0;

  ESSENTIAL_RV_ITEMS.forEach(item => {
    // Don't add duplicates
    if (!existingTitles.includes(item.title.toLowerCase())) {
      checklistItems.unshift({
        id: generateId(),
        ...item,
        completed: false,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    saveChecklist();
    renderChecklist();
    showToast(`Added ${addedCount} essential items! Remember to verify each one for your situation.`, 'success');
  } else {
    showToast('All essential items already in your checklist!', 'info');
  }
}

function loadMinnieWinnieItems() {
  const existingTitles = checklistItems.map(item => item.title.toLowerCase());
  let addedCount = 0;

  MINNIE_WINNIE_SPECIFIC_ITEMS.forEach(item => {
    // Don't add duplicates
    if (!existingTitles.includes(item.title.toLowerCase())) {
      checklistItems.unshift({
        id: generateId(),
        ...item,
        completed: false,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    saveChecklist();
    renderChecklist();
    showToast(`Added ${addedCount} Minnie Winnie 22R specific items! Research each one.`, 'success');
  } else {
    showToast('All Minnie Winnie items already in your checklist!', 'info');
  }
}

// Generic category loader
function loadCategoryItems(items, categoryName) {
  const existingTitles = checklistItems.map(item => item.title.toLowerCase());
  let addedCount = 0;

  items.forEach(item => {
    if (!existingTitles.includes(item.title.toLowerCase())) {
      checklistItems.unshift({
        id: generateId(),
        ...item,
        completed: false,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    saveChecklist();
    renderChecklist();
    showToast(`Added ${addedCount} items from ${categoryName}!`, 'success');
  } else {
    showToast(`All ${categoryName} items already in your checklist!`, 'info');
  }
}

// Load all categories at once
function loadAllCategories() {
  const allCategories = [
    ...ESSENTIAL_RV_ITEMS,
    ...MINNIE_WINNIE_SPECIFIC_ITEMS,
    ...LEGAL_DOCUMENTS_ITEMS,
    ...REMOTE_WORK_ITEMS,
    ...MOVE_OUT_ITEMS,
    ...HEALTH_MEDICAL_ITEMS,
    ...ROUTE_PLANNING_ITEMS,
    ...FINAL_WEEK_ITEMS
  ];

  const existingTitles = checklistItems.map(item => item.title.toLowerCase());
  let addedCount = 0;

  allCategories.forEach(item => {
    if (!existingTitles.includes(item.title.toLowerCase())) {
      checklistItems.unshift({
        id: generateId(),
        ...item,
        completed: false,
        createdAt: new Date().toISOString()
      });
      addedCount++;
    }
  });

  if (addedCount > 0) {
    saveChecklist();
    renderChecklist();
    showToast(`🚀 Added ${addedCount} items! You're ready to prepare for Feb 28, 2026!`, 'success');
  } else {
    showToast('All items already in your checklist! You\'re all set!', 'info');
  }
}

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
  showSaveIndicator();
}

// Render checklist
function renderChecklist() {
  const container = document.getElementById('checklist-container');
  const emptyMessage = document.getElementById('empty-message');

  // Filter items
  let filteredItems = checklistItems;

  // Apply category filter
  if (currentFilter === 'completed') {
    filteredItems = filteredItems.filter(item => item.completed);
  } else if (currentFilter !== 'all') {
    filteredItems = filteredItems.filter(item => item.category === currentFilter);
  }

  // Apply search
  if (currentSearch) {
    filteredItems = filteredItems.filter(item =>
      item.title.toLowerCase().includes(currentSearch) ||
      (item.description && item.description.toLowerCase().includes(currentSearch))
    );
  }

  // Apply sort
  filteredItems = sortChecklist(filteredItems, currentSort);

  // Clear container (except empty message)
  const items = container.querySelectorAll('.checklist-item');
  items.forEach(item => item.remove());

  if (filteredItems.length === 0) {
    emptyMessage.classList.remove('hidden');
    if (currentSearch) {
      emptyMessage.textContent = `No items match "${currentSearch}"`;
    } else {
      emptyMessage.textContent = currentFilter === 'all'
        ? 'No items yet. Add your first checklist item above!'
        : 'No items in this category yet.';
    }
  } else {
    emptyMessage.classList.add('hidden');

    filteredItems.forEach(item => {
      const li = createChecklistItemElement(item);
      container.appendChild(li);
    });
  }
}

// Sort checklist items
function sortChecklist(items, sortBy) {
  const sorted = [...items];

  switch (sortBy) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'title-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'priority-high':
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    case 'completed':
      return sorted.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
    case 'incomplete':
      return sorted.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));
    default:
      return sorted;
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
    <div style="display: flex; gap: var(--space-1); margin-left: auto;">
      <button class="btn btn-small btn-outline edit-item-btn" aria-label="Edit item">✏️</button>
      <button class="file-item-remove" aria-label="Delete item">✕</button>
    </div>
  `;

  // Checkbox toggle
  const checkbox = li.querySelector('.checklist-checkbox');
  checkbox.addEventListener('change', () => {
    toggleItemComplete(item.id);
  });

  // Edit button
  const editBtn = li.querySelector('.edit-item-btn');
  editBtn.addEventListener('click', () => {
    editItem(item.id);
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

// Edit item using modal form
async function editItem(itemId) {
  const item = checklistItems.find(i => i.id === itemId);
  if (!item) return;

  const categoryLabels = {
    purchase: 'To Purchase',
    organize: 'To Organize',
    sell: 'To Sell/Donate',
    research: 'Research Needed',
    documents: 'Documents',
    maintenance: 'Maintenance',
    other: 'Other'
  };

  // Create modal content with form
  const content = `
    <div class="form-group">
      <label for="edit-title" class="form-label">Title</label>
      <input type="text" id="edit-title" class="form-input" value="${sanitizeHTML(item.title)}">
    </div>
    <div class="form-group">
      <label for="edit-description" class="form-label">Description</label>
      <textarea id="edit-description" class="form-textarea">${sanitizeHTML(item.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label for="edit-category" class="form-label">Category</label>
      <select id="edit-category" class="form-select">
        ${Object.entries(categoryLabels).map(([value, label]) => `
          <option value="${value}" ${item.category === value ? 'selected' : ''}>${label}</option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label for="edit-priority" class="form-label">Priority</label>
      <select id="edit-priority" class="form-select">
        <option value="high" ${item.priority === 'high' ? 'selected' : ''}>High Priority</option>
        <option value="medium" ${item.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
        <option value="low" ${item.priority === 'low' ? 'selected' : ''}>Low Priority</option>
      </select>
    </div>
  `;

  const modal = createModal('Edit Checklist Item', content, [
    { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
    { text: 'Save Changes', class: 'btn-primary', action: 'save' }
  ]);

  const buttons = modal.querySelectorAll('[data-action]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (action === 'save') {
        const title = modal.querySelector('#edit-title').value.trim();
        const description = modal.querySelector('#edit-description').value.trim();
        const category = modal.querySelector('#edit-category').value;
        const priority = modal.querySelector('#edit-priority').value;

        if (!title) {
          showToast('Title cannot be empty', 'error');
          return;
        }

        // Update the item in place
        item.title = title;
        item.description = description;
        item.category = category;
        item.priority = priority;

        saveChecklist();
        renderChecklist();
        showToast('Item updated!', 'success');
        showSaveIndicator();
        modal.remove();
      } else {
        modal.remove();
      }
    });
  });
}

// Toggle item complete status
function toggleItemComplete(itemId) {
  const item = checklistItems.find(i => i.id === itemId);
  if (item) {
    item.completed = !item.completed;
    saveChecklist();
    renderChecklist();
    showSaveIndicator();
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

  // Check storage before upload
  const storageInfo = DataManager.getStorageInfo();
  if (parseFloat(storageInfo.percentUsed) > 80) {
    showToast(`⚠️ Storage is ${storageInfo.percentUsed}% full (${storageInfo.usedMB}MB / ${storageInfo.maxMB}MB). Consider deleting old files.`, 'warning');
  }

  Array.from(files).forEach(file => {
    if (file.size > maxSize) {
      showToast(`File "${file.name}" is too large (max 5MB)`, 'error');
      return;
    }

    // Warn about storage impact
    const estimatedSize = file.size * 1.37; // base64 encoding adds ~37% overhead
    if (estimatedSize > storageInfo.remaining) {
      showToast(`⚠️ File may not fit in remaining storage. Free up space by deleting old files or exporting data.`, 'error');
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
      const saved = Storage.set('uploadedFiles', uploadedFiles);

      if (saved) {
        renderFileList(uploadedFiles);
        showToast(`File "${file.name}" uploaded successfully`, 'success');

        // Update storage info display
        updateStorageDisplay();
      }
    };

    reader.readAsDataURL(file);
  });
}

// Update storage display
function updateStorageDisplay() {
  const storageInfo = DataManager.getStorageInfo();
  const storageDisplay = document.getElementById('storage-info');

  if (storageDisplay) {
    const percentUsed = parseFloat(storageInfo.percentUsed);
    let statusClass = 'success';
    if (percentUsed > 80) {
      statusClass = 'error';
    } else if (percentUsed > 60) {
      statusClass = 'warning';
    }

    storageDisplay.innerHTML = `
      <div style="font-size: var(--text-sm); color: var(--color-text-secondary); margin-bottom: var(--space-1);">
        Storage: ${storageInfo.usedMB}MB / ${storageInfo.maxMB}MB (${storageInfo.percentUsed}%)
      </div>
      <div class="progress" style="height: 8px;">
        <div class="progress-bar" style="width: ${storageInfo.percentUsed}%; background-color: var(--color-${statusClass});"></div>
      </div>
    `;
  }
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
