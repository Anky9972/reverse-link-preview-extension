/**
 * User Preferences Service
 * 
 * Manages user preferences for the Reverse Link Preview extension.
 * Handles loading, saving, and updating preferences from Chrome storage.
 * src/services/userPreferences.js
 */

// Default preferences configuration
const defaultPreferences = {
    previewDelay: 300, // ms to wait before showing preview
    previewSize: 'medium', // small, medium, large
    enableReadingTime: true,
    enableSocialFeatures: true,
    maxQueueSize: 3,
    siteSpecificSettings: {},
    theme: 'light', // light, dark, system
    keyboardShortcuts: {
      detailedPreview: 'shift'
    },
    customization: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#3b82f6',
      borderRadius: '8px',
      opacity: 0.95
    },
    profiles: {
      default: {
        name: 'Default',
        isActive: true
      },
      work: {
        name: 'Work',
        isActive: false,
        previewDelay: 500,
        previewSize: 'small',
        enableSocialFeatures: false
      },
      research: {
        name: 'Research',
        isActive: false,
        enableReadingTime: true,
        previewSize: 'large'
      }
    },
    analytics: {
      enabled: false,
      collectUsageData: false,
      storageDuration: 30 // days
    },
    version: '1.0.0'
  };
  
  /**
   * Check storage quota
   * @returns {Promise<Object>} Storage info with bytesInUse and quota
   */
  const checkStorageQuota = async () => {
    return new Promise((resolve) => {
      chrome.storage.sync.getBytesInUse(null, (bytesInUse) => {
        resolve({
          bytesInUse,
          quota: chrome.storage.sync.QUOTA_BYTES || 102400, // 100KB default
          percentUsed: (bytesInUse / 102400) * 100,
          available: 102400 - bytesInUse
        });
      });
    });
  };
  
  /**
   * Load preferences from Chrome storage
   * @returns {Promise<Object>} User preferences
   */
  const loadPreferences = async () => {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.sync.get('userPreferences', (result) => {
          if (chrome.runtime.lastError) {
            console.error('Error loading preferences:', chrome.runtime.lastError);
            // Return defaults on error
            resolve({ ...defaultPreferences });
            return;
          }
          
          if (result.userPreferences) {
            // Merge with defaults to ensure all properties exist
            const merged = mergeWithDefaults(result.userPreferences);
            resolve(merged);
          } else {
            // If no preferences found, save and return defaults
            savePreferences(defaultPreferences).then(() => {
              resolve({ ...defaultPreferences });
            }).catch(() => {
              resolve({ ...defaultPreferences });
            });
          }
        });
      } catch (error) {
        console.error('Error in loadPreferences:', error);
        resolve({ ...defaultPreferences });
      }
    });
  };
  
  /**
   * Merge saved preferences with defaults
   * @param {Object} saved - Saved preferences
   * @returns {Object} Merged preferences
   */
  const mergeWithDefaults = (saved) => {
    const merged = { ...defaultPreferences };
    
    // Deep merge for nested objects
    for (const key in saved) {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        merged[key] = { ...defaultPreferences[key], ...saved[key] };
      } else {
        merged[key] = saved[key];
      }
    }
    
    return merged;
  };
  
  /**
   * Save preferences to Chrome storage
   * @param {Object} preferences - User preferences to save
   * @returns {Promise<void>}
   */
  const savePreferences = async (preferences) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Check quota before saving
        const quota = await checkStorageQuota();
        const estimatedSize = JSON.stringify(preferences).length;
        
        if (estimatedSize > quota.available) {
          console.warn('Preferences may exceed storage quota');
          // Try to trim site-specific settings if too large
          const trimmed = trimPreferences(preferences);
          preferences = trimmed;
        }
        
        chrome.storage.sync.set({ userPreferences: preferences }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error saving preferences:', chrome.runtime.lastError);
            
            // If quota exceeded, try local storage as fallback
            if (chrome.runtime.lastError.message.includes('QUOTA_BYTES')) {
              chrome.storage.local.set({ userPreferences: preferences }, () => {
                if (chrome.runtime.lastError) {
                  reject(new Error('Failed to save preferences: ' + chrome.runtime.lastError.message));
                } else {
                  console.warn('Saved to local storage due to sync quota exceeded');
                  resolve();
                }
              });
            } else {
              reject(new Error(chrome.runtime.lastError.message));
            }
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error('Error in savePreferences:', error);
        reject(error);
      }
    });
  };
  
  /**
   * Trim preferences to fit within storage quota
   * @param {Object} preferences - Preferences to trim
   * @returns {Object} Trimmed preferences
   */
  const trimPreferences = (preferences) => {
    const trimmed = { ...preferences };
    
    // Remove oldest site-specific settings if there are too many
    if (trimmed.siteSpecificSettings && Object.keys(trimmed.siteSpecificSettings).length > 50) {
      const sites = Object.entries(trimmed.siteSpecificSettings);
      // Keep only the first 50
      trimmed.siteSpecificSettings = Object.fromEntries(sites.slice(0, 50));
      console.warn('Trimmed site-specific settings to 50 entries');
    }
    
    return trimmed;
  };
  
  /**
   * Update specific preferences
   * @param {Object} newPreferences - Preferences to update
   * @returns {Promise<Object>} Updated preferences
   */
  const updatePreferences = async (newPreferences) => {
    try {
      const currentPreferences = await loadPreferences();
      const updatedPreferences = { ...currentPreferences, ...newPreferences };
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };
  
  /**
   * Get site-specific settings for a given hostname
   * @param {string} hostname - The hostname to get settings for
   * @returns {Promise<Object>} Site-specific settings
   */
  const getSiteSettings = async (hostname) => {
    try {
      if (!hostname || typeof hostname !== 'string') {
        return {};
      }
      
      const preferences = await loadPreferences();
      return preferences.siteSpecificSettings[hostname] || {};
    } catch (error) {
      console.error('Error getting site settings:', error);
      return {};
    }
  };
  
  /**
   * Update site-specific settings for a given hostname
   * @param {string} hostname - The hostname to update settings for
   * @param {Object} settings - The settings to update
   * @returns {Promise<Object>} Updated preferences
   */
  const updateSiteSettings = async (hostname, settings) => {
    try {
      if (!hostname || typeof hostname !== 'string') {
        throw new Error('Invalid hostname');
      }
      
      const preferences = await loadPreferences();
      const updatedPreferences = {
        ...preferences,
        siteSpecificSettings: {
          ...preferences.siteSpecificSettings,
          [hostname]: {
            ...preferences.siteSpecificSettings[hostname],
            ...settings
          }
        }
      };
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  };
  
  /**
   * Delete site-specific settings for a hostname
   * @param {string} hostname - The hostname to delete settings for
   * @returns {Promise<Object>} Updated preferences
   */
  const deleteSiteSettings = async (hostname) => {
    try {
      const preferences = await loadPreferences();
      const updatedSettings = { ...preferences.siteSpecificSettings };
      delete updatedSettings[hostname];
      
      const updatedPreferences = {
        ...preferences,
        siteSpecificSettings: updatedSettings
      };
      
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error deleting site settings:', error);
      throw error;
    }
  };
  
  /**
   * Reset preferences to default values
   * @returns {Promise<Object>} Default preferences
   */
  const resetPreferences = async () => {
    try {
      await savePreferences({ ...defaultPreferences });
      return { ...defaultPreferences };
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw error;
    }
  };
  
  /**
   * Get active profile settings
   * @returns {Promise<Object>} Active profile merged with base preferences
   */
  const getActiveProfile = async () => {
    try {
      const preferences = await loadPreferences();
      
      // Find active profile
      let activeProfileKey = 'default';
      for (const [key, profile] of Object.entries(preferences.profiles)) {
        if (profile && profile.isActive) {
          activeProfileKey = key;
          break;
        }
      }
      
      const activeProfile = preferences.profiles[activeProfileKey];
      
      if (!activeProfile) {
        return preferences;
      }
      
      // Return a merged version of base preferences with active profile settings
      const profileMerged = { ...preferences };
      
      // Only override properties that exist in the profile
      for (const [key, value] of Object.entries(activeProfile)) {
        if (key !== 'name' && key !== 'isActive' && value !== undefined) {
          profileMerged[key] = value;
        }
      }
      
      return profileMerged;
    } catch (error) {
      console.error('Error getting active profile:', error);
      return defaultPreferences;
    }
  };
  
  /**
   * Set active profile
   * @param {string} profileKey - Key of the profile to activate
   * @returns {Promise<Object>} Updated preferences
   */
  const setActiveProfile = async (profileKey) => {
    try {
      const preferences = await loadPreferences();
      
      // Ensure the profile exists
      if (!preferences.profiles[profileKey]) {
        throw new Error(`Profile "${profileKey}" does not exist`);
      }
      
      // Deactivate all profiles and activate the selected one
      const updatedProfiles = {};
      for (const [key, profile] of Object.entries(preferences.profiles)) {
        updatedProfiles[key] = {
          ...profile,
          isActive: key === profileKey
        };
      }
      
      const updatedPreferences = {
        ...preferences,
        profiles: updatedProfiles
      };
      
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error setting active profile:', error);
      throw error;
    }
  };
  
  /**
   * Create a new profile
   * @param {string} profileKey - Key for the new profile
   * @param {Object} profileData - Profile configuration
   * @returns {Promise<Object>} Updated preferences
   */
  const createProfile = async (profileKey, profileData) => {
    try {
      if (!profileKey || typeof profileKey !== 'string') {
        throw new Error('Invalid profile key');
      }
      
      const preferences = await loadPreferences();
      
      if (preferences.profiles[profileKey]) {
        throw new Error(`Profile "${profileKey}" already exists`);
      }
      
      const updatedPreferences = {
        ...preferences,
        profiles: {
          ...preferences.profiles,
          [profileKey]: {
            name: profileData.name || profileKey,
            isActive: false,
            ...profileData
          }
        }
      };
      
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };
  
  /**
   * Delete a profile
   * @param {string} profileKey - Key of the profile to delete
   * @returns {Promise<Object>} Updated preferences
   */
  const deleteProfile = async (profileKey) => {
    try {
      if (profileKey === 'default') {
        throw new Error('Cannot delete default profile');
      }
      
      const preferences = await loadPreferences();
      
      if (!preferences.profiles[profileKey]) {
        throw new Error(`Profile "${profileKey}" does not exist`);
      }
      
      const updatedProfiles = { ...preferences.profiles };
      const wasActive = updatedProfiles[profileKey].isActive;
      delete updatedProfiles[profileKey];
      
      // If deleted profile was active, activate default
      if (wasActive) {
        updatedProfiles.default.isActive = true;
      }
      
      const updatedPreferences = {
        ...preferences,
        profiles: updatedProfiles
      };
      
      await savePreferences(updatedPreferences);
      return updatedPreferences;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };
  
  /**
   * Export preferences as JSON
   * @returns {Promise<string>} JSON string of preferences
   */
  const exportPreferences = async () => {
    try {
      const preferences = await loadPreferences();
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.error('Error exporting preferences:', error);
      throw error;
    }
  };
  
  /**
   * Import preferences from JSON
   * @param {string} json - JSON string of preferences to import
   * @returns {Promise<Object>} Updated preferences
   */
  const importPreferences = async (json) => {
    try {
      if (!json || typeof json !== 'string') {
        throw new Error('Invalid JSON string');
      }
      
      const importedPreferences = JSON.parse(json);
      
      // Validate imported preferences
      if (!importedPreferences || typeof importedPreferences !== 'object') {
        throw new Error('Invalid preferences format');
      }
      
      // Merge with defaults to ensure all required properties exist
      const merged = mergeWithDefaults(importedPreferences);
      
      await savePreferences(merged);
      return merged;
    } catch (error) {
      console.error('Error importing preferences:', error);
      throw new Error('Invalid preferences JSON format: ' + error.message);
    }
  };
  
  export const userPreferences = {
    loadPreferences,
    savePreferences,
    updatePreferences,
    getSiteSettings,
    updateSiteSettings,
    deleteSiteSettings,
    resetPreferences,
    getActiveProfile,
    setActiveProfile,
    createProfile,
    deleteProfile,
    exportPreferences,
    importPreferences,
    checkStorageQuota,
    getDefaultPreferences: () => ({ ...defaultPreferences })
  };