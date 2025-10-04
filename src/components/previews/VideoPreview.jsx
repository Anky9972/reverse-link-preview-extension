import React, { useState } from 'react';

export const VideoPreview = ({ data, isDetailed }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // If data is not loaded yet, show a loading state
  if (!data) {
    return (
      <div className="flex flex-col animate-pulse space-y-3 sm:space-y-4">
        <div className="aspect-video bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-gray-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Format duration (if available)
  const formatDuration = (duration) => {
    if (!duration) return '';
    
    // Handle ISO 8601 duration format
    if (duration.includes('PT')) {
      const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      if (matches) {
        const hours = matches[1] ? parseInt(matches[1], 10) : 0;
        const minutes = matches[2] ? parseInt(matches[2], 10) : 0;
        const seconds = matches[3] ? parseInt(matches[3], 10) : 0;
        
        if (hours > 0) {
          return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      }
    }
    
    // Return as is if it's already formatted
    return duration;
  };

  // Format view count
  const formatViews = (views) => {
    if (!views) return '';
    
    const num = typeof views === 'string' ? parseInt(views.replace(/,/g, ''), 10) : views;
    
    if (isNaN(num)) return views;
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    
    return `${num.toLocaleString()} views`;
  };

  // Format upload date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      return dateString;
    }
  };

  // Handle play button click
  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col space-y-3 sm:space-y-4 group">
      {/* Video Player / Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg hover:shadow-2xl transition-all duration-300">
        {isPlaying && data.embedUrl ? (
          <iframe
            src={data.embedUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={data.title}
          />
        ) : (
          <>
            {/* Thumbnail Image */}
            {data.thumbnail && (
              <img
                src={data.thumbnail}
                alt={data.title}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                } group-hover:scale-105`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
            )}
            
            {/* Play Button Overlay */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-all duration-300 group/play"
              aria-label="Play video"
            >
              <div className="relative">
                {/* Pulse animation ring */}
                <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600/30 animate-ping"></div>
                
                {/* Play button */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center shadow-2xl transform group-hover/play:scale-110 transition-all duration-300">
                  <svg 
                    className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
            
            {/* Duration Badge */}
            {data.duration && (
              <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold px-2 py-1 rounded">
                {formatDuration(data.duration)}
              </div>
            )}
            
            {/* Quality Badge (if HD/4K available) */}
            {data.quality && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                {data.quality}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Video Information */}
      <div className="flex flex-col space-y-2 sm:space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-base sm:text-lg leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {data.title}
        </h3>
        
        {/* Channel Info (if available) */}
        {data.channel && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            {data.channelAvatar ? (
              <img
                src={data.channelAvatar}
                alt={data.channel}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {data.channel.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                {data.channel}
              </span>
              {data.channelSubscribers && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatViews(data.channelSubscribers).replace('views', 'subscribers')}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {/* Views */}
          {data.views && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{formatViews(data.views)}</span>
            </div>
          )}
          
          {/* Upload Date */}
          {data.uploadDate && data.views && (
            <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
          )}
          
          {data.uploadDate && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(data.uploadDate)}</span>
            </div>
          )}
          
          {/* Likes (if available) */}
          {data.likes && (
            <>
              <span className="hidden sm:inline text-gray-400 dark:text-gray-500">•</span>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>{formatViews(data.likes).replace('views', 'likes')}</span>
              </div>
            </>
          )}
        </div>
        
        {/* Description (Detailed Mode) */}
        {isDetailed && data.description && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 sm:line-clamp-4 leading-relaxed">
              {data.description}
            </p>
          </div>
        )}
        
        {/* Tags (Detailed Mode) */}
        {isDetailed && data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {data.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {data.tags.length > 5 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{data.tags.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};