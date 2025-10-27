// Budget Tracker

let budgetData = {
  income: {},
  expenses: {}
};

document.addEventListener('DOMContentLoaded', () => {
  // Load budget data
  loadBudgetData();

  // Income form inputs
  const incomeInputs = document.querySelectorAll('#income-form input');
  incomeInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
      updateBudget();
    }, 500));
  });

  // Expense form inputs
  const expenseInputs = document.querySelectorAll('#expenses-form input');
  expenseInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
      updateBudget();
    }, 500));
  });
});

// Load budget data from storage
function loadBudgetData() {
  const saved = Storage.get('budgetData');
  if (saved) {
    budgetData = saved;
    populateFormValues();
  }
  updateBudget();
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
  // Get all income values
  budgetData.income = {
    'income-salary': parseFloat(document.getElementById('income-salary').value) || 0,
    'income-remote': parseFloat(document.getElementById('income-remote').value) || 0,
    'income-passive': parseFloat(document.getElementById('income-passive').value) || 0,
    'income-other': parseFloat(document.getElementById('income-other').value) || 0
  };

  // Get all expense values
  budgetData.expenses = {
    // RV Related
    'exp-rv-payment': parseFloat(document.getElementById('exp-rv-payment').value) || 0,
    'exp-rv-insurance': parseFloat(document.getElementById('exp-rv-insurance').value) || 0,
    'exp-maintenance': parseFloat(document.getElementById('exp-maintenance').value) || 0,
    'exp-registration': parseFloat(document.getElementById('exp-registration').value) || 0,

    // Campground & Travel
    'exp-campground': parseFloat(document.getElementById('exp-campground').value) || 0,
    'exp-fuel': parseFloat(document.getElementById('exp-fuel').value) || 0,
    'exp-tolls': parseFloat(document.getElementById('exp-tolls').value) || 0,
    'exp-memberships': parseFloat(document.getElementById('exp-memberships').value) || 0,

    // Utilities
    'exp-internet': parseFloat(document.getElementById('exp-internet').value) || 0,
    'exp-propane': parseFloat(document.getElementById('exp-propane').value) || 0,
    'exp-laundry': parseFloat(document.getElementById('exp-laundry').value) || 0,
    'exp-utilities-other': parseFloat(document.getElementById('exp-utilities-other').value) || 0,

    // Living
    'exp-groceries': parseFloat(document.getElementById('exp-groceries').value) || 0,
    'exp-dining': parseFloat(document.getElementById('exp-dining').value) || 0,
    'exp-health': parseFloat(document.getElementById('exp-health').value) || 0,
    'exp-medical': parseFloat(document.getElementById('exp-medical').value) || 0,
    'exp-entertainment': parseFloat(document.getElementById('exp-entertainment').value) || 0,
    'exp-pets': parseFloat(document.getElementById('exp-pets').value) || 0,
    'exp-personal': parseFloat(document.getElementById('exp-personal').value) || 0,
    'exp-subscriptions': parseFloat(document.getElementById('exp-subscriptions').value) || 0,

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

  // Change surplus color based on positive/negative
  const surplusElement = document.getElementById('monthly-surplus');
  if (surplus >= 0) {
    surplusElement.style.color = 'var(--color-success)';
  } else {
    surplusElement.style.color = 'var(--color-error)';
  }

  // Update budget summary
  updateBudgetSummary(totalExpenses);

  // Update status message
  updateBudgetStatus(totalIncome, totalExpenses, surplus);

  // Save to storage
  Storage.set('budgetData', budgetData);
}

// Update budget summary table
function updateBudgetSummary(totalExpenses) {
  const tbody = document.getElementById('budget-summary-body');
  tbody.innerHTML = '';

  const categories = {
    'RV Related': ['exp-rv-payment', 'exp-rv-insurance', 'exp-maintenance', 'exp-registration'],
    'Campground & Travel': ['exp-campground', 'exp-fuel', 'exp-tolls', 'exp-memberships'],
    'Utilities & Services': ['exp-internet', 'exp-propane', 'exp-laundry', 'exp-utilities-other'],
    'Food': ['exp-groceries', 'exp-dining'],
    'Healthcare': ['exp-health', 'exp-medical'],
    'Lifestyle': ['exp-entertainment', 'exp-pets', 'exp-personal', 'exp-subscriptions'],
    'Savings & Other': ['exp-emergency', 'exp-other']
  };

  Object.keys(categories).forEach(categoryName => {
    const categoryExpenses = categories[categoryName];
    const categoryTotal = categoryExpenses.reduce((sum, key) => {
      return sum + (budgetData.expenses[key] || 0);
    }, 0);

    const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;

    if (categoryTotal > 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${categoryName}</strong></td>
        <td style="text-align: right;">${formatCurrencyDecimals(categoryTotal)}</td>
        <td style="text-align: right;">${formatPercent(percentage)}</td>
      `;
      tbody.appendChild(row);
    }
  });

  // Update total
  document.getElementById('summary-total').textContent = formatCurrencyDecimals(totalExpenses);
}

// Update budget status message
function updateBudgetStatus(income, expenses, surplus) {
  const statusDiv = document.getElementById('budget-status');

  if (income === 0 && expenses === 0) {
    statusDiv.innerHTML = `
      <div class="alert alert-info">
        <strong>💡 Get Started:</strong> Enter your expected monthly income and expenses above to see your budget analysis.
      </div>
    `;
    return;
  }

  if (surplus > 0) {
    const savingsRate = (surplus / income) * 100;
    statusDiv.innerHTML = `
      <div class="alert alert-success">
        <strong>✓ Great job!</strong> You have a surplus of ${formatCurrency(surplus)}/month (${formatPercent(savingsRate)} savings rate).
        This money can go toward your emergency fund, RV upgrades, or extra travel experiences!
      </div>
    `;
  } else if (surplus === 0) {
    statusDiv.innerHTML = `
      <div class="alert alert-warning">
        <strong>⚠️ Breaking Even:</strong> Your income exactly matches your expenses.
        Try to build in a buffer for unexpected costs and savings.
      </div>
    `;
  } else {
    const deficit = Math.abs(surplus);
    statusDiv.innerHTML = `
      <div class="alert alert-error">
        <strong>⚠️ Budget Deficit:</strong> Your expenses exceed your income by ${formatCurrency(deficit)}/month.
        You'll need to either increase income or reduce expenses to make RV living sustainable.
      </div>
    `;
  }

  // Add recommendations
  const recommendations = generateRecommendations(income, expenses, budgetData.expenses);
  if (recommendations.length > 0) {
    statusDiv.innerHTML += `
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title">Budget Recommendations</h3>
        </div>
        <div class="card-body">
          <ul style="list-style: disc; padding-left: var(--space-4);">
            ${recommendations.map(rec => `<li style="margin-bottom: var(--space-2);">${rec}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// Generate budget recommendations
function generateRecommendations(income, expenses, expenseData) {
  const recommendations = [];

  // Campground costs
  const campgroundCost = expenseData['exp-campground'] || 0;
  if (campgroundCost > 900) {
    recommendations.push('Your campground costs are high ($' + campgroundCost + '/month). Consider using more free camping (BLM land, national forests) or monthly campground rates to save money.');
  }

  // Insurance
  const insurance = expenseData['exp-rv-insurance'] || 0;
  if (insurance > 300) {
    recommendations.push('RV insurance seems high. Shop around for quotes and consider raising your deductible to lower premiums.');
  }

  // Food costs
  const foodCost = (expenseData['exp-groceries'] || 0) + (expenseData['exp-dining'] || 0);
  if (foodCost > 800) {
    recommendations.push('Food costs are above average. Cooking more meals in your RV and reducing dining out can significantly reduce expenses.');
  }

  // Emergency fund
  const emergencyContribution = expenseData['exp-emergency'] || 0;
  if (emergencyContribution < 200 && income > 2000) {
    recommendations.push('Consider increasing your emergency fund contribution. RVs need unexpected repairs - aim for at least $200-300/month.');
  }

  // Fuel costs
  const fuelCost = expenseData['exp-fuel'] || 0;
  if (fuelCost > 600) {
    recommendations.push('High fuel costs detected. Consider staying in one location longer to reduce travel frequency and fuel expenses.');
  }

  // Healthcare
  const healthcareCost = (expenseData['exp-health'] || 0) + (expenseData['exp-medical'] || 0);
  if (healthcareCost < 300 && income > 3000) {
    recommendations.push('Make sure you have adequate health insurance coverage. RV living often means limited access to healthcare.');
  }

  // Savings rate
  const surplus = income - expenses;
  const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
  if (savingsRate < 10 && surplus > 0) {
    recommendations.push('Try to save at least 10-20% of your income for future goals and financial security.');
  }

  return recommendations;
}
