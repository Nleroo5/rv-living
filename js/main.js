// Main JavaScript for Homepage

document.addEventListener('DOMContentLoaded', () => {
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
