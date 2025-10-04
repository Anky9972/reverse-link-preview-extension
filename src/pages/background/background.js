// Background service worker for Reverse Link Preview extension
const chrome = self.chrome;

// Import shared URL validator
// Note: In manifest v3, you'll need to configure this properly
// For now, we'll duplicate the validation logic
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // Block localhost and local IPs for security
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

// Track whether content script has been injected for each tab
const tabsWithContentScript = new Set();

// Listen for installation and set up context menu
chrome.runtime.onInstalled.addListener(() => {
  console.log('Reverse Link Preview extension installed');
  
  // Clear storage on installation/update to prevent quota issues
  chrome.storage.local.clear(() => {
    console.log('🗑️ Cleared local storage on extension install/update');
  });
  
  // Create context menu item
  chrome.contextMenus.create({
    id: 'reversePreview',
    title: 'Show Reverse Link Preview',
    contexts: ['link']
  });

  // Set default preferences if not already set
  chrome.storage.sync.get('userPreferences', (result) => {
    if (!result.userPreferences) {
      const defaultPreferences = {
        previewDelay: 300,
        previewSize: 'medium',
        enableReadingTime: true,
        enableSocialFeatures: true,
        maxQueueSize: 3,
        siteSpecificSettings: {},
        theme: 'system',
        keyboardShortcuts: {
          detailedPreview: 'shift',
          manualTrigger: 'd'
        },
        customization: {
          backgroundColor: '#ffffff',
          textColor: '#333333',
          accentColor: '#3b82f6',
          borderRadius: '8px',
          opacity: 0.95
        }
      };
      
      chrome.storage.sync.set({ userPreferences: defaultPreferences });
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'reversePreview' && tab && tab.id) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (linkUrl) => {
        document.dispatchEvent(new CustomEvent('rlp-manual-preview', {
          detail: {
            url: linkUrl,
            position: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2
            }
          }
        }));
      },
      args: [info.linkUrl]
    }).catch(error => {
      console.error('Error executing script for manual preview:', error);
    });
  }
});

// Function to inject content script with proper tracking
function injectContentScript(tabId) {
  return new Promise((resolve, reject) => {
    // Check if already injected
    if (tabsWithContentScript.has(tabId)) {
      resolve();
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).then(() => {
      tabsWithContentScript.add(tabId);
      console.log(`Content script injected into tab ${tabId}`);
      resolve();
    }).catch(error => {
      console.error('Error injecting content script:', error);
      reject(error);
    });
  });
}

// Enhanced storage quota management
const clearStorageQuotaIfNeeded = async () => {
  try {
    const usage = await new Promise((resolve, reject) => {
      chrome.storage.local.getBytesInUse(null, (bytes) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(bytes);
        }
      });
    });
    
    const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB default
    const usagePercent = (usage / quota) * 100;
    
    console.log(`📊 Storage usage: ${usage} bytes (${usagePercent.toFixed(1)}% of quota)`);
    
    // More aggressive clearing at different thresholds
    if (usage > quota * 0.95) { // 95% - emergency clear everything
      console.log('🚨 Emergency storage clear - quota nearly full');
      await new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    } else if (usage > quota * 0.8) { // 80% - clear cache and analytics
      console.log('🗑️ Storage quota exceeded 80%, clearing cache and analytics');
      await new Promise((resolve) => {
        chrome.storage.local.remove(['previewCache', 'analytics'], () => resolve());
      });
    } else if (usage > quota * 0.6) { // 60% - clear old cache entries only
      console.log('🧹 Storage quota exceeded 60%, clearing old cache');
      await clearOldCacheEntries();
    }
    
  } catch (error) {
    console.error('Error checking storage quota:', error);
    // If we can't check quota, clear everything to be safe
    try {
      console.log('🚨 Storage error - clearing all data as safety measure');
      await new Promise((resolve) => {
        chrome.storage.local.clear(() => resolve());
      });
    } catch (clearError) {
      console.error('Error clearing storage:', clearError);
    }
  }
};

// Clear old cache entries (older than 1 hour)
const clearOldCacheEntries = async () => {
  try {
    const result = await new Promise((resolve) => {
      chrome.storage.local.get('previewCache', resolve);
    });
    
    if (result.previewCache) {
      const cache = result.previewCache;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      // Remove entries older than 1 hour
      for (const [url, data] of Object.entries(cache)) {
        if (data.timestamp && data.timestamp < oneHourAgo) {
          delete cache[url];
        }
      }
      
      // Save cleaned cache
      await new Promise((resolve) => {
        chrome.storage.local.set({ previewCache: cache }, resolve);
      });
    }
  } catch (error) {
    console.error('Error clearing old cache entries:', error);
  }
};

