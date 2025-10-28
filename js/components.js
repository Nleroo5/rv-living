// Shared Components - Navigation, UI interactions, etc.

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', () => {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Skip if it's just "#"
      if (href === '#') return;

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        const headerOffset = 80; // Height of sticky header
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});

// Form validation helper
function validateForm(formElement, rules) {
  let isValid = true;
  const errors = {};

  Object.keys(rules).forEach(fieldName => {
    const field = formElement.querySelector(`[name="${fieldName}"], #${fieldName}`);
    if (!field) return;

    const rule = rules[fieldName];
    const value = field.value.trim();

    // Clear previous error
    const errorElement = field.parentElement.querySelector('.form-error');
    if (errorElement) {
      errorElement.remove();
    }
    field.classList.remove('error');

    // Required validation
    if (rule.required && !value) {
      errors[fieldName] = rule.message || 'This field is required';
      isValid = false;
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[fieldName] = rule.message || `Minimum ${rule.minLength} characters required`;
      isValid = false;
    }

    // Email validation
    if (rule.email && value && !isValidEmail(value)) {
      errors[fieldName] = rule.message || 'Please enter a valid email address';
      isValid = false;
    }

    // Number validation
    if (rule.number && value && isNaN(value)) {
      errors[fieldName] = rule.message || 'Please enter a valid number';
      isValid = false;
    }

    // Min value validation
    if (rule.min !== undefined && value && parseFloat(value) < rule.min) {
      errors[fieldName] = rule.message || `Value must be at least ${rule.min}`;
      isValid = false;
    }

    // Max value validation
    if (rule.max !== undefined && value && parseFloat(value) > rule.max) {
      errors[fieldName] = rule.message || `Value must be at most ${rule.max}`;
      isValid = false;
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors[fieldName] = rule.message || 'Invalid value';
      isValid = false;
    }

    // Display error if any
    if (errors[fieldName]) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      errorDiv.textContent = errors[fieldName];
      field.parentElement.appendChild(errorDiv);
      field.classList.add('error');
    }
  });

  return { isValid, errors };
}

// Add error styling
if (!document.getElementById('form-error-styles')) {
  const style = document.createElement('style');
  style.id = 'form-error-styles';
  style.textContent = `
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
      border-color: var(--color-error);
    }
  `;
  document.head.appendChild(style);
}

// Loading state helper
function setLoading(element, isLoading) {
  if (isLoading) {
    element.disabled = true;
    element.dataset.originalText = element.textContent;
    element.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span>';
  } else {
    element.disabled = false;
    element.textContent = element.dataset.originalText || 'Submit';
    delete element.dataset.originalText;
  }
}

// Modal helper (simple implementation)
function createModal(title, content, buttons = []) {
  // Remove existing modal if any
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">${sanitizeHTML(title)}</h3>
        <button class="modal-close" aria-label="Close modal">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${buttons.length > 0 ? `
        <div class="modal-footer">
          ${buttons.map(btn => `
            <button class="btn ${btn.class || 'btn-primary'}" data-action="${btn.action}">
              ${sanitizeHTML(btn.text)}
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;

  // Add modal styles if not present
  if (!document.getElementById('modal-styles')) {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: var(--z-modal-backdrop);
        padding: var(--space-4);
      }
      .modal {
        background: var(--color-background);
        border-radius: var(--radius-xl);
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: var(--shadow-2xl);
        z-index: var(--z-modal);
      }
      .modal-header {
        padding: var(--space-4);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-title {
        margin: 0;
        font-size: var(--text-xl);
      }
      .modal-close {
        font-size: var(--text-3xl);
        line-height: 1;
        padding: 0;
        width: 40px;
        height: 40px;
        border-radius: var(--radius-md);
        transition: background-color var(--transition-fast);
      }
      .modal-close:hover {
        background-color: var(--color-border);
      }
      .modal-body {
        padding: var(--space-4);
      }
      .modal-footer {
        padding: var(--space-4);
        border-top: 1px solid var(--color-border);
        display: flex;
        gap: var(--space-2);
        justify-content: flex-end;
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Close button
  const closeBtn = overlay.querySelector('.modal-close');
  closeBtn.addEventListener('click', () => overlay.remove());

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return overlay;
}

// Back to Top Button
document.addEventListener('DOMContentLoaded', () => {
  const backToTopBtn = document.createElement('button');
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(backToTopBtn);

  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  // Scroll to top on click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Save Indicator
function showSaveIndicator(message = 'Saved!') {
  let indicator = document.querySelector('.save-indicator');

  if (!indicator) {
    indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    document.body.appendChild(indicator);
  }

  indicator.textContent = message;
  indicator.classList.add('show');

  setTimeout(() => {
    indicator.classList.remove('show');
  }, 2000);
}

// Enhanced confirm dialog with modal
function confirmDialog(message) {
  return new Promise((resolve) => {
    const modal = createModal('Confirm', `<p>${sanitizeHTML(message)}</p>`, [
      { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
      { text: 'Confirm', class: 'btn-primary', action: 'confirm' }
    ]);

    const buttons = modal.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        modal.remove();
        resolve(action === 'confirm');
      });
    });
  });
}

// Prompt dialog with modal (replacement for window.prompt)
function promptDialog(title, message, defaultValue = '') {
  return new Promise((resolve) => {
    const content = `
      <p style="margin-bottom: var(--space-3);">${sanitizeHTML(message)}</p>
      <input type="text" class="form-input" id="prompt-input" value="${sanitizeHTML(defaultValue)}" autofocus>
    `;

    const modal = createModal(title, content, [
      { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
      { text: 'OK', class: 'btn-primary', action: 'ok' }
    ]);

    const input = modal.querySelector('#prompt-input');
    const buttons = modal.querySelectorAll('[data-action]');

    // Focus input
    setTimeout(() => input.focus(), 100);

    // Handle enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        modal.remove();
        resolve(input.value.trim() || null);
      }
    });

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        modal.remove();
        if (action === 'ok') {
          resolve(input.value.trim() || null);
        } else {
          resolve(null);
        }
      });
    });
  });
}

// Multi-field form dialog (for visited destinations)
function formDialog(title, fields) {
  return new Promise((resolve) => {
    const fieldsHTML = fields.map(field => `
      <div class="form-group">
        <label for="${field.id}" class="form-label">${sanitizeHTML(field.label)}</label>
        ${field.type === 'textarea' ? `
          <textarea id="${field.id}" class="form-textarea" placeholder="${sanitizeHTML(field.placeholder || '')}">${sanitizeHTML(field.value || '')}</textarea>
        ` : `
          <input type="${field.type || 'text'}" id="${field.id}" class="form-input" placeholder="${sanitizeHTML(field.placeholder || '')}" value="${sanitizeHTML(field.value || '')}">
        `}
      </div>
    `).join('');

    const modal = createModal(title, fieldsHTML, [
      { text: 'Cancel', class: 'btn-outline', action: 'cancel' },
      { text: 'Save', class: 'btn-primary', action: 'save' }
    ]);

    const buttons = modal.querySelectorAll('[data-action]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;

        if (action === 'save') {
          const values = {};
          fields.forEach(field => {
            const input = modal.querySelector(`#${field.id}`);
            values[field.id] = input.value.trim();
          });
          modal.remove();
          resolve(values);
        } else {
          modal.remove();
          resolve(null);
        }
      });
    });

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector('input, textarea');
      if (firstInput) firstInput.focus();
    }, 100);
  });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateForm,
    setLoading,
    confirmDialog,
    promptDialog,
    formDialog,
    createModal,
    showSaveIndicator
  };
}
