// Simple Budget Tracker

let budgetData = {
  income: {},
  expenses: {}
};

document.addEventListener('DOMContentLoaded', () => {
  // Load saved data
  loadBudgetData();

  // Setup collapsible sections (start collapsed)
  setupCollapsibleSections();

  // Income inputs
  document.getElementById('income-primary').addEventListener('input', debounce(updateBudget, 300));
  document.getElementById('income-other').addEventListener('input', debounce(updateBudget, 300));

  // Expense inputs
  const expenseInputs = document.querySelectorAll('.expense-input');
  expenseInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
      updateCategoryTotals();
      updateBudget();
    }, 300));
  });

  // Initial update
  updateCategoryTotals();
  updateBudget();
});

// Setup collapsible sections
function setupCollapsibleSections() {
  const sections = document.querySelectorAll('.collapsible-section');

  sections.forEach(section => {
    const header = section.querySelector('.collapsible-header');

    header.addEventListener('click', () => {
      section.classList.toggle('open');
    });
  });
}

// Update category totals in headers
function updateCategoryTotals() {
  const categories = ['rv-costs', 'travel', 'living', 'other'];

  categories.forEach(category => {
    const inputs = document.querySelectorAll(`[data-category="${category}"]`);
    let total = 0;

    inputs.forEach(input => {
      total += parseFloat(input.value) || 0;
    });

    const totalElement = document.getElementById(`${category}-total`);
    if (totalElement) {
      totalElement.textContent = `(${formatCurrency(total)})`;
    }
  });
}

// Load budget data from storage
function loadBudgetData() {
  const saved = Storage.get('budgetData');
  if (saved) {
    budgetData = saved;
    populateFormValues();
  }
}

// Populate form values from saved data
function populateFormValues() {
  // Income
  if (budgetData.income) {
    Object.keys(budgetData.income).forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = budgetData.income[key] || 0;
      }
    });
  }

  // Expenses
  if (budgetData.expenses) {
    Object.keys(budgetData.expenses).forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = budgetData.expenses[key] || 0;
      }
    });
  }
}

// Update budget calculations
function updateBudget() {
  // Get income
  budgetData.income = {
    'income-primary': parseFloat(document.getElementById('income-primary').value) || 0,
    'income-other': parseFloat(document.getElementById('income-other').value) || 0
  };

  // Get expenses
  budgetData.expenses = {
    // RV Costs
    'exp-rv-payment': parseFloat(document.getElementById('exp-rv-payment').value) || 0,
    'exp-rv-insurance': parseFloat(document.getElementById('exp-rv-insurance').value) || 0,
    'exp-maintenance': parseFloat(document.getElementById('exp-maintenance').value) || 0,
    'exp-registration': parseFloat(document.getElementById('exp-registration').value) || 0,

    // Travel
    'exp-campground': parseFloat(document.getElementById('exp-campground').value) || 0,
    'exp-fuel': parseFloat(document.getElementById('exp-fuel').value) || 0,
    'exp-tolls': parseFloat(document.getElementById('exp-tolls').value) || 0,

    // Daily Living
    'exp-groceries': parseFloat(document.getElementById('exp-groceries').value) || 0,
    'exp-internet': parseFloat(document.getElementById('exp-internet').value) || 0,
    'exp-health': parseFloat(document.getElementById('exp-health').value) || 0,
    'exp-medical': parseFloat(document.getElementById('exp-medical').value) || 0,
    'exp-entertainment': parseFloat(document.getElementById('exp-entertainment').value) || 0,
    'exp-personal': parseFloat(document.getElementById('exp-personal').value) || 0,

    // Other
    'exp-emergency': parseFloat(document.getElementById('exp-emergency').value) || 0,
    'exp-other': parseFloat(document.getElementById('exp-other').value) || 0
  };

  // Calculate totals
  const totalIncome = Object.values(budgetData.income).reduce((sum, val) => sum + val, 0);
  const totalExpenses = Object.values(budgetData.expenses).reduce((sum, val) => sum + val, 0);
  const surplus = totalIncome - totalExpenses;

  // Update overview cards
  document.getElementById('monthly-income').textContent = formatCurrency(totalIncome);
  document.getElementById('monthly-expenses').textContent = formatCurrency(totalExpenses);
  document.getElementById('monthly-surplus').textContent = formatCurrency(surplus);

  // Change surplus color
  const surplusElement = document.getElementById('monthly-surplus');
  if (surplus >= 0) {
    surplusElement.style.color = 'var(--color-success)';
  } else {
    surplusElement.style.color = 'var(--color-error)';
  }

  // Update summary table
  updateSummaryTable(totalExpenses);

  // Update status badge
  updateStatusBadge(surplus);

  // Save to storage
  Storage.set('budgetData', budgetData);
}

