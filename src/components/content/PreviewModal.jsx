import React, { useMemo, useEffect, useRef } from 'react';
import { usePreferences } from '../../context/PreferenceContext';
import { ArticlePreview } from '../previews/ArticlePreview';
import { ImageGalleryPreview } from '../previews/ImageGalleryPreview';
import { ProductPreview } from '../previews/ProductPreview';
import { VideoPreview } from '../previews/VideoPreview';
import { SocialPreview } from '../previews/SocialPreview';
import { ControlPanel } from '../ui/ControlPanel';
import { X, Eye, MessageCircle, Clock, Bookmark, Share2, Copy } from 'lucide-react';

export const PreviewModal = ({ preview, loading, isVisible, isDetailedMode, onClose }) => {
  const { preferences } = usePreferences();
  const modalRef = useRef(null);

  // Detect system theme
  const effectiveTheme = useMemo(() => {
    if (preferences.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preferences.theme;
  }, [preferences.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (preferences.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      modalRef.current?.classList.toggle('dark-mode', mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preferences.theme]);

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && modalRef.current) {
      const previouslyFocused = document.activeElement;
      modalRef.current.focus();

      return () => {
        if (previouslyFocused instanceof HTMLElement) {
          previouslyFocused.focus();
        }
      };
    }
  }, [isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  // Render preview content based on type
  const renderPreviewContent = () => {
    if (loading) {
      return (
        <div className="animate-fadeIn" role="status" aria-live="polite" aria-label="Loading preview">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-5 sm:w-5 md:h-4 md:w-4 border-t-2 border-b-2 border-blue-500"></div>
              <div className="h-4 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-32 sm:w-36 md:w-40 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full animate-pulse"></div>
              <div className="h-4 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-11/12 animate-pulse"></div>
              <div className="h-4 sm:h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-5/6 animate-pulse"></div>
            </div>
            <div className="h-40 sm:h-32 md:h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20 sm:w-24 animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16 sm:w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    }

    if (!preview) {
      return null;
    }

    switch (preview.contentType) {
      case 'error':
        return (
          <div className="flex flex-col items-center space-y-3 sm:space-y-4 p-4 sm:p-6 text-center" role="alert">
            <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-base sm:text-sm text-gray-900 dark:text-gray-100">{preview.title}</h3>
              <p className="text-sm sm:text-xs text-gray-600 dark:text-gray-400 mt-2 sm:mt-1">{preview.description}</p>
              {preview.title === 'Extension Reloaded' && (
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-3 sm:mt-2 px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
                  aria-label="Refresh the current page"
                >
                  Refresh Page
                </button>
              )}
            </div>
          </div>
        );
      case 'article':
        return <ArticlePreview data={preview} isDetailed={isDetailedMode} />;
      case 'gallery':
        return <ImageGalleryPreview data={preview} isDetailed={isDetailedMode} />;
      case 'product':
        return <ProductPreview data={preview} isDetailed={isDetailedMode} />;
      case 'video':
        return <VideoPreview data={preview} isDetailed={isDetailedMode} />;
      case 'social':
        return <SocialPreview data={preview} isDetailed={isDetailedMode} />;
      default:
        return <ArticlePreview data={preview} isDetailed={isDetailedMode} />;
    }
  };

  // Memoize modal classes
  const modalClasses = useMemo(() => {
    const { previewSize } = preferences;
    
    const sizeClasses = {
      small: 'w-[min(750px,90vw)] h-[min(550px,80vh)]',
      medium: 'w-[min(900px,92vw)] h-[min(650px,85vh)]',
      large: 'w-[min(1050px,95vw)] h-[min(750px,90vh)]',
    };
    
    const themeClasses = {
      light: 'bg-white text-gray-900',
      dark: 'bg-gray-800 text-white',
    };
    
    return `
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
      ${sizeClasses[previewSize] || sizeClasses.medium}
      ${themeClasses[effectiveTheme] || themeClasses.light}
      transform transition-all duration-200 ease-out
      shadow-2xl border-2 border-black dark:border-gray-600
      overflow-hidden flex flex-col
    `.trim().replace(/\s+/g, ' ');
  }, [preferences.previewSize, effectiveTheme, isVisible]);

  // Memoize custom styles
  const customStyles = useMemo(() => {
    const { customization } = preferences;
    
    return {
      backgroundColor: customization.backgroundColor,
      color: customization.textColor,
      borderRadius: customization.borderRadius,
      opacity: customization.opacity,
    };
  }, [preferences.customization]);

  // Format number for display (e.g., 12.5K)
  const formatNumber = (num) => {
    if (!num) return null;
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div 
      ref={modalRef}
      className={`${modalClasses} animate-scaleIn preview-modal`}
      style={customStyles}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
      aria-describedby="preview-content"
      tabIndex={-1}
      data-preview-modal="true"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with site info and close button */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black dark:border-black bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {preview?.favicon && (
              <img 
                src={preview.favicon} 
                alt="" 
                className="w-5 h-5 rounded"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span className="font-bold text-lg text-gray-900 dark:text-white">
              {preview?.url ? new URL(preview.url).hostname.replace('www.', '').toUpperCase() : 'PREVIEW'}
            </span>
          </div>
          <div className="text-sm flex items-center font-bold gap-2 text-red-500 ">
            <span>{preview?.publishDate ? new Date(preview.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="text-xs capitalize" style={{ marginLeft: '4px',  }}>{preview?.contentType || preview?.type || 'Unknown'}</span>
          </div>
        </div>
        <button 
          className="text-black hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 p-2 rounded transition-all"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Main content area with two-column layout */}
      <div className="flex flex-row flex-1 overflow-hidden min-h-0">
        {/* Left content area - takes remaining space */}
        <div className="flex-1 min-w-0 p-6 overflow-y-auto modal-content-scroll">
          <div id="preview-content">
            {renderPreviewContent()}
          </div>
        </div>
        
        {/* Right sidebar with article info - fixed width */}
        <div className="w-64 flex-shrink-0 border-l-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex flex-col overflow-y-auto modal-content-scroll">
          <div className="p-4 flex-1 flex flex-col">
            <div className="mb-4">
              
              <div className="space-y-4">
                {/* Dynamic article metadata */}
                {(preview?.views || preview?.comments) && (
                  <div className="space-y-3">
                    {preview.views && (
                      <div className="flex items-center space-x-2">
                        <Eye size={18} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatNumber(preview.views)}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">views</span>
                      </div>
                    )}
                    {preview.comments && (
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={18} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {preview.comments}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">comments</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Read full story button */}
                <a 
                  href={preview?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{backgroundColor:'black', padding:'10px', borderRadius:'6px', color:'white', fontWeight:'bold', textDecoration:'none'}}
                  className="block w-full bg-black  py-2.5 text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-center tracking-wider mt-4"
                >
                  READ FULL STORY
                </a>
              </div>
            </div>
          </div>
          
          {/* Control Panel at bottom of sidebar */}
          {preview && !loading && (
            <div className="border-t-2 border-black dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
              <ControlPanel preview={preview} isDetailed={isDetailedMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};