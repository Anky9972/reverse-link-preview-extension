import React, { useState } from 'react';
import { readingTimeEstimator } from '../../utils/readingTimeEstimator';
import { usePreferences } from '../../context/PreferenceContext';

export const ArticlePreview = ({ data, isDetailed }) => {
  const { preferences } = usePreferences();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Debug logging to understand what data is received
  console.log('🎨 ArticlePreview: Received data:', data);
  console.log('🎨 ArticlePreview: isDetailed:', isDetailed);

  // Loading state with improved skeleton
  if (!data) {
    return (
      <article className="article-preview loading">
        <div className="space-y-3">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" style={{ width: '80%', height: '24px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse" style={{ width: '60%', height: '16px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
        </div>
        <div style={{ aspectRatio: '16/9', backgroundColor: '#e5e7eb', borderRadius: '12px', marginTop: '12px' }}></div>
        <div className="space-y-2">
          <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
          <div style={{ width: '83%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}></div>
        </div>
      </article>
    );
  }

  const showReadingTime = preferences.enableReadingTime && data.readingTime;

  return (
    <article className="space-y-4">
      {/* Category tag */}
      {data.category && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs font-bold text-red-600 bg-transparent uppercase tracking-wide">
            {data.category || 'POLITICS'}
          </span>
        </div>
      )}

      {/* Main headline - clean and bold */}
      <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white mb-3">
        {data.title}
      </h1>
      
      {/* Publication info - compact */}
      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span>
          {data.publishDate 
            ? new Date(data.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        
        {showReadingTime && data.readingTime && (
          <>
            <span>•</span>
            <span>{data.readingTime} min read</span>
          </>
        )}
      </div>
      
      {/* Article excerpt - clean paragraph style */}
      <div className="space-y-3">
        {data.description && (
          <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
            {data.description}
          </p>
        )}
        
        {data.excerpt && data.excerpt !== data.description && (
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {data.excerpt}
          </p>
        )}
      </div>
      
      {/* Detailed mode information */}
      {isDetailed && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
          {/* Article statistics */}
          <div className="grid grid-cols-2 gap-4">
            {data.wordCount && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>{data.wordCount.toLocaleString()} words</span>
              </div>
            )}
            
            {/* Additional images gallery */}
            {data.images && data.images.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">{data.images.length} images in article</span>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {data.images.slice(1, 5).map((img, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square group/img overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                    >
                      <img 
                        src={typeof img === 'string' ? img : img.src || img} 
                        alt={`${data.title} - image ${index + 2}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110"
                        loading="lazy"
                        onError={(e) => e.target.parentElement.classList.add('hidden')}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ))}
                  {data.images.length > 5 && (
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        +{data.images.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};