// Rate limiting for fetch requests
const fetchRateLimiter = {
  requests: new Map(),
  maxRequestsPerMinute: 30,
  
  canMakeRequest(url) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old entries
    for (const [key, timestamp] of this.requests.entries()) {
      if (timestamp < oneMinuteAgo) {
        this.requests.delete(key);
      }
    }
    
    // Count recent requests
    const recentRequests = Array.from(this.requests.values())
      .filter(timestamp => timestamp > oneMinuteAgo);
    
    if (recentRequests.length >= this.maxRequestsPerMinute) {
      return false;
    }
    
    this.requests.set(url + now, now);
    return true;
  }
};

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Track content script presence
  if (sender.tab && sender.tab.id) {
    tabsWithContentScript.add(sender.tab.id);
  }
  
  // Handle ping requests
  if (request.action === 'ping') {
    sendResponse({ status: 'ok', timestamp: Date.now() });
    return false;
  }
  
  // Handle fetch requests from content script (to bypass CORS)
  if (request.action === 'fetchUrl') {
    // Clear storage if needed (don't await to avoid blocking)
    clearStorageQuotaIfNeeded().catch(console.error);
    
    // Validate URL
    if (!isValidUrl(request.url)) {
      sendResponse({ error: 'Invalid URL' });
      return false;
    }
    
    // Check rate limit
    if (!fetchRateLimiter.canMakeRequest(request.url)) {
      sendResponse({ error: 'Rate limit exceeded. Please try again later.' });
      return false;
    }
    
    // Fetch content directly (caching disabled to prevent quota issues)
    console.log('🌐 Fetching content for:', request.url);
    
    fetch(request.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ReverseLinkPreview/1.0)'
      },
      signal: AbortSignal.timeout(15000) // 15 second timeout
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        console.log('✅ Content fetched successfully, size:', text.length);
        sendResponse({ content: text, cached: false });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // Keep the messaging channel open for async response
  }
  
  // Handle analytics logging
  if (request.action === 'logAnalytics') {
    const now = new Date().toISOString();
    
    chrome.storage.local.get('analytics', (result) => {
      const analytics = result.analytics || {
        previewCount: 0,
        sitesVisited: {},
        contentTypes: {},
        lastUsed: now
      };
      
      // Update analytics data
      analytics.previewCount++;
      analytics.lastUsed = now;
      
      // Track site
      try {
        const hostname = new URL(request.url).hostname;
        analytics.sitesVisited[hostname] = (analytics.sitesVisited[hostname] || 0) + 1;
      } catch (e) {
        console.error('Invalid URL for analytics:', request.url);
      }
      
      // Track content type
      if (request.contentType) {
        analytics.contentTypes[request.contentType] = 
          (analytics.contentTypes[request.contentType] || 0) + 1;
      }
      
      // Store updated analytics
      chrome.storage.local.set({ analytics });
    });
    
    sendResponse({ success: true });
    return false;
  }

  // Handle contentScriptNeeded messages 
  if (request.action === 'contentScriptNeeded' && sender.tab && sender.tab.id) {
    injectContentScript(sender.tab.id)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  // Content script ready notification
  if (request.action === 'contentScriptReady' && sender.tab && sender.tab.id) {
    tabsWithContentScript.add(sender.tab.id);
    sendResponse({ success: true });
    return false;
  }
  
  return false;
});

// Handle tab removal to clean up our tracking
chrome.tabs.onRemoved.addListener((tabId) => {
  tabsWithContentScript.delete(tabId);
});

// Handle tab updates - only inject on user-initiated navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && 
      tab.url && 
      (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
    
    // Don't auto-inject, wait for user interaction
    // Content script will be injected when needed
  }
});
  
// Set up alarms for regular maintenance tasks
chrome.alarms.create('maintenance', { periodInMinutes: 60 });
chrome.alarms.create('storageCleanup', { periodInMinutes: 10 }); // More frequent storage cleanup

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'storageCleanup') {
    console.log('⏰ Running scheduled storage cleanup');
    clearStorageQuotaIfNeeded().catch(console.error);
  } else if (alarm.name === 'maintenance') {
    console.log('⏰ Running scheduled maintenance');
    clearStorageQuotaIfNeeded().catch(console.error);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'maintenance') {
    // Clean up cache
    chrome.storage.local.get('previewCache', (result) => {
      const cache = result.previewCache || {};
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      let cleaned = 0;
      for (const url in cache) {
        if (cache[url].timestamp < now - oneDay) {
          delete cache[url];
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        chrome.storage.local.set({ previewCache: cache });
        console.log(`Cleaned ${cleaned} cached entries`);
      }
    });
    
    // Clean up old analytics (keep last 30 days)
    chrome.storage.local.get('analytics', (result) => {
      if (result.analytics) {
        const analytics = result.analytics;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        if (new Date(analytics.lastUsed) < thirtyDaysAgo) {
          // Reset analytics if not used in 30 days
          chrome.storage.local.set({
            analytics: {
              previewCount: 0,
              sitesVisited: {},
              contentTypes: {},
              lastUsed: new Date().toISOString()
            }
          });
        }
      }
    });
  }
});

// Service worker keep-alive
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
});

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});