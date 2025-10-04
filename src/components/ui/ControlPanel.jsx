import React, { useState } from 'react';
import { SettingsFoldout } from './SettingsFoldout';
import { usePreferences } from '../../context/PreferenceContext';
import { citationGenerator } from '../../utils/citationGenerator';
import { 
  Copy, 
  CopyCheckIcon, 
  Bookmark, 
  Share2, 
  Settings, 
  Clock, 
  Tag, 
  DollarSign 
} from 'lucide-react';

export const ControlPanel = ({ preview, isDetailed }) => {
  const { preferences } = usePreferences();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCitationCopied, setIsCitationCopied] = useState(false);

  // No preview data, show minimal controls
  if (!preview) {
    return (
      <div className="flex items-center justify-end">
        <button 
          className="p-2 text-black hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
        </button>
      </div>
    );
  }

  // Calculate reading time if applicable
  const showReadingTime = preferences.enableReadingTime && 
    preview.contentType === 'article' &&
    preview.readingTime;

  // Generate citation for the link
  const handleCopyCitation = () => {
    const citation = citationGenerator.generate(preview);
    navigator.clipboard.writeText(citation)
      .then(() => {
        setIsCitationCopied(true);
        setTimeout(() => setIsCitationCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy citation:', err));
  };

  // Handle bookmark action
  const handleBookmark = () => {
    chrome.runtime.sendMessage({
      action: 'addBookmark',
      data: {
        url: preview.url,
        title: preview.title,
        description: preview.description,
        timestamp: new Date().toISOString()
      }
    });
  };

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: preview.title,
        text: preview.description,
        url: preview.url
      });
    } else {
      navigator.clipboard.writeText(preview.url)
        .then(() => {
          console.log('URL copied to clipboard');
        });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Main controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
        {/* Left side - info badges */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {showReadingTime && (
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 mr-1.5 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {preview.readingTime} min
              </span>
            </div>
          )}
          
          {preview.contentType === 'product' && preview.price && (
            <div className="flex items-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-semibold">
              <DollarSign className="w-3 h-3 mr-1.5" />
              {preview.price}
            </div>
          )}
          
          {preview.contentType && (
            <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium capitalize">
              <Tag className="w-3 h-3 mr-1.5" />
              {preview.contentType}
            </div>
          )}
        </div>
        
        {/* Right side - action buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Citation button */}
          <button 
            className="p-2 text-gray-500 bg-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation relative group"
            onClick={handleCopyCitation}
            aria-label="Copy citation"
          >
            <Copy className="w-4 h-4" />
            {isCitationCopied && (
              <CopyCheckIcon className="w-4 h-4 text-green-500 absolute -top-2 -right-2 bg-white rounded-full p-0.5 animate-bounce" />
            )}
          </button>
          
          {/* Bookmark button */}
          <button 
            className="p-2 text-gray-500 bg-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation relative group"
            onClick={handleBookmark}
            aria-label="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          
          {/* Share button */}
          <button 
            className="p-2 text-gray-500 bg-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation relative group"
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          {/* Settings button */}
          <button 
            className="p-2 text-gray-500 bg-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation relative group"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Settings foldout */}
      {isSettingsOpen && (
        <SettingsFoldout 
          preview={preview}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};
