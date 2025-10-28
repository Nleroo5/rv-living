// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbfHDpOqSxyYWu-VA3BGTiywYxReywUO4",
  authDomain: "rv-adventures-b8eb8.firebaseapp.com",
  projectId: "rv-adventures-b8eb8",
  storageBucket: "rv-adventures-b8eb8.firebasestorage.app",
  messagingSenderId: "141364506053",
  appId: "1:141364506053:web:ce37110318f2a51448afac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// User ID - for now, use a simple identifier (you can add authentication later)
const userId = 'user_' + (localStorage.getItem('rv_user_id') || Date.now());
if (!localStorage.getItem('rv_user_id')) {
  localStorage.setItem('rv_user_id', userId);
}

// Firebase Database Helper Functions
window.FirebaseDB = {
  // Save destinations to Firestore
  async saveDestinations(destinations) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        destinations: destinations,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Destinations saved to Firebase');
      return true;
    } catch (error) {
      // Silently fall back to localStorage (Firebase not enabled yet)
      localStorage.setItem('destinations', JSON.stringify(destinations));
      return false;
    }
  },

  // Load destinations from Firestore
  async loadDestinations() {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().destinations) {
        console.log('Destinations loaded from Firebase');
        return docSnap.data().destinations;
      } else {
        // Try localStorage fallback
        const localData = localStorage.getItem('destinations');
        return localData ? JSON.parse(localData) : [];
      }
    } catch (error) {
      // Silently fall back to localStorage (Firebase not enabled yet)
      const localData = localStorage.getItem('destinations');
      return localData ? JSON.parse(localData) : [];
    }
  },

  // Save folders to Firestore
  async saveFolders(folders) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        folders: folders,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Folders saved to Firebase');
      return true;
    } catch (error) {
      // Silently fall back to localStorage (Firebase not enabled yet)
      localStorage.setItem('folders', JSON.stringify(folders));
      return false;
    }
  },

  // Load folders from Firestore
  async loadFolders() {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().folders) {
        console.log('Folders loaded from Firebase');
        return docSnap.data().folders;
      } else {
        const localData = localStorage.getItem('folders');
        return localData ? JSON.parse(localData) : [];
      }
    } catch (error) {
      // Silently fall back to localStorage (Firebase not enabled yet)
      const localData = localStorage.getItem('folders');
      return localData ? JSON.parse(localData) : [];
    }
  },

  // Upload media file to Firebase Storage
  async uploadMedia(file, destinationId) {
    try {
      const timestamp = Date.now();
      const fileName = `${destinationId}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, `media/${userId}/${fileName}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      console.log('Media uploaded to Firebase Storage');
      return {
        name: file.name,
        type: file.type,
        url: downloadURL,
        path: fileName,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  },

  // Delete media file from Firebase Storage
  async deleteMedia(filePath) {
    try {
      const storageRef = ref(storage, `media/${userId}/${filePath}`);
      await deleteObject(storageRef);
      console.log('Media deleted from Firebase Storage');
      return true;
    } catch (error) {
      console.error('Error deleting media:', error);
      return false;
    }
  },

  // Save budget data
  async saveBudget(budgetData) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        budget: budgetData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Budget saved to Firebase');
      return true;
    } catch (error) {
      console.error('Error saving budget:', error);
      localStorage.setItem('budget', JSON.stringify(budgetData));
      return false;
    }
  },

  // Load budget data
  async loadBudget() {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().budget) {
        console.log('Budget loaded from Firebase');
        return docSnap.data().budget;
      } else {
        const localData = localStorage.getItem('budget');
        return localData ? JSON.parse(localData) : null;
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      const localData = localStorage.getItem('budget');
      return localData ? JSON.parse(localData) : null;
    }
  },

  // Save checklist data
  async saveChecklist(checklistData) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        checklist: checklistData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Checklist saved to Firebase');
      return true;
    } catch (error) {
      console.error('Error saving checklist:', error);
      localStorage.setItem('checklist', JSON.stringify(checklistData));
      return false;
    }
  },

  // Load checklist data
  async loadChecklist() {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().checklist) {
        console.log('Checklist loaded from Firebase');
        return docSnap.data().checklist;
      } else {
        const localData = localStorage.getItem('checklist');
        return localData ? JSON.parse(localData) : null;
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
      const localData = localStorage.getItem('checklist');
      return localData ? JSON.parse(localData) : null;
    }
  },

  // Save calculator data
  async saveCalculator(calculatorData) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        calculator: calculatorData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Calculator saved to Firebase');
      return true;
    } catch (error) {
      console.error('Error saving calculator:', error);
      localStorage.setItem('calculator', JSON.stringify(calculatorData));
      return false;
    }
  },

  // Load calculator data
  async loadCalculator() {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().calculator) {
        console.log('Calculator loaded from Firebase');
        return docSnap.data().calculator;
      } else {
        const localData = localStorage.getItem('calculator');
        return localData ? JSON.parse(localData) : null;
      }
    } catch (error) {
      console.error('Error loading calculator:', error);
      const localData = localStorage.getItem('calculator');
      return localData ? JSON.parse(localData) : null;
    }
  }
};

// Make FirebaseDB available globally
console.log('Firebase initialized successfully');

// Export for use in modules
export { db, storage, userId };
