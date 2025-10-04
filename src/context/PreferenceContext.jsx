import React, { createContext, useContext, useEffect, useState } from 'react';

// Default preferences - synced with background.js
const defaultPreferences = {
  previewDelay: 300,
  previewSize: 'medium',
  enableReadingTime: true,
  enableSocialFeatures: true,
  maxQueueSize: 3,
  siteSpecificSettings: {},
  theme: 'system',
  keyboardShortcuts: {
    detailedPreview: 'shift',
    manualTrigger: 'd'
  },
  customization: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#3b82f6',
    borderRadius: '8px',
    opacity: 0.95
  }
};

// Validation functions
const validatePreferences = (prefs) => {
  const validated = { ...prefs };
  
  // Validate previewDelay
  if (typeof validated.previewDelay !== 'number' || 
      validated.previewDelay < 0 || 
      validated.previewDelay > 2000) {
    validated.previewDelay = defaultPreferences.previewDelay;
  }
  
  // Validate previewSize
  if (!['small', 'medium', 'large'].includes(validated.previewSize)) {
    validated.previewSize = defaultPreferences.previewSize;
  }
  
  // Validate theme
  if (!['light', 'dark', 'system'].includes(validated.theme)) {
    validated.theme = defaultPreferences.theme;
  }
  
  // Validate maxQueueSize
  if (typeof validated.maxQueueSize !== 'number' || 
      validated.maxQueueSize < 1 || 
      validated.maxQueueSize > 10) {
    validated.maxQueueSize = defaultPreferences.maxQueueSize;
  }
  
  // Validate opacity
  if (validated.customization && 
      (typeof validated.customization.opacity !== 'number' || 
       validated.customization.opacity < 0.5 || 
       validated.customization.opacity > 1)) {
    validated.customization.opacity = defaultPreferences.customization.opacity;
  }
  
  return validated;
};

export const PreferenceContext = createContext();

export const PreferenceProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load preferences from Chrome storage on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const result = await chrome.storage.sync.get('userPreferences');
        if (result.userPreferences) {
          const validated = validatePreferences(result.userPreferences);
          setPreferences(validated);
        }
        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading preferences:', err);
        setError('Failed to load preferences');
        setIsLoaded(true);
      }
    };

    loadPreferences();
    
    // Listen for storage changes
    const handleStorageChange = (changes, areaName) => {
      if (areaName === 'sync' && changes.userPreferences) {
        const validated = validatePreferences(changes.userPreferences.newValue);
        setPreferences(validated);
      }
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save preferences to Chrome storage whenever they change (with debounce)
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(async () => {
      try {
        await chrome.storage.sync.set({ userPreferences: preferences });
      } catch (err) {
        console.error('Error saving preferences:', err);
        setError('Failed to save preferences');
      }
    }, 500); // Debounce saves by 500ms

    return () => clearTimeout(timeoutId);
  }, [preferences, isLoaded]);

  // Update specific preferences with validation
  const updatePreferences = (newPreferences) => {
    setPreferences(prev => {
      const merged = {
        ...prev,
        ...newPreferences
      };
      return validatePreferences(merged);
    });
  };

  // Update site-specific settings
  const updateSiteSettings = (hostname, settings) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        siteSpecificSettings: {
          ...prev.siteSpecificSettings,
          [hostname]: {
            ...prev.siteSpecificSettings[hostname],
            ...settings
          }
        }
      };
      return validatePreferences(updated);
    });
  };

  // Remove site-specific settings
  const removeSiteSettings = (hostname) => {
    setPreferences(prev => {
      const updated = { ...prev };
      delete updated.siteSpecificSettings[hostname];
      return updated;
    });
  };

  // Reset preferences to default
  const resetPreferences = async () => {
    setPreferences(defaultPreferences);
    try {
      await chrome.storage.sync.set({ userPreferences: defaultPreferences });
    } catch (err) {
      console.error('Error resetting preferences:', err);
      setError('Failed to reset preferences');
    }
  };

  // Get site-specific settings for current site
  const getSiteSettings = (hostname) => {
    return preferences.siteSpecificSettings[hostname] || {};
  };

  // Get effective preferences for a site (merges defaults with site-specific)
  const getEffectivePreferences = (hostname) => {
    const siteSettings = getSiteSettings(hostname);
    return {
      ...preferences,
      ...siteSettings
    };
  };

  // Export preferences
  const exportPreferences = () => {
    return JSON.stringify(preferences, null, 2);
  };

  // Import preferences
  const importPreferences = async (jsonString) => {
    try {
      const imported = JSON.parse(jsonString);
      const validated = validatePreferences(imported);
      setPreferences(validated);
      await chrome.storage.sync.set({ userPreferences: validated });
      return { success: true };
    } catch (err) {
      console.error('Error importing preferences:', err);
      return { success: false, error: 'Invalid preferences format' };
    }
  };

  return (
    <PreferenceContext.Provider
      value={{
        preferences,
        updatePreferences,
        updateSiteSettings,
        removeSiteSettings,
        resetPreferences,
        getSiteSettings,
        getEffectivePreferences,
        exportPreferences,
        importPreferences,
        isLoaded,
        error
      }}
    >
      {children}
    </PreferenceContext.Provider>
  );
};

// Custom hook for using the preference context
export const usePreferences = () => {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferenceProvider');
  }
  return context;
};