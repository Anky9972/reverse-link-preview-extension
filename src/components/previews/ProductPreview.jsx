import React from 'react';

export const ProductPreview = ({ data, isDetailed }) => {
  // If data is not loaded yet, show a loading state
  if (!data) {
    return (
      <div className="flex flex-col animate-pulse space-y-3 sm:space-y-4">
        <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
        <div className="h-28 sm:h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
        <div className="flex justify-between items-center">
          <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
          <div className="h-4 sm:h-5 bg-gradient-to-r from-green-200 to-green-300 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  // Format price if available
  const formattedPrice = data.price ? new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Default to USD
  }).format(parseFloat(data.price)) : null;

  // Determine availability status
  const getAvailabilityDisplay = () => {
    if (!data.availability) return null;
    
    const availability = data.availability.toLowerCase();
    
    if (availability.includes('in stock') || availability.includes('instock')) {
      return (
        <span className="text-green-600 text-xs">In Stock</span>
      );
    } else if (availability.includes('out of stock') || availability.includes('outofstock')) {
      return (
        <span className="text-red-600 text-xs">Out of Stock</span>
      );
    } else {
      return (
        <span className="text-gray-600 text-xs">{data.availability}</span>
      );
    }
  };

  // Render star rating if available
  const renderRating = () => {
    if (!data.rating) return null;
    
    const rating = parseFloat(data.rating);
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <span key={i}>
              {i < fullStars ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : i === fullStars && hasHalfStar ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <defs>
                    <linearGradient id="half-star-gradient" x1="0" x2="100%" y1="0" y2="0">
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#D1D5DB" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#half-star-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </span>
          ))}
        </div>
        <span className="ml-1 text-xs text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Product title */}
      <h2 className="text-lg font-semibold">{data.title}</h2>
      
      {/* Main product image */}
      {data.mainImage && (
        <div className="w-full h-40 overflow-hidden rounded">
          <img 
            src={data.mainImage} 
            alt={data.title}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Price, rating and availability */}
      <div className="flex flex-wrap items-center justify-between">
        {formattedPrice && (
          <div className="text-lg font-bold text-blue-600">
            {formattedPrice}
          </div>
        )}
        
        <div className="flex flex-col items-end">
          {renderRating()}
          {getAvailabilityDisplay()}
        </div>
      </div>
      
      {/* Description */}
      {data.description && (
        <p className="text-sm text-gray-700 line-clamp-2">
          {data.description}
        </p>
      )}
      
      {/* Additional information for detailed mode */}
      {isDetailed && data.images && data.images.length > 1 && (
        <div className="border-t border-gray-200 pt-2 mt-2">
          <p className="text-xs text-gray-500 mb-1">More images:</p>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {data.images.slice(1, 5).map((img, index) => (
              <img 
                key={index}
                src={typeof img === 'string' ? img : img.src || img} 
                alt={`${data.title} - image ${index + 2}`}
                className="w-16 h-16 object-contain rounded flex-shrink-0 bg-gray-50"
                loading="lazy"
              />
            ))}
            {data.images.length > 5 && (
              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-gray-500">+{data.images.length - 5}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};