import React from 'react';

export const SocialPreview = ({ data, isDetailed }) => {
  // If data is not loaded yet, show a loading state
  if (!data) {
    return (
      <div className="flex flex-col animate-pulse space-y-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Format date to be human-readable
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format number with comma separators and abbreviate if large
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    
    return num.toString();
  };

  // Determine interaction stats to display
  const renderInteractions = () => {
    if (!data.interactions) return null;
    
    return (
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        {data.interactions.likes !== undefined && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
            </svg>
            <span>{formatNumber(data.interactions.likes)}</span>
          </div>
        )}
        
        {data.interactions.comments !== undefined && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
            </svg>
            <span>{formatNumber(data.interactions.comments)}</span>
          </div>
        )}
        
        {data.interactions.shares !== undefined && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"></path>
            </svg>
            <span>{formatNumber(data.interactions.shares)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Author information */}
      {data.author && (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            {data.author.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{data.author}</span>
            {data.publishDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(data.publishDate)}
              </span>
            )}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="space-y-2">
        {/* Main image if available */}
        {data.mainImage && (
          <img 
            src={data.mainImage} 
            alt="Social media post" 
            className="w-full h-40 object-cover object-center rounded"
          />
        )}
        
        {/* Post content */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">
          {data.description}
        </p>
      </div>
      
      {/* Social interactions */}
      {renderInteractions()}
      
      {/* Additional info if in detailed mode */}
      {isDetailed && (
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"></path>
            </svg>
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              View original post
            </a>
          </div>
        </div>
      )}
    </div>
  );
};