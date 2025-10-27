// RV Finance Calculator

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rv-calculator-form');
  const resultsSection = document.getElementById('calculator-results');

  // Load saved values if any
  loadSavedValues();

  // Quick fill buttons for Minnie Winnie 22R
  setupQuickFillButtons();

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    calculateRVFinance();
  });

  // Auto-save inputs
  const inputs = form.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', debounce(() => {
      saveFormValues();
    }, 500));
  });
});

// Quick fill buttons for Minnie Winnie 22R pricing
function setupQuickFillButtons() {
  const fillNewBtn = document.getElementById('fill-new');
  const fillUsedBtn = document.getElementById('fill-used');

  if (fillNewBtn) {
    fillNewBtn.addEventListener('click', () => {
      // ESTIMATE ONLY - Starting point for calculations (verify current market pricing)
      document.getElementById('rv-price').value = 85000; // ESTIMATE - Check RVTrader.com for actual pricing
      document.getElementById('down-payment').value = 17000; // 20% down example
      document.getElementById('interest-rate').value = 6.5; // ESTIMATE - Check current lending rates
      document.getElementById('insurance').value = 180; // ESTIMATE - Get real insurance quotes
      document.getElementById('maintenance').value = 200; // ESTIMATE

      showToast(' Filled with ESTIMATES ONLY - Verify all numbers!', 'warning');

      // Auto-calculate
      calculateRVFinance();
    });
  }

  if (fillUsedBtn) {
    fillUsedBtn.addEventListener('click', () => {
      // ESTIMATE ONLY - Starting point for calculations (verify current market pricing)
      document.getElementById('rv-price').value = 65000; // ESTIMATE - Check RVTrader.com for actual pricing
      document.getElementById('down-payment').value = 13000; // 20% down example
      document.getElementById('interest-rate').value = 7.5; // ESTIMATE - Check current lending rates
      document.getElementById('insurance').value = 150; // ESTIMATE - Get real insurance quotes
      document.getElementById('maintenance').value = 250; // ESTIMATE

      showToast(' Filled with ESTIMATES ONLY - Verify all numbers!', 'warning');

      // Auto-calculate
      calculateRVFinance();
    });
  }
}

// Load saved form values
function loadSavedValues() {
  const savedData = Storage.get('rvCalculatorData');
  if (!savedData) return;

  Object.keys(savedData).forEach(key => {
    const input = document.getElementById(key);
    if (input) {
      input.value = savedData[key];
    }
  });
}

// Save form values
function saveFormValues() {
  const form = document.getElementById('rv-calculator-form');
  const inputs = form.querySelectorAll('input, select');
  const data = {};

  inputs.forEach(input => {
    data[input.id] = input.value;
  });

  Storage.set('rvCalculatorData', data);
}

// Calculate RV Finance
function calculateRVFinance() {
  // Get form values
  const rvPrice = parseFloat(document.getElementById('rv-price').value) || 0;
  const downPayment = parseFloat(document.getElementById('down-payment').value) || 0;
  const tradeIn = parseFloat(document.getElementById('trade-in').value) || 0;
  const salesTaxRate = parseFloat(document.getElementById('sales-tax').value) || 0;
  const interestRate = parseFloat(document.getElementById('interest-rate').value) || 0;
  const loanTermYears = parseInt(document.getElementById('loan-term').value) || 15;
  const insurance = parseFloat(document.getElementById('insurance').value) || 0;
  const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
  const storage = parseFloat(document.getElementById('storage').value) || 0;

  // Validate inputs
  if (rvPrice <= 0) {
    showToast('Please enter a valid RV purchase price', 'error');
    return;
  }

  if (interestRate <= 0) {
    showToast('Please enter a valid interest rate', 'error');
    return;
  }

  // Calculate sales tax
  const salesTax = rvPrice * (salesTaxRate / 100);

  // Calculate loan amount
  const totalPrice = rvPrice + salesTax;
  const loanAmount = totalPrice - downPayment - tradeIn;

  // Validate loan amount
  if (loanAmount < 0) {
    showToast('Down payment and trade-in exceed the total price', 'warning');
  }

  const actualLoanAmount = Math.max(0, loanAmount);

  // Calculate monthly payment using loan formula: M = P[r(1+r)^n]/[(1+r)^n-1]
  const monthlyRate = (interestRate / 100) / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPayment = 0;
  if (actualLoanAmount > 0 && monthlyRate > 0) {
    monthlyPayment = actualLoanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Calculate total interest paid
  const totalPaid = monthlyPayment * numberOfPayments;
  const totalInterest = totalPaid - actualLoanAmount;

  // Calculate total monthly cost
  const totalMonthlyCost = monthlyPayment + insurance + maintenance + storage;

  // Calculate total cost of ownership (over loan term)
  const totalOwnershipCost = totalPrice + totalInterest +
    ((insurance + maintenance + storage) * numberOfPayments);

  // Display results
  displayResults({
    monthlyPayment,
    totalMonthlyCost,
    rvPrice,
    downPayment,
    tradeIn,
    salesTax,
    loanAmount: actualLoanAmount,
    totalInterest,
    totalOwnershipCost,
    insurance,
    maintenance,
    storage
  });

  // Show results section
  const resultsSection = document.getElementById('calculator-results');
  resultsSection.classList.remove('hidden');

  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  // Save results
  Storage.set('rvCalculatorResults', {
    monthlyPayment,
    totalMonthlyCost,
    calculatedAt: new Date().toISOString()
  });
}

// Display calculation results
function displayResults(data) {
  // Main results
  document.getElementById('monthly-payment').textContent = formatCurrency(data.monthlyPayment);
  document.getElementById('total-monthly').textContent = formatCurrency(data.totalMonthlyCost);

  // Breakdown table
  document.getElementById('result-price').textContent = formatCurrency(data.rvPrice);
  document.getElementById('result-down').textContent = formatCurrency(data.downPayment);
  document.getElementById('result-trade').textContent = formatCurrency(data.tradeIn);
  document.getElementById('result-tax').textContent = formatCurrency(data.salesTax);
  document.getElementById('result-loan').textContent = formatCurrency(data.loanAmount);
  document.getElementById('result-interest').textContent = formatCurrency(data.totalInterest);
  document.getElementById('result-total').textContent = formatCurrency(data.totalOwnershipCost);

  // Monthly breakdown
  document.getElementById('breakdown-payment').textContent = formatCurrency(data.monthlyPayment);
  document.getElementById('breakdown-insurance').textContent = formatCurrency(data.insurance);
  document.getElementById('breakdown-maintenance').textContent = formatCurrency(data.maintenance);
  document.getElementById('breakdown-storage').textContent = formatCurrency(data.storage);

  // Progress bar (show loan payment as percentage of total monthly)
  const paymentPercent = (data.monthlyPayment / data.totalMonthlyCost) * 100;
  document.getElementById('payment-progress').style.width = paymentPercent + '%';
}
