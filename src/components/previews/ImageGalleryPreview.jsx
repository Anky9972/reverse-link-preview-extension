import React, { useState } from 'react';

export const ImageGalleryPreview = ({ data, isDetailed }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If data is not loaded yet, show a loading state
  if (!data || !data.images || data.images.length === 0) {
    return (
      <div className="flex flex-col animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Navigate to the next image
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.images.length);
  };

  // Navigate to the previous image
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + data.images.length) % data.images.length);
  };

  // Determine how many thumbnail images to show
  const thumbnailCount = isDetailed ? 5 : 3;

  return (
    <div className="flex flex-col space-y-4">
      {/* Main image display */}
      <div className="relative">
        <img 
          src={typeof data.images[currentIndex] === 'string' ? data.images[currentIndex] : data.images[currentIndex].src || data.images[currentIndex]} 
          alt={`Gallery image ${currentIndex + 1}`} 
          className="w-full h-48 object-cover object-center rounded"
        />
        
        {/* Navigation arrows */}
        <button 
          onClick={handlePrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          aria-label="Previous image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
          aria-label="Next image"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {data.images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {data.images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {data.images.slice(0, thumbnailCount).map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 border-2 rounded ${
                index === currentIndex ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img 
                src={typeof image === 'string' ? image : image.src || image} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover object-center rounded"
              />
            </button>
          ))}
          
          {data.images.length > thumbnailCount && (
            <button 
              className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-500"
              onClick={handleNext}
            >
              +{data.images.length - thumbnailCount}
            </button>
          )}
        </div>
      )}
      
      {/* Description */}
      {data.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {data.description}
        </p>
      )}
      
      {/* Additional info if in detailed mode */}
      {isDetailed && data.imageCount && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Gallery contains {data.imageCount} images
        </div>
      )}
    </div>
  );
};