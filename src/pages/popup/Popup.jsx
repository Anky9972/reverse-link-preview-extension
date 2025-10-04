import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
// import '../../../src/assets/tailwind.css';
import '../../index.css';

const Popup = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentSite, setCurrentSite] = useState('');
  const [siteSettings, setSiteSettings] = useState({});
  const [preferences, setPreferences] = useState({
    previewDelay: 300,
    previewSize: 'medium',
    theme: 'light'
  });

  // Load preferences on mount
  useEffect(() => {
    chrome.storage.sync.get(['userPreferences', 'siteSettings'], (result) => {
      if (result.userPreferences) {
        setPreferences(result.userPreferences);
      }
      
      if (result.siteSettings) {
        setSiteSettings(result.siteSettings);
      }
    });
    
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          setCurrentSite(url.hostname);
        } catch (e) {
          console.error('Error parsing URL:', e);
        }
      }
    });
  }, []);

  // Save preferences when they change
  const savePreferences = (newPreferences) => {
    chrome.storage.sync.set({ userPreferences: newPreferences }, () => {
      setPreferences(newPreferences);
    });
  };

  // Toggle extension on/off for current site
  const toggleForSite = () => {
    const newSiteSettings = { ...siteSettings };
    
    if (!newSiteSettings[currentSite]) {
      newSiteSettings[currentSite] = {};
    }
    
    newSiteSettings[currentSite].enabled = !newSiteSettings[currentSite].enabled;
    
    chrome.storage.sync.set({ siteSettings: newSiteSettings }, () => {
      setSiteSettings(newSiteSettings);
    });
  };

  // Handle delay change
  const handleDelayChange = (e) => {
    const newPreferences = { ...preferences, previewDelay: parseInt(e.target.value, 10) };
    savePreferences(newPreferences);
  };

  // Handle preview size change
  const handleSizeChange = (size) => {
    const newPreferences = { ...preferences, previewSize: size };
    savePreferences(newPreferences);
  };

  // Handle theme change
  const handleThemeChange = (theme) => {
    const newPreferences = { ...preferences, theme };
    savePreferences(newPreferences);
  };

  // Open options page
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  // Check if the extension is enabled for the current site
  const isEnabledForSite = () => {
    if (!currentSite || !siteSettings[currentSite]) return true;
    return siteSettings[currentSite].enabled !== false;
  };

  return (
    <div className="w-64 p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Link Preview</h1>
        <img src="/icons/icon48.png" alt="Logo" className="w-6 h-6" />
      </div>
      
      {/* Current site toggle */}
      {currentSite && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{currentSite}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isEnabledForSite()} 
                onChange={toggleForSite}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isEnabledForSite() ? 'Enabled' : 'Disabled'} for this site
          </p>
        </div>
      )}
      
      {/* Preview delay */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Preview Delay</label>
        <input 
          type="range" 
          min="0" 
          max="1000" 
          step="50" 
          value={preferences.previewDelay} 
          onChange={handleDelayChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Fast</span>
          <span>{preferences.previewDelay}ms</span>
          <span>Slow</span>
        </div>
      </div>
      
      {/* Preview size */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Preview Size</label>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleSizeChange('small')}
            className={`px-2 py-1 text-xs rounded ${preferences.previewSize === 'small' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Small
          </button>
          <button 
            onClick={() => handleSizeChange('medium')}
            className={`px-2 py-1 text-xs rounded ${preferences.previewSize === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => handleSizeChange('large')}
            className={`px-2 py-1 text-xs rounded ${preferences.previewSize === 'large' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Large
          </button>
        </div>
      </div>
      
      {/* Theme */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Theme</label>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleThemeChange('light')}
            className={`px-2 py-1 text-xs rounded ${preferences.theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Light
          </button>
          <button 
            onClick={() => handleThemeChange('dark')}
            className={`px-2 py-1 text-xs rounded ${preferences.theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Dark
          </button>
          <button 
            onClick={() => handleThemeChange('system')}
            className={`px-2 py-1 text-xs rounded ${preferences.theme === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            System
          </button>
        </div>
      </div>
      
      {/* Advanced settings button */}
      <button 
        onClick={openOptionsPage}
        className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Advanced Settings
      </button>
    </div>
  );
};

// Initialize the popup when DOM is ready
const initPopup = () => {
  const rootElement = document.getElementById('popup-root');
  if (!rootElement) {
    console.error('Popup root element not found');
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  initPopup();
}

export default Popup;