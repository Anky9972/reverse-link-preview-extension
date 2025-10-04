import React, { useState } from 'react';
import { usePreferences } from '../../context/PreferenceContext';

export const CustomizationStudio = ({ onClose }) => {
  const { preferences, updatePreferences } = usePreferences();
  const [tempCustomization, setTempCustomization] = useState({...preferences.customization});
  
  // Handle color or style change
  const handleChange = (property, value) => {
    setTempCustomization(prev => ({
      ...prev,
      [property]: value
    }));
  };
  
  // Apply changes to preferences
  const applyChanges = () => {
    updatePreferences({
      customization: tempCustomization
    });
    if (onClose) onClose();
  };
  
  // Reset to defaults
  const resetToDefaults = () => {
    const defaultCustomization = {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#3b82f6',
      borderRadius: '8px',
      opacity: 0.95
    };
    
    setTempCustomization(defaultCustomization);
  };
  
  // Cancel changes
  const cancelChanges = () => {
    if (onClose) onClose();
  };
  
  // Preview function to show what the styles will look like
  const PreviewBox = () => (
    <div 
      className="border rounded p-4 mb-6 shadow"
      style={{
        backgroundColor: tempCustomization.backgroundColor,
        color: tempCustomization.textColor,
        borderRadius: tempCustomization.borderRadius,
        opacity: tempCustomization.opacity,
        borderColor: tempCustomization.accentColor
      }}
    >
      <h3 className="text-base font-medium mb-2" style={{ color: tempCustomization.accentColor }}>
        Preview Example
      </h3>
      <p className="text-sm mb-2">
        This is how your link previews will appear with the current customization settings.
      </p>
      <div className="text-xs" style={{ color: tempCustomization.accentColor }}>
        Sample Link URL
      </div>
    </div>
  );
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Customize Preview Appearance</h2>
      
      <PreviewBox />
      
      <div className="space-y-4">
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium mb-1">Background Color</label>
          <div className="flex items-center">
            <input
              type="color"
              value={tempCustomization.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-10 h-10 rounded mr-2"
            />
            <input
              type="text"
              value={tempCustomization.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </div>
        </div>
        
        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium mb-1">Text Color</label>
          <div className="flex items-center">
            <input
              type="color"
              value={tempCustomization.textColor}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="w-10 h-10 rounded mr-2"
            />
            <input
              type="text"
              value={tempCustomization.textColor}
              onChange={(e) => handleChange('textColor', e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </div>
        </div>
        
        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium mb-1">Accent Color</label>
          <div className="flex items-center">
            <input
              type="color"
              value={tempCustomization.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="w-10 h-10 rounded mr-2"
            />
            <input
              type="text"
              value={tempCustomization.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </div>
        </div>
        
        {/* Border Radius */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Border Radius: {tempCustomization.borderRadius}
          </label>
          <input
            type="range"
            min="0"
            max="24"
            value={parseInt(tempCustomization.borderRadius) || 0}
            onChange={(e) => handleChange('borderRadius', `${e.target.value}px`)}
            className="w-full"
          />
        </div>
        
        {/* Opacity */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Opacity: {Math.round(tempCustomization.opacity * 100)}%
          </label>
          <input
            type="range"
            min="50"
            max="100"
            value={Math.round(tempCustomization.opacity * 100)}
            onChange={(e) => handleChange('opacity', e.target.value / 100)}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100"
        >
          Reset to Default
        </button>
        
        <div>
          {onClose && (
            <button
              onClick={cancelChanges}
              className="px-4 py-2 text-sm border rounded mr-2 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            onClick={applyChanges}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {onClose ? 'Apply Changes' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};