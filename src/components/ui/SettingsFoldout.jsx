import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferenceContext';

export const SettingsFoldout = ({ onClose }) => {
  const { preferences, updatePreferences } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);

  const toggleFoldout = () => {
    setIsOpen(!isOpen);
  };

  const handlePreviewDelayChange = (e) => {
    updatePreferences({ previewDelay: parseInt(e.target.value, 10) });
  };

  const handlePreviewSizeChange = (e) => {
    updatePreferences({ previewSize: e.target.value });
  };

  const handleThemeChange = (e) => {
    updatePreferences({ theme: e.target.value });
  };

  const handleFeatureToggle = (feature) => {
    updatePreferences({ [feature]: !preferences[feature] });
  };

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={toggleFoldout}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span>Settings</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Quick Settings</h3>
              <button
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                onClick={onClose}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Preview Delay */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">Preview Delay</label>
              <input
                type="range"
                min="0"
                max="1000"
                step="100"
                value={preferences.previewDelay}
                onChange={handlePreviewDelayChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Fast</span>
                <span>{preferences.previewDelay}ms</span>
                <span>Slow</span>
              </div>
            </div>

            {/* Preview Size */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">Preview Size</label>
              <select
                value={preferences.previewSize}
                onChange={handlePreviewSizeChange}
                className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">Theme</label>
              <select
                value={preferences.theme}
                onChange={handleThemeChange}
                className="w-full text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-1"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Feature Toggles */}
            <div className="space-y-2">
              <label className="block text-xs font-medium">Features</label>
              <div className="flex items-center justify-between">
                <span className="text-xs">Reading Time</span>
                <button
                  className={`relative inline-flex items-center h-4 w-8 rounded-full transition-colors ${
                    preferences.enableReadingTime ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => handleFeatureToggle('enableReadingTime')}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      preferences.enableReadingTime ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Social Features</span>
                <button
                  className={`relative inline-flex items-center h-4 w-8 rounded-full transition-colors ${
                    preferences.enableSocialFeatures ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => handleFeatureToggle('enableSocialFeatures')}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      preferences.enableSocialFeatures ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => {
                  window.open(chrome.runtime.getURL('pages/options/index.html'), '_blank');
                }}
              >
                Advanced Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};