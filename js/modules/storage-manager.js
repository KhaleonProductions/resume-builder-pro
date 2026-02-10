/**
 * Storage Manager Module
 * Handles local storage and cloud sync abstraction
 * Reusable across applications
 */

class StorageManager {
  constructor(options = {}) {
    this.prefix = options.prefix || 'app_';
    this.cloudProvider = null;
    this.isCloudEnabled = false;
    this.userId = null;
  }

  // ============ LOCAL STORAGE ============

  /**
   * Save data to local storage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON stringified)
   */
  saveLocal(key, data) {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.setItem(prefixedKey, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Storage save error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load data from local storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   */
  loadLocal(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const data = localStorage.getItem(prefixedKey);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Storage load error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from local storage
   * @param {string} key - Storage key
   */
  removeLocal(key) {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all data with this prefix from local storage
   */
  clearLocal() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return { success: true, removed: keysToRemove.length };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all keys with this prefix
   */
  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  // ============ CLOUD STORAGE ============

  /**
   * Initialize cloud provider (Firebase Firestore)
   * @param {object} firestore - Firebase Firestore instance
   * @param {string} userId - Current user ID
   */
  initCloud(firestore, userId) {
    this.cloudProvider = firestore;
    this.userId = userId;
    this.isCloudEnabled = true;
  }

  /**
   * Disable cloud sync
   */
  disableCloud() {
    this.cloudProvider = null;
    this.userId = null;
    this.isCloudEnabled = false;
  }

  /**
   * Save data to cloud storage
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   * @param {object} data - Data to store
   */
  async saveCloud(collection, docId, data) {
    if (!this.isCloudEnabled || !this.cloudProvider) {
      return { success: false, error: 'Cloud storage not initialized' };
    }

    try {
      const docRef = this.cloudProvider
        .collection('users')
        .doc(this.userId)
        .collection(collection)
        .doc(docId);

      await docRef.set({
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Cloud save error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load data from cloud storage
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   */
  async loadCloud(collection, docId) {
    if (!this.isCloudEnabled || !this.cloudProvider) {
      return { success: false, error: 'Cloud storage not initialized' };
    }

    try {
      const docRef = this.cloudProvider
        .collection('users')
        .doc(this.userId)
        .collection(collection)
        .doc(docId);

      const doc = await docRef.get();

      if (doc.exists) {
        return { success: true, data: doc.data() };
      } else {
        return { success: true, data: null };
      }
    } catch (error) {
      console.error('Cloud load error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load all documents from a collection
   * @param {string} collection - Collection name
   */
  async loadAllCloud(collection) {
    if (!this.isCloudEnabled || !this.cloudProvider) {
      return { success: false, error: 'Cloud storage not initialized' };
    }

    try {
      const collectionRef = this.cloudProvider
        .collection('users')
        .doc(this.userId)
        .collection(collection);

      const snapshot = await collectionRef.get();
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, data: documents };
    } catch (error) {
      console.error('Cloud load all error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete document from cloud storage
   * @param {string} collection - Collection name
   * @param {string} docId - Document ID
   */
  async deleteCloud(collection, docId) {
    if (!this.isCloudEnabled || !this.cloudProvider) {
      return { success: false, error: 'Cloud storage not initialized' };
    }

    try {
      const docRef = this.cloudProvider
        .collection('users')
        .doc(this.userId)
        .collection(collection)
        .doc(docId);

      await docRef.delete();
      return { success: true };
    } catch (error) {
      console.error('Cloud delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // ============ SYNC UTILITIES ============

  /**
   * Sync local data to cloud
   * @param {string} key - Local storage key
   * @param {string} collection - Cloud collection name
   * @param {string} docId - Cloud document ID
   */
  async syncToCloud(key, collection, docId) {
    const localData = this.loadLocal(key);
    if (localData) {
      return await this.saveCloud(collection, docId, localData);
    }
    return { success: false, error: 'No local data found' };
  }

  /**
   * Sync cloud data to local
   * @param {string} collection - Cloud collection name
   * @param {string} docId - Cloud document ID
   * @param {string} key - Local storage key
   */
  async syncFromCloud(collection, docId, key) {
    const result = await this.loadCloud(collection, docId);
    if (result.success && result.data) {
      return this.saveLocal(key, result.data);
    }
    return result;
  }
}

// Export for ES6 modules
export { StorageManager };

// Export for non-module usage
if (typeof window !== 'undefined') {
  window.StorageManager = StorageManager;
}
