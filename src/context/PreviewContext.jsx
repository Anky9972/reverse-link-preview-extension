import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { usePreferences } from './PreferenceContext';

const initialState = {
  queue: [],
  currentPreview: null,
  loading: false,
  error: null,
  cache: {}
};

function previewReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_QUEUE': {
      // Avoid duplicates in the queue
      if (state.queue.some(item => item.url === action.payload.url)) {
        return state;
      }
      
      // Respect maxQueueSize
      const maxSize = action.payload.maxQueueSize || 3;
      const newQueue = [...state.queue, action.payload];
      
      return {
        ...state,
        queue: newQueue.slice(-maxSize)
      };
    }
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter(item => item.url !== action.payload.url)
      };
    
    case 'SET_CURRENT_PREVIEW':
      return {
        ...state,
        currentPreview: action.payload,
        loading: false,
        error: null
      };
    
    case 'START_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'CLEAR_PREVIEW':
      return {
        ...state,
        currentPreview: null,
        loading: false,
        error: null
      };
    
    case 'CLEAR_ALL':
      return {
        ...initialState,
        cache: state.cache // Preserve cache
      };
    
    case 'UPDATE_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.url]: {
            data: action.payload.data,
            timestamp: Date.now()
          }
        }
      };
    
    case 'CLEAR_CACHE':
      return {
        ...state,
        cache: {}
      };
    
    default:
      return state;
  }
}

export const PreviewContext = createContext();

export const PreviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(previewReducer, initialState);
  const { preferences } = usePreferences();

  // Auto-cleanup old cache entries
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      const cleanedCache = {};
      let hasChanges = false;
      
      for (const [url, entry] of Object.entries(state.cache)) {
        if (now - entry.timestamp < oneHour) {
          cleanedCache[url] = entry;
        } else {
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        dispatch({ type: 'CLEAR_CACHE' });
        // Re-add valid entries
        Object.entries(cleanedCache).forEach(([url, entry]) => {
          dispatch({ 
            type: 'UPDATE_CACHE', 
            payload: { url, data: entry.data } 
          });
        });
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
    
    return () => clearInterval(interval);
  }, [state.cache]);

  // Utility functions for managing previews
  const addToQueue = (previewData) => {
    dispatch({ 
      type: 'ADD_TO_QUEUE', 
      payload: { 
        ...previewData, 
        maxQueueSize: preferences.maxQueueSize 
      } 
    });
  };

  const removeFromQueue = (url) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: { url } });
  };

  const setCurrentPreview = (previewData) => {
    dispatch({ type: 'SET_CURRENT_PREVIEW', payload: previewData });
    
    // Cache the preview data
    if (previewData && previewData.url) {
      dispatch({ 
        type: 'UPDATE_CACHE', 
        payload: { 
          url: previewData.url, 
          data: previewData 
        } 
      });
    }
  };

  const startLoading = () => {
    dispatch({ type: 'START_LOADING' });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearPreview = () => {
    dispatch({ type: 'CLEAR_PREVIEW' });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const getCachedPreview = (url) => {
    const cached = state.cache[url];
    if (!cached) return null;
    
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Return cached data if it's less than 1 hour old
    if (now - cached.timestamp < oneHour) {
      return cached.data;
    }
    
    return null;
  };

  const clearCache = () => {
    dispatch({ type: 'CLEAR_CACHE' });
  };

  return (
    <PreviewContext.Provider
      value={{
        ...state,
        addToQueue,
        removeFromQueue,
        setCurrentPreview,
        startLoading,
        setError,
        clearPreview,
        clearAll,
        getCachedPreview,
        clearCache
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
};

// Custom hook for using the preview context
export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};