/**
 * Service for parsing and manipulating DOM content
 * src/services/contentProcessing/domParser.js
 */
export const domParser = {
    /**
     * Parse HTML string into a DOM Document
     * @param {string} htmlString - The HTML content to parse
     * @returns {Document} - A Document object representing the parsed content
     */
    parseHTML: (htmlString) => {
      if (!htmlString || typeof htmlString !== 'string') {
        throw new Error('Invalid HTML string provided');
      }
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.warn('HTML parsing encountered errors:', parserError.textContent);
      }
      
      return doc;
    },
    
    /**
     * Extract all links from a DOM document
     * @param {Document} doc - The DOM document to extract links from
     * @param {string} baseUrl - The base URL for resolving relative links
     * @returns {Array<{href: string, text: string, isExternal: boolean}>} - Array of link objects
     */
    extractLinks: (doc, baseUrl = null) => {
      if (!doc) {
        throw new Error('No document provided');
      }
      
      const links = Array.from(doc.querySelectorAll('a[href]'));
      let baseHostname = null;
      
      // Parse base URL if provided
      if (baseUrl) {
        try {
          const baseUrlObj = new URL(baseUrl);
          baseHostname = baseUrlObj.hostname;
        } catch (error) {
          console.warn('Invalid base URL provided:', error);
        }
      }
      
      return links.map(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        let isExternal = false;
        
        // Determine if link is external
        if (baseHostname && href) {
          try {
            // Handle relative URLs
            if (href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
              isExternal = false;
            } else if (href.startsWith('http')) {
              const linkUrl = new URL(href);
              isExternal = linkUrl.hostname !== baseHostname;
            }
          } catch (error) {
            // Invalid URL, treat as internal relative link
            isExternal = false;
          }
        }
        
        return { href, text, isExternal };
      }).filter(link => link.href && link.href !== '#');
    },
    
    /**
     * Clean a DOM document by removing scripts, styles, etc.
     * @param {Document} doc - The DOM document to clean
     * @returns {Document} - A cleaned DOM document
     */
    cleanDocument: (doc) => {
      if (!doc) {
        throw new Error('No document provided');
      }
      
      // Create a clone to avoid modifying the original
      const clone = doc.cloneNode(true);
      
      // Remove potentially harmful or unnecessary elements
      const elementsToRemove = [
        'script',
        'style',
        'link[rel="stylesheet"]',
        'iframe',
        'object',
        'embed',
        'noscript',
        'svg[style*="display:none"]'
      ];
      
      elementsToRemove.forEach(selector => {
        const elements = clone.querySelectorAll(selector);
        elements.forEach(el => {
          try {
            el.remove();
          } catch (error) {
            console.warn(`Failed to remove element: ${selector}`, error);
          }
        });
      });
      
      // Remove inline event handlers
      const elementsWithEvents = clone.querySelectorAll('*');
      elementsWithEvents.forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });
      });
      
      // Remove comments
      const removeComments = (node) => {
        const walker = clone.createTreeWalker(
          node, 
          NodeFilter.SHOW_COMMENT,
          null, 
          false
        );
        
        const comments = [];
        let comment;
        while (comment = walker.nextNode()) {
          comments.push(comment);
        }
        
        comments.forEach(comment => {
          try {
            comment.remove();
          } catch (error) {
            console.warn('Failed to remove comment', error);
          }
        });
      };
      
      try {
        removeComments(clone);
      } catch (error) {
        console.warn('Error removing comments:', error);
      }
      
      return clone;
    },
    
    /**
     * Extract the main content area from a document
     * @param {Document} doc - The DOM document
     * @returns {HTMLElement} - The main content element
     */
    extractMainContent: (doc) => {
      if (!doc) {
        throw new Error('No document provided');
      }
      
      // Try to find main content using common selectors
      const contentSelectors = [
        'main',
        'article',
        '[role="main"]',
        '#content',
        '#main-content',
        '.main-content',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.content',
      ];
      
      for (const selector of contentSelectors) {
        try {
          const element = doc.querySelector(selector);
          if (element && element.textContent.trim().length > 100) {
            return element;
          }
        } catch (error) {
          console.warn(`Error with selector ${selector}:`, error);
        }
      }
      
      // Fallback: find the element with the most text
      const elements = Array.from(doc.querySelectorAll('div, section, article'));
      if (elements.length === 0) {
        return doc.body || doc.documentElement;
      }
      
      // Get text length of each element (excluding nested elements)
      const textLengths = elements.map(el => {
        // Get direct text content only
        let directTextLength = 0;
        for (const node of el.childNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            directTextLength += node.textContent.trim().length;
          }
        }
        
        return {
          element: el,
          textLength: el.textContent.trim().length,
          directTextLength,
          paragraphCount: el.querySelectorAll('p').length
        };
      });
      
      // Sort by a combination of text length and paragraph count
      textLengths.sort((a, b) => {
        const scoreA = a.textLength + (a.paragraphCount * 50);
        const scoreB = b.textLength + (b.paragraphCount * 50);
        return scoreB - scoreA;
      });
      
      return textLengths[0].element;
    },
    
    /**
     * Extract meta data from document
     * @param {Document} doc - The DOM document
     * @returns {Object} - Object containing meta data
     */
    extractMetaData: (doc) => {
      if (!doc) {
        throw new Error('No document provided');
      }
      
      const metadata = {};
      
      try {
        // Extract meta tags
        const metaTags = doc.querySelectorAll('meta');
        metaTags.forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        // Extract canonical URL
        const canonical = doc.querySelector('link[rel="canonical"]');
        if (canonical && canonical.getAttribute('href')) {
          metadata.canonicalUrl = canonical.getAttribute('href');
        }
        
        // Extract favicon with proper URL resolution
        const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (favicon && favicon.getAttribute('href')) {
          let faviconUrl = favicon.getAttribute('href');
          
          // Handle relative URLs
          if (faviconUrl.startsWith('/') || faviconUrl.startsWith('./') || faviconUrl.startsWith('../')) {
            const baseUrl = doc.baseURI || doc.URL;
            if (baseUrl) {
              try {
                const base = new URL(baseUrl);
                faviconUrl = new URL(faviconUrl, base.origin).href;
              } catch (error) {
                console.warn('Error resolving favicon URL:', error);
              }
            }
          }
          
          metadata.favicon = faviconUrl;
        }
      } catch (error) {
        console.warn('Error extracting metadata:', error);
      }
      
      return metadata;
    },
    
    /**
     * Extract header information like title, subtitle
     * @param {Document} doc - The DOM document
     * @returns {Object} - Object containing header info
     */
    extractHeaderInfo: (doc) => {
      if (!doc) {
        throw new Error('No document provided');
      }
      
      const headerInfo = {};
      
      try {
        // Extract title
        const titleTag = doc.querySelector('title');
        if (titleTag) {
          headerInfo.title = titleTag.textContent.trim();
        }
        
        // Try to find a better title from h1
        const h1 = doc.querySelector('h1');
        if (h1 && h1.textContent.trim()) {
          headerInfo.heading = h1.textContent.trim();
        }
        
        // Try to find a subtitle
        const subtitleSelectors = [
          'h1 + h2',
          'h1 + .subtitle',
          '.subtitle',
          '.subheading',
          '.post-subtitle',
          '.article-subtitle'
        ];
        
        for (const selector of subtitleSelectors) {
          try {
            const element = doc.querySelector(selector);
            if (element && element.textContent.trim()) {
              headerInfo.subtitle = element.textContent.trim();
              break;
            }
          } catch (error) {
            console.warn(`Error with subtitle selector ${selector}:`, error);
          }
        }
      } catch (error) {
        console.warn('Error extracting header info:', error);
      }
      
      return headerInfo;
    },
    
    /**
     * Create a DOM element from HTML string
     * @param {string} htmlString - HTML string to create element from
     * @returns {HTMLElement} - The created element
     */
    createElement: (htmlString) => {
      if (!htmlString || typeof htmlString !== 'string') {
        throw new Error('Invalid HTML string provided');
      }
      
      const div = document.createElement('div');
      div.innerHTML = htmlString.trim();
      return div.firstElementChild || div.firstChild;
    },
    
    /**
     * Serialize a DOM element back to HTML string
     * @param {HTMLElement} element - Element to serialize
     * @returns {string} - HTML string
     */
    serializeElement: (element) => {
      if (!element) {
        throw new Error('No element provided');
      }
      
      const container = document.createElement('div');
      container.appendChild(element.cloneNode(true));
      return container.innerHTML;
    }
  };