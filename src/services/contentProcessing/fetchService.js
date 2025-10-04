/**
 * Service for fetching content from URLs using Chrome extension capabilities
 */
// src/services/contentProcessing/fetchService.js
export const fetchService = {
    /**
     * Fetches the content of a URL 
     * @param {string} url - The URL to fetch content from
     * @returns {Promise<string>} - HTML content of the URL
     */
    fetchContent: async (url) => {
      try {
        // Check if extension context is still valid
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
          throw new Error('Extension context invalidated');
        }

        // Additional context validation - try to ping background script
        try {
          chrome.runtime.getURL('');
          if (!chrome.runtime.sendMessage) {
            throw new Error('Extension context invalidated');
          }
          
          // Ping the background script to ensure it's responsive
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => reject(new Error('Extension context invalidated')), 1000);
            
            chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
              clearTimeout(timeoutId);
              if (chrome.runtime.lastError || !response) {
                reject(new Error('Extension context invalidated'));
              } else {
                resolve(response);
              }
            });
          });
        } catch (e) {
          throw new Error('Extension context invalidated');
        }

        // Send a message to the background script to fetch the URL with retry mechanism
        // This avoids CORS issues that would occur if fetching directly from content script
        // Send a message to the background script with retry mechanism
        let lastError;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`🔄 Fetch attempt ${attempt}/3 for URL:`, url);
            
            const response = await Promise.race([
              new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                  reject(new Error('Request timeout'));
                }, 3000 * attempt);

                chrome.runtime.sendMessage(
                  { action: 'fetchUrl', url },
                  (response) => {
                    clearTimeout(timeoutId);
                    
                    if (chrome.runtime.lastError) {
                      const error = chrome.runtime.lastError.message;
                      if (error.includes('Extension context invalidated') || 
                          error.includes('receiving end does not exist') ||
                          error.includes('message port closed')) {
                        reject(new Error('Extension context invalidated'));
                      } else {
                        reject(new Error(error));
                      }
                    } else if (response && response.error) {
                      reject(new Error(response.error));
                    } else if (response && response.content) {
                      resolve(response);
                    } else {
                      reject(new Error('Invalid response received'));
                    }
                  }
                );
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 5000 * attempt)
              )
            ]);
            
            console.log(`✅ Fetch successful on attempt ${attempt}`);
            return response.content;
            
          } catch (error) {
            lastError = error;
            console.warn(`❌ Fetch attempt ${attempt} failed:`, error.message);
            
            if (attempt < 3) {
              const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
              console.log(`⏳ Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        // All retries failed, handle based on error type
        if (lastError.message.includes('Extension context invalidated') || 
            lastError.message.includes('receiving end does not exist') ||
            lastError.message.includes('message port closed')) {
          console.log('🔄 Extension context invalidated, trying direct fetch fallback...');
          try {
            return await this.fetchFallback(url);
          } catch (fallbackError) {
            throw new Error('Extension was reloaded. Please refresh the page to continue using link previews.');
          }
        }
        
        throw lastError;
      } catch (error) {
        console.error('Error fetching URL content:', error);
        throw new Error(`Failed to fetch content: ${error.message}`);
      }
    },

    /**
     * Fallback fetch method when extension context fails
     */
    fetchFallback: async (url) => {
      console.log('🌐 Attempting direct fetch fallback...');
      
      try {
        const directResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)'
          },
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (directResponse.ok) {
          const content = await directResponse.text();
          console.log('✅ Direct fetch fallback successful');
          return content;
        } else {
          throw new Error(`HTTP ${directResponse.status}`);
        }
      } catch (fetchError) {
        console.warn('❌ Direct fetch failed:', fetchError.message);
        throw new Error(`Fallback fetch failed: ${fetchError.message}`);
      }
    },
    
    /**
     * Fetches an image and returns it as a base64 encoded string
     * @param {string} imageUrl - The URL of the image to fetch
     * @returns {Promise<string>} - Base64 encoded image
     */
    fetchImage: async (imageUrl) => {
      try {
        // Check if extension context is still valid
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
          throw new Error('Extension context invalidated');
        }

        // Additional context validation
        try {
          chrome.runtime.getURL('');
        } catch (e) {
          throw new Error('Extension context invalidated');
        }

        const response = await Promise.race([
          new Promise((resolve, reject) => {
            try {
              chrome.runtime.sendMessage(
                { action: 'fetchImage', url: imageUrl },
                (response) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else if (response && response.error) {
                    reject(new Error(response.error));
                  } else {
                    resolve(response);
                  }
                }
              );
            } catch (contextError) {
              reject(new Error('Extension context invalidated'));
            }
          }),
          // Timeout after 8 seconds for images
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Image request timeout')), 8000)
          )
        ]);
  
        return response.base64;
      } catch (error) {
        console.error('Error fetching image:', error);
        
        // If extension context is invalidated, return null gracefully
        if (error.message.includes('Extension context invalidated')) {
          console.warn('Extension context invalidated, image fetching unavailable');
        }
        
        return null;
      }
    },
    
    /**
     * Checks if a URL is accessible without redirects or errors
     * @param {string} url - The URL to check
     * @returns {Promise<boolean>} - Whether the URL is valid and accessible
     */
    validateUrl: async (url) => {
      try {
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { action: 'validateUrl', url },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(response);
              }
            }
          );
        });
        
        return response.valid;
      } catch (error) {
        console.error('Error validating URL:', error);
        return false;
      }
    }
  };
  
  /**
   * Helper function to fetch URL content via an iframe
   * @param {string} url - The URL to fetch
   * @returns {Promise<string>} - HTML content
   */
  const fetchViaIframe = (url) => {
    return new Promise((resolve, reject) => {
      let iframe = null;
      let timeoutId = null;
      let isResolved = false;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (iframe && iframe.parentNode) {
          try {
            iframe.parentNode.removeChild(iframe);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
      };

      const resolveOnce = (value) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve(value);
        }
      };

      const rejectOnce = (error) => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      };

      try {
        // Create hidden iframe with secure sandbox
        iframe = document.createElement('iframe');
        iframe.style.cssText = 'display:none;position:absolute;left:-9999px;width:1px;height:1px;';
        // Use only allow-same-origin for safe document access, remove allow-scripts to prevent sandbox escape
        iframe.sandbox = 'allow-same-origin';
        
        // Set timeout to prevent hanging
        timeoutId = setTimeout(() => {
          rejectOnce(new Error('Iframe load timed out after 3 seconds'));
        }, 3000); // Shorter timeout
        
        // Listen for load event
        iframe.onload = () => {
          try {
            // Small delay to ensure content is fully loaded
            setTimeout(() => {
              try {
                // Try to access the iframe content
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (!iframeDoc) {
                  rejectOnce(new Error('Could not access iframe document'));
                  return;
                }
                
                const content = iframeDoc.documentElement?.outerHTML;
                if (!content || content.trim().length === 0) {
                  rejectOnce(new Error('Iframe content is empty'));
                  return;
                }
                
                resolveOnce(content);
              } catch (accessError) {
                rejectOnce(new Error('Cross-origin restrictions prevented access to iframe content'));
              }
            }, 100);
          } catch (error) {
            rejectOnce(new Error(`Iframe processing error: ${error.message}`));
          }
        };
        
        // Listen for error event
        iframe.onerror = (event) => {
          rejectOnce(new Error(`Failed to load iframe: ${event.message || 'Unknown error'}`));
        };

        // Ensure document.body exists
        if (!document.body) {
          rejectOnce(new Error('Document body not available'));
          return;
        }

        // Set the src after setting up event listeners
        document.body.appendChild(iframe);
        iframe.src = url;
        
      } catch (error) {
        rejectOnce(new Error(`Iframe setup failed: ${error.message}`));
      }
    });
  };