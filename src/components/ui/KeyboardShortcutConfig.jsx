import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferenceContext';

export const KeyboardShortcutConfig = () => {
  const { preferences, updatePreferences } = usePreferences();
  const [recording, setRecording] = useState(false);
  const [currentShortcut, setCurrentShortcut] = useState(null);
  const [conflicts, setConflicts] = useState({});

  // List of all configurable shortcuts
  const shortcuts = [
    { id: 'detailedPreview', name: 'Detailed Preview', description: 'Hold to show detailed preview' },
    { id: 'manualTrigger', name: 'Manual Trigger', description: 'Manually trigger preview for selected link' }
  ];

  // Start recording a new shortcut
  const startRecording = (shortcutId) => {
    setRecording(true);
    setCurrentShortcut(shortcutId);
  };

  // Stop recording and cancel changes
  const cancelRecording = () => {
    setRecording(false);
    setCurrentShortcut(null);
  };

  // Check for shortcut conflicts
  const checkConflicts = (key, shortcutId) => {
    const newConflicts = {};
    Object.entries(preferences.keyboardShortcuts).forEach(([id, shortcut]) => {
      if (id !== shortcutId && shortcut === key) {
        newConflicts[id] = true;
      }
    });
    return newConflicts;
  };

  // Handle key press during recording
  const handleKeyDown = (e) => {
    if (!recording || !currentShortcut) return;

    e.preventDefault();
    
    // Get key name (ignore modifier keys when pressed alone)
    let key = e.key.toLowerCase();
    if (["shift", "control", "alt", "meta"].includes(key)) {
      return;
    }

    // Check for conflicts
    const newConflicts = checkConflicts(key, currentShortcut);
    setConflicts(newConflicts);

    // Update preferences with new shortcut
    const updatedShortcuts = {
      ...preferences.keyboardShortcuts,
      [currentShortcut]: key
    };

    updatePreferences({ keyboardShortcuts: updatedShortcuts });
    setRecording(false);
    setCurrentShortcut(null);
  };

  // Reset a shortcut to default
  const resetShortcut = (shortcutId) => {
    const defaultShortcuts = {
      detailedPreview: 'shift',
      manualTrigger: 'd'
    };

    const updatedShortcuts = {
      ...preferences.keyboardShortcuts,
      [shortcutId]: defaultShortcuts[shortcutId]
    };

    updatePreferences({ keyboardShortcuts: updatedShortcuts });
  };

  // Reset all shortcuts to defaults
  const resetAllShortcuts = () => {
    const defaultShortcuts = {
      detailedPreview: 'shift',
      manualTrigger: 'd'
    };

    updatePreferences({ keyboardShortcuts: defaultShortcuts });
    setConflicts({});
  };

  // Render keyboard shortcut configuration UI
  return (
    <div 
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <h3 className="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
      
      <div className="space-y-4">
        {shortcuts.map((shortcut) => (
          <div 
            key={shortcut.id} 
            className={`p-3 rounded-md border ${
              conflicts[shortcut.id] 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">{shortcut.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{shortcut.description}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                {recording && currentShortcut === shortcut.id ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-500 animate-pulse">Press any key...</span>
                    <button 
                      onClick={cancelRecording}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm">
                      {preferences.keyboardShortcuts[shortcut.id] || 'None'}
                    </kbd>
                    <button 
                      onClick={() => startRecording(shortcut.id)}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Change
                    </button>
                    <button 
                      onClick={() => resetShortcut(shortcut.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {conflicts[shortcut.id] && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                This shortcut conflicts with another setting. Please choose a different key.
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={resetAllShortcuts}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Reset All Shortcuts
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Conflict Detection</h4>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          The extension will automatically detect conflicts with browser shortcuts. 
          If a shortcut doesn't work, it might be reserved by the browser or other extensions.
        </p>
      </div>
    </div>
  );
};