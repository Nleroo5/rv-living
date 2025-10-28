// Simple RV Loan Calculator

document.addEventListener('DOMContentLoaded', () => {
  // Get all input elements
  const purchasePrice = document.getElementById('purchase-price');
  const downPayment = document.getElementById('down-payment');
  const loanTerm = document.getElementById('loan-term');
  const interestRate = document.getElementById('interest-rate');

  // Setup collapsible section
  const scheduleSection = document.getElementById('schedule-section');
  const scheduleHeader = scheduleSection.querySelector('.collapsible-header');

  scheduleHeader.addEventListener('click', () => {
    scheduleSection.classList.toggle('open');
  });

  // Add event listeners for real-time calculation
  purchasePrice.addEventListener('input', debounce(calculate, 300));
  downPayment.addEventListener('input', debounce(calculate, 300));
  loanTerm.addEventListener('input', () => {
    updateTermDisplay();
    calculate();
  });
  interestRate.addEventListener('input', debounce(calculate, 300));

  // Update term display when slider changes
  function updateTermDisplay() {
    const years = loanTerm.value;
    document.getElementById('term-display').textContent = `(${years} years)`;
  }

  // Initial calculation
  updateTermDisplay();
  calculate();
});

// Main calculation function
function calculate() {
  const price = parseFloat(document.getElementById('purchase-price').value) || 0;
  const down = parseFloat(document.getElementById('down-payment').value) || 0;
  const term = parseInt(document.getElementById('loan-term').value) || 15;
  const rate = parseFloat(document.getElementById('interest-rate').value) || 0;

  // Calculate down payment percentage
  const downPercent = price > 0 ? (down / price) * 100 : 0;
  document.getElementById('down-percent').textContent = `(${downPercent.toFixed(1)}%)`;

  // Calculate amount financed
  const amountFinanced = price - down;

  // Calculate monthly payment using standard loan formula
  // M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyRate = rate / 100 / 12;
  const numPayments = term * 12;

  let monthlyPayment = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  if (amountFinanced > 0 && rate > 0) {
    monthlyPayment = amountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
    totalPaid = monthlyPayment * numPayments;
    totalInterest = totalPaid - amountFinanced;
  } else if (amountFinanced > 0 && rate === 0) {
    // No interest case
    monthlyPayment = amountFinanced / numPayments;
    totalPaid = amountFinanced;
    totalInterest = 0;
  }

  // Update display
  document.getElementById('monthly-payment').textContent = formatCurrency(monthlyPayment);
  document.getElementById('amount-financed').textContent = formatCurrency(amountFinanced);
  document.getElementById('total-interest').textContent = formatCurrency(totalInterest);
  document.getElementById('total-paid').textContent = formatCurrency(totalPaid);

  // Generate payment schedule
  generatePaymentSchedule(amountFinanced, monthlyPayment, monthlyRate, term);
}

// Generate year-by-year payment schedule
function generatePaymentSchedule(principal, monthlyPayment, monthlyRate, years) {
  const tbody = document.getElementById('schedule-body');
  tbody.innerHTML = '';

  let balance = principal;

  for (let year = 1; year <= years; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    // Calculate 12 months for this year
    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;

      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;

      yearPrincipal += principalPayment;
      yearInterest += interestPayment;
      balance -= principalPayment;

      // Prevent negative balance
      if (balance < 0) {
        yearPrincipal += balance; // Adjust last payment
        balance = 0;
      }
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>Year ${year}</strong></td>
      <td style="text-align: right;">${formatCurrency(yearPrincipal)}</td>
      <td style="text-align: right;">${formatCurrency(yearInterest)}</td>
      <td style="text-align: right;">${formatCurrency(Math.max(0, balance))}</td>
    `;
    tbody.appendChild(row);

    if (balance <= 0) break;
  }
}
