import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { PreferenceProvider, usePreferences } from '../../context/PreferenceContext';
import { CustomizationStudio } from '../../components/ui/CustomizationStudio';
import { KeyboardShortcutConfig } from '../../components/ui/KeyboardShortcutConfig';
import { SettingsFoldout } from '../../components/ui/SettingsFoldout';
import '../../index.css';
// Main options component
const OptionsContent = () => {
  const { preferences, updatePreferences, resetPreferences, isLoaded } = usePreferences();
  const [activeTab, setActiveTab] = useState('general');
  
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reverse Link Preview Options</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Customize your link preview experience</p>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('appearance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appearance'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Appearance
            </button>
            <button
              onClick={() => setActiveTab('controls')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'controls'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Advanced
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">General Settings</h2>
              
              {/* Preview delay */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview delay (ms): {preferences.previewDelay}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={preferences.previewDelay}
                  onChange={(e) => updatePreferences({ previewDelay: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0ms (Instant)</span>
                  <span>1000ms (1 second)</span>
                </div>
              </div>

              {/* Preview size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Preview size
                </label>
                <div className="flex space-x-4">
                  {['small', 'medium', 'large'].map((size) => (
                    <div key={size} className="flex items-center">
                      <input
                        type="radio"
                        id={`size-${size}`}
                        name="previewSize"
                        value={size}
                        checked={preferences.previewSize === size}
                        onChange={() => updatePreferences({ previewSize: size })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`size-${size}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature toggles */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enable-reading-time"
                    checked={preferences.enableReadingTime}
                    onChange={(e) => updatePreferences({ enableReadingTime: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enable-reading-time" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Show reading time for articles
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enable-social-features"
                    checked={preferences.enableSocialFeatures}
                    onChange={(e) => updatePreferences({ enableSocialFeatures: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enable-social-features" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable social features (comments, ratings)
                  </label>
                </div>
              </div>

              {/* Maximum queue size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum preview queue size: {preferences.maxQueueSize}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={preferences.maxQueueSize}
                  onChange={(e) => updatePreferences({ maxQueueSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Appearance Settings</h2>
              
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex space-x-4">
                  {['light', 'dark', 'system'].map((theme) => (
                    <div key={theme} className="flex items-center">
                      <input
                        type="radio"
                        id={`theme-${theme}`}
                        name="theme"
                        value={theme}
                        checked={preferences.theme === theme}
                        onChange={() => updatePreferences({ theme })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`theme-${theme}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {theme}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Customization Studio */}
              <CustomizationStudio />
            </div>
          )}

          {activeTab === 'controls' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Control Settings</h2>
              
              {/* Keyboard shortcuts */}
              <KeyboardShortcutConfig />
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Advanced Settings</h2>
              
              {/* Site-specific settings */}
              <SettingsFoldout />
              
              {/* Import/Export */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Import/Export Settings</h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      // Export settings
                      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                        JSON.stringify(preferences, null, 2)
                      )}`;
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute('href', dataStr);
                      downloadAnchorNode.setAttribute('download', 'reverse-link-preview-settings.json');
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Export Settings
                  </button>
                  
                  <label className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer">
                    Import Settings
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const importedSettings = JSON.parse(e.target.result);
                              updatePreferences(importedSettings);
                              alert('Settings imported successfully');
                            } catch (error) {
                              alert('Error importing settings: Invalid JSON format');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              
              {/* Reset to defaults */}
              <div>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all settings to default?')) {
                      resetPreferences();
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reset to Default Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Reverse Link Preview Extension - Version 1.0.0</p>
        </footer>
      </div>
    </div>
  );
};

// Wrap the options component with the provider
const Options = () => {
  return (
    <PreferenceProvider>
      <OptionsContent />
    </PreferenceProvider>
  );
};

// Initialize the options page when DOM is ready
const initOptions = () => {
  const rootElement = document.getElementById('options-root');
  if (!rootElement) {
    console.error('Options root element not found');
    return;
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOptions);
} else {
  initOptions();
}

export default Options;