// Main JavaScript for Homepage

// Launch date set to February 28, 2026
const LAUNCH_DATE = new Date('2026-02-28T00:00:00');

document.addEventListener('DOMContentLoaded', () => {
  // Start the countdown timer
  startCountdown();

  // Initialize weekly focus
  initializeWeeklyFocus();

  // Update dashboard stats
  updateDashboardStats();

  // Set up launch date countdown (if configured)
  setupCountdown();
});

// Update dashboard statistics
function updateDashboardStats() {
  // Get checklist progress
  const checklistItems = Storage.get('checklistItems', []);
  const completedItems = checklistItems.filter(item => item.completed).length;
  const totalItems = checklistItems.length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const progressElement = document.getElementById('checklist-progress');
  if (progressElement) {
    progressElement.textContent = progressPercent + '%';
  }

  // Get budget saved
  const budgetData = Storage.get('budgetData', {});
  const income = calculateTotalIncome(budgetData);
  const expenses = calculateTotalExpenses(budgetData);
  const monthlySurplus = income - expenses;
  const savedAmount = Storage.get('totalSaved', 0);

  const budgetElement = document.getElementById('budget-saved');
  if (budgetElement) {
    budgetElement.textContent = formatCurrency(savedAmount);
  }

  // Get destinations count
  const destinations = Storage.get('destinations', []);
  const destinationsElement = document.getElementById('destinations-count');
  if (destinationsElement) {
    destinationsElement.textContent = destinations.length;
  }

  // Get countdown to launch
  const launchDate = Storage.get('launchDate');
  const countdownElement = document.getElementById('days-countdown');
  if (countdownElement && launchDate) {
    const days = DateUtils.daysUntil(launchDate);
    countdownElement.textContent = days > 0 ? days : '🎉';
  }
}

// Calculate total income
function calculateTotalIncome(budgetData) {
  if (!budgetData.income) return 0;
  return Object.values(budgetData.income).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

// Calculate total expenses
function calculateTotalExpenses(budgetData) {
  if (!budgetData.expenses) return 0;
  return Object.values(budgetData.expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
}

// Setup countdown timer
function setupCountdown() {
  const countdownElement = document.getElementById('days-countdown');
  if (!countdownElement) return;

  let launchDate = Storage.get('launchDate');

  // If no launch date is set, check if user wants to set one
  if (!launchDate) {
    countdownElement.textContent = 'Set Date';
    countdownElement.style.cursor = 'pointer';
    countdownElement.title = 'Click to set your launch date';

    countdownElement.addEventListener('click', () => {
      const date = prompt('Enter your planned RV launch date (YYYY-MM-DD):');
      if (date && !isNaN(Date.parse(date))) {
        Storage.set('launchDate', date);
        updateCountdown();
      }
    });
  }

  updateCountdown();
}

function updateCountdown() {
  const countdownElement = document.getElementById('days-countdown');
  if (!countdownElement) return;

  const launchDate = Storage.get('launchDate');
  if (!launchDate) {
    countdownElement.textContent = 'Set Date';
    return;
  }

  const days = DateUtils.daysUntil(launchDate);

  if (days < 0) {
    countdownElement.textContent = '🎉';
    countdownElement.parentElement.querySelector('.text-secondary').textContent = 'You\'re on the road!';
  } else if (days === 0) {
    countdownElement.textContent = 'Today!';
  } else {
    countdownElement.textContent = days;
  }
}

// Refresh stats when page becomes visible (if user switched tabs)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    updateDashboardStats();
  }
});

// Launch Countdown Timer
let countdownInterval = null;

function startCountdown() {
  updateCountdownDisplay();

  // Clear any existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  // Update every second
  countdownInterval = setInterval(updateCountdownDisplay, 1000);
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

function updateCountdownDisplay() {
  const now = new Date();
  const timeRemaining = LAUNCH_DATE - now;

  // Check if launch date has passed
  if (timeRemaining <= 0) {
    document.getElementById('countdown-days').textContent = '0';
    document.getElementById('countdown-hours').textContent = '00';
    document.getElementById('countdown-minutes').textContent = '00';
    document.getElementById('countdown-seconds').textContent = '00';
    document.getElementById('countdown-message').textContent = "🎉 You're on the road! Adventure awaits!";
    return;
  }

  // Calculate time units
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  // Update the display
  document.getElementById('countdown-days').textContent = days;
  document.getElementById('countdown-hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('countdown-minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('countdown-seconds').textContent = String(seconds).padStart(2, '0');

  // Update message based on how close we are
  const message = getCountdownMessage(days);
  document.getElementById('countdown-message').textContent = message;
}

function getCountdownMessage(days) {
  if (days === 0) {
    return "🎉 LAUNCH DAY! Time to hit the road!";
  } else if (days <= 7) {
    return "🔥 FINAL WEEK! Last-minute prep time!";
  } else if (days <= 14) {
    return "⚡ Two weeks to go! Getting real now!";
  } else if (days <= 30) {
    return "📋 One month out - time to finalize everything!";
  } else if (days <= 60) {
    return "🎯 Two months - your prep should be ramping up!";
  } else if (days <= 90) {
    return "📅 Three months - start checking off major items!";
  } else {
    return "Until we hit the road in our Winnebago Minnie Winnie 22R!";
  }
}

// Weekly Focus Timeline (17 weeks from Oct 27, 2025 to Feb 28, 2026)
const WEEKLY_TIMELINE = [
  {
    week: 1,
    dateRange: 'Oct 27 - Nov 2',
    focus: 'Research & Financial Planning',
    task: 'Get clear on your budget and financing options',
    details: 'Use the RV calculator to run scenarios. Research current Minnie Winnie 22R pricing on RVTrader.com, Camping World, and local dealers (prices vary significantly by location, year, and condition). Get pre-approved for RV loan if financing. Check credit scores.'
  },
  {
    week: 2,
    dateRange: 'Nov 3 - Nov 9',
    focus: 'Storage Unit Planning',
    task: 'Research and book a storage unit for your belongings',
    details: 'Get quotes from climate-controlled storage facilities in your area. Calculate what you\'re keeping vs selling. Costs vary widely by location and size. Compare prices and book for January move-in.'
  },
  {
    week: 3,
    dateRange: 'Nov 10 - Nov 16',
    focus: 'Insurance Research',
    task: 'Get RV insurance quotes and understand coverage',
    details: 'Contact multiple insurance providers (Progressive, Good Sam, National General, etc.) for quotes specific to full-time RV living. Ask about full-timer coverage, personal property protection, and roadside assistance options.'
  },
  {
    week: 4,
    dateRange: 'Nov 17 - Nov 23',
    focus: 'Decluttering Phase 1',
    task: 'Start sorting belongings - Keep, Sell, Donate, Storage',
    details: 'Begin with non-essentials. List valuable items on Facebook Marketplace/Craigslist. Minnie Winnie 22R has limited space - you\'ll need to downsize significantly. Focus on furniture first.'
  },
  {
    week: 5,
    dateRange: 'Nov 24 - Nov 30',
    focus: 'Work Setup Planning',
    task: 'Confirm Starlink order and test remote work setup',
    details: 'Research current Starlink for RVs pricing and plans on Starlink.com. Order what works for your needs. Test current remote work setup. Discuss with employers about full-time travel plans. Research backup internet options (mobile hotspots, etc.).'
  },
  {
    week: 6,
    dateRange: 'Dec 1 - Dec 7',
    focus: 'Mail Forwarding Setup',
    task: 'Choose and set up mail forwarding service',
    details: 'Research mail forwarding options: Escapees, Americas Mailbox, Traveling Mailbox, etc. Compare current pricing and services. You\'ll need this for registration, insurance, and banking. Set up by mid-December.'
  },
  {
    week: 7,
    dateRange: 'Dec 8 - Dec 14',
    focus: 'Health & Medical Prep',
    task: 'Schedule health checkups and stock prescriptions',
    details: 'Schedule full health checkups for both of you. Get dental cleanings. Request extended prescription supplies (check with insurance for limits). Research health insurance options for nomads/travelers. Update vaccination records and save copies.'
  },
  {
    week: 8,
    dateRange: 'Dec 15 - Dec 21',
    focus: 'RV Shopping Research',
    task: 'Scout Minnie Winnie 22R listings and inspect options',
    details: 'Check RVTrader, Camping World, local dealers. Inspect for: roof condition, water damage, tire age (replace if 6+ years), appliance function. Bring a mechanic for used RVs. Plan to buy in January.'
  },
  {
    week: 9,
    dateRange: 'Dec 22 - Dec 28',
    focus: 'Holiday Prep & Family Time',
    task: 'Enjoy holidays and inform family/friends of plans',
    details: 'Take a break from intense prep. Share your plans with loved ones. This might be your last major holiday in one place for a while. Rest up - January will be intense!'
  },
  {
    week: 10,
    dateRange: 'Dec 29 - Jan 4',
    focus: 'Final Decluttering & Selling',
    task: 'Finish selling/donating items and finalize storage',
    details: 'Final push to sell remaining items. Donate what won\'t sell. Confirm storage unit is ready. Create inventory list of what\'s going to storage. This is your last chance to liquidate!'
  },
  {
    week: 11,
    dateRange: 'Jan 5 - Jan 11',
    focus: 'RV PURCHASE WEEK',
    task: 'Buy your Winnebago Minnie Winnie 22R!',
    details: 'Negotiate price (aim for 10-15% off MSRP for new). Arrange insurance before pickup. Inspect thoroughly. Get PDI (Pre-Delivery Inspection) checklist. Schedule delivery/pickup. This is it!'
  },
  {
    week: 12,
    dateRange: 'Jan 12 - Jan 18',
    focus: 'RV Setup & Modifications',
    task: 'Install essential upgrades and test all systems',
    details: 'Research and purchase priority upgrades: surge protector, water pressure regulator, tire pressure monitoring system, replacement mattress if needed. Test ALL systems thoroughly: generator, AC, heater, water, propane, leveling jacks. Find issues now, not on the road!'
  },
  {
    week: 13,
    dateRange: 'Jan 19 - Jan 25',
    focus: 'Essential Gear Shopping',
    task: 'Buy must-have RV accessories and supplies',
    details: 'Purchase essentials: sewer hose kit, leveling blocks, wheel chocks, drinking-water-safe hoses, power adapters (30A/50A), basic tool kit, first aid kit. Research what you need online (check RV forums, YouTube). Plan budget accordingly. Schedule Starlink installation.'
  },
  {
    week: 14,
    dateRange: 'Jan 26 - Feb 1',
    focus: 'Move Out & Storage Move-In',
    task: 'Move belongings to storage and transition to RV',
    details: 'Rent U-Haul for storage move. Clean out current place. Cancel utilities. Forward mail. Start living in the RV even if stationary - test everything before launch.'
  },
  {
    week: 15,
    dateRange: 'Feb 2 - Feb 8',
    focus: 'Route Planning & Campground Bookings',
    task: 'Plan your first 3 months and book campsites',
    details: 'February = GO SOUTH! Plan route through Texas, Arizona, Southern California. Book campgrounds (they fill up fast in winter). Download apps: Campendium, The Dyrt, Harvest Hosts, iOverlander.'
  },
  {
    week: 16,
    dateRange: 'Feb 9 - Feb 15',
    focus: 'Practice Trips & Skills',
    task: 'Take weekend shakedown trips to learn your RV',
    details: 'Practice: backing up, dumping tanks, unhooking/hooking utilities, leveling. Find issues now, not on the road! Stay within 50 miles. Test Starlink in the field.'
  },
  {
    week: 17,
    dateRange: 'Feb 16 - Feb 28',
    focus: 'FINAL COUNTDOWN',
    task: 'Last-minute checks and preparations',
    details: 'Stock pantry with 2 weeks of food. Fill propane. Check tire pressure. Test generator. Update insurance. Download offline maps. Say final goodbyes. Feb 28 = LAUNCH! 🚀'
  }
];

function initializeWeeklyFocus() {
  const currentWeekData = getCurrentWeekData();

  // Update week number
  document.getElementById('week-number').textContent = currentWeekData.week;

  // Update task
  document.getElementById('weekly-focus-task').textContent = currentWeekData.task;

  // Update details
  document.getElementById('weekly-focus-details').innerHTML = `
    <strong>${currentWeekData.focus}</strong> (${currentWeekData.dateRange})<br><br>
    ${currentWeekData.details}
  `;

  // Mark as complete button
  const completeBtn = document.getElementById('mark-focus-complete');
  const weekKey = `week-${currentWeekData.week}-complete`;
  const isComplete = Storage.get(weekKey, false);

  if (isComplete) {
    completeBtn.textContent = '✓ Completed';
    completeBtn.classList.add('btn-success');
    completeBtn.disabled = true;
  }

  completeBtn.addEventListener('click', () => {
    Storage.set(weekKey, true);
    completeBtn.textContent = '✓ Completed';
    completeBtn.classList.add('btn-success');
    completeBtn.disabled = true;
    showToast('Great job! Keep up the momentum!', 'success');
  });

  // View all tasks button
  document.getElementById('view-all-tasks').addEventListener('click', (e) => {
    e.preventDefault();
    showFullTimeline();
  });
}

function getCurrentWeekData() {
  const today = new Date();
  const startDate = new Date('2025-10-27'); // Oct 27, 2025
  const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;

  // Clamp to valid range
  const weekNumber = Math.max(1, Math.min(17, currentWeek));

  return WEEKLY_TIMELINE[weekNumber - 1];
}

function showFullTimeline() {
  // This will be implemented when we create the timeline page
  alert('Full timeline view coming soon! For now, check back each week for your next priority.');
}