// Update summary table
function updateSummaryTable(totalExpenses) {
  const tbody = document.getElementById('budget-summary-body');
  tbody.innerHTML = '';

  // Calculate category totals
  const rvCosts = (budgetData.expenses['exp-rv-payment'] || 0) +
                  (budgetData.expenses['exp-rv-insurance'] || 0) +
                  (budgetData.expenses['exp-maintenance'] || 0) +
                  (budgetData.expenses['exp-registration'] || 0);

  const travel = (budgetData.expenses['exp-campground'] || 0) +
                 (budgetData.expenses['exp-fuel'] || 0) +
                 (budgetData.expenses['exp-tolls'] || 0);

  const living = (budgetData.expenses['exp-groceries'] || 0) +
                 (budgetData.expenses['exp-internet'] || 0) +
                 (budgetData.expenses['exp-health'] || 0) +
                 (budgetData.expenses['exp-medical'] || 0) +
                 (budgetData.expenses['exp-entertainment'] || 0) +
                 (budgetData.expenses['exp-personal'] || 0);

  const other = (budgetData.expenses['exp-emergency'] || 0) +
                (budgetData.expenses['exp-other'] || 0);

  // Create rows
  const categories = [
    { name: 'RV Costs', total: rvCosts },
    { name: 'Travel', total: travel },
    { name: 'Daily Living', total: living },
    { name: 'Other', total: other }
  ];

  categories.forEach(category => {
    if (category.total > 0) {
      const percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${category.name}</td>
        <td style="text-align: right;">${formatCurrency(category.total)}</td>
        <td style="text-align: right;">${formatPercent(percentage)}</td>
      `;
      tbody.appendChild(row);
    }
  });

  // Update total
  document.getElementById('summary-total').textContent = formatCurrency(totalExpenses);
}

// Update status badge
function updateStatusBadge(surplus) {
  const badgeContainer = document.getElementById('budget-status-badge');

  if (surplus > 0) {
    badgeContainer.innerHTML = `
      <div style="display: inline-block; padding: var(--space-3) var(--space-6); background: var(--color-success); color: white; border-radius: var(--border-radius); font-size: var(--text-lg); font-weight: var(--font-weight-semibold);">
        Surplus: ${formatCurrency(surplus)}/month
      </div>
    `;
  } else if (surplus < 0) {
    badgeContainer.innerHTML = `
      <div style="display: inline-block; padding: var(--space-3) var(--space-6); background: var(--color-error); color: white; border-radius: var(--border-radius); font-size: var(--text-lg); font-weight: var(--font-weight-semibold);">
        Deficit: ${formatCurrency(Math.abs(surplus))}/month
      </div>
    `;
  } else {
    badgeContainer.innerHTML = `
      <div style="display: inline-block; padding: var(--space-3) var(--space-6); background: var(--color-text-secondary); color: white; border-radius: var(--border-radius); font-size: var(--text-lg); font-weight: var(--font-weight-semibold);">
        Break Even
      </div>
    `;
  }
}
