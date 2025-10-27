// Utility Functions

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format currency with decimals
function formatCurrencyDecimals(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format percentage
function formatPercent(value) {
  return value.toFixed(1) + '%';
}

// Local Storage helpers
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);

      // Handle quota exceeded specifically
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        if (typeof showToast === 'function') {
          showToast('Storage is full! Please clear some data or remove old items.', 'error');
        } else {
          alert('Storage is full! Please clear some data.');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast('Error saving data. Please try again.', 'error');
        }
      }
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Show toast notification (simple implementation)
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type}`;
  toast.style.position = 'fixed';
  toast.style.top = '20px';
  toast.style.right = '20px';
  toast.style.zIndex = '1000';
  toast.style.maxWidth = '400px';
  toast.style.animation = 'slideIn 0.3s ease-out';
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Add animations to CSS if not already present
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

// Get form data as object
function getFormData(formElement) {
  const formData = new FormData(formElement);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

// Date helpers
const DateUtils = {
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  formatDateShort(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  },

  daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  },

  daysUntil(targetDate) {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
};

// Data Export/Import Utilities
const DataManager = {
  // Export all data to JSON file
  exportAllData() {
    const allData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      destinations: Storage.get('destinations', []),
      checklistItems: Storage.get('checklistItems', []),
      budgetData: Storage.get('budgetData', {}),
      uploadedFiles: Storage.get('uploadedFiles', []),
      weeklyProgress: Storage.get('weeklyProgress', {})
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `rv-adventures-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully!', 'success');
  },

  // Export specific page data
  exportPageData(pageName, dataKey) {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      page: pageName,
      data: Storage.get(dataKey, [])
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${pageName}-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`${pageName} data exported!`, 'success');
  },

  // Import data from JSON file
  async importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);

          // Validate data structure
          if (!data.version) {
            throw new Error('Invalid backup file format');
          }

          // Show confirmation dialog
          const confirmed = await confirmDialog(
            `Import data from ${data.exportDate ? new Date(data.exportDate).toLocaleDateString() : 'backup file'}?\n\nThis will REPLACE your current data. Make sure you have a backup first!`
          );

          if (!confirmed) {
            resolve(false);
            return;
          }

          // Import all data
          if (data.destinations) Storage.set('destinations', data.destinations);
          if (data.checklistItems) Storage.set('checklistItems', data.checklistItems);
          if (data.budgetData) Storage.set('budgetData', data.budgetData);
          if (data.uploadedFiles) Storage.set('uploadedFiles', data.uploadedFiles);
          if (data.weeklyProgress) Storage.set('weeklyProgress', data.weeklyProgress);

          // If it's page-specific data
          if (data.page && data.data) {
            const keyMap = {
              'destinations': 'destinations',
              'checklist': 'checklistItems',
              'budget': 'budgetData'
            };
            const storageKey = keyMap[data.page];
            if (storageKey) {
              Storage.set(storageKey, data.data);
            }
          }

          showToast('Data imported successfully! Reloading page...', 'success');

          setTimeout(() => {
            window.location.reload();
          }, 1500);

          resolve(true);
        } catch (error) {
          console.error('Import error:', error);
          showToast('Error importing data. Please check the file format.', 'error');
          reject(error);
        }
      };

      reader.onerror = () => {
        showToast('Error reading file', 'error');
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  },

  // Get storage usage info
  getStorageInfo() {
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    // Rough estimate: localStorage is typically 5-10MB
    const maxSize = 10 * 1024 * 1024; // 10MB estimate
    const usedMB = (totalSize / (1024 * 1024)).toFixed(2);
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    const percentUsed = ((totalSize / maxSize) * 100).toFixed(1);

    return {
      used: totalSize,
      usedMB,
      maxMB,
      percentUsed,
      remaining: maxSize - totalSize
    };
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatCurrency,
    formatCurrencyDecimals,
    formatPercent,
    Storage,
    generateId,
    debounce,
    showToast,
    isValidEmail,
    sanitizeHTML,
    getFormData,
    DateUtils,
    DataManager
  };
}
