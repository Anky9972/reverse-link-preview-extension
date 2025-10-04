/**
 * Readability service for extracting and cleaning article content
 * Uses a simplified version of Mozilla's Readability algorithm
 * src/services/contentProcessing/readabilityService.js
 */
export const readabilityService = {
    /**
     * Parse an article DOM to extract clean content
     * @param {Document} dom - The document or document fragment to parse
     * @returns {Object} - Article data with content, text, title, etc.
     */
    parseArticle(dom) {
      if (!dom) {
        throw new Error('No DOM provided to parseArticle');
      }
  
      try {
        // Try to find the main content container
        const article = this.findMainContent(dom);
        
        // Clean up the article content
        const cleanedArticle = this.cleanContent(article || dom.body || dom.documentElement);
        
        // Extract text content
        const textContent = this.extractText(cleanedArticle);
        
        // Get title from document or first heading
        const title = this.extractTitle(dom);
        
        // Calculate reading time
        const readingTime = this.calculateReadingTime(textContent);
        
        return {
          title,
          content: cleanedArticle,
          textContent,
          excerpt: this.generateExcerpt(textContent),
          readingTime,
          wordCount: this.countWords(textContent)
        };
      } catch (error) {
        console.error('Error parsing article:', error);
        return {
          title: 'Untitled Article',
          content: null,
          textContent: '',
          excerpt: '',
          readingTime: 0,
          wordCount: 0
        };
      }
    },
  
    /**
     * Find the main content container in the document
     * @param {Document} dom - The document to search
     * @returns {Element|null} - The main content element or null if not found
     */
    findMainContent(dom) {
      // Common main content selectors
      const contentSelectors = [
        'article',
        '[role="main"]',
        'main',
        '.main-content',
        '.post-content',
        '.article-content',
        '.entry-content',
        '.article-body',
        '#main-content',
        '.content',
        '#main'
      ];
  
      // Try each selector
      for (const selector of contentSelectors) {
        try {
          const element = dom.querySelector(selector);
          if (element && element.textContent.trim().length > 100) {
            return element;
          }
        } catch (error) {
          console.warn(`Error with selector ${selector}:`, error);
        }
      }
  
      // Fall back to scoring elements
      return this.findContentByScoring(dom);
    },
  
    /**
     * Find content by scoring elements based on content characteristics
     * @param {Document} dom - The document to search
     * @returns {Element|null} - The highest scored element or null
     */
    findContentByScoring(dom) {
      const candidates = [];
      
      try {
        const elements = dom.querySelectorAll('div, section, main, article');
  
        elements.forEach(element => {
          // Skip tiny elements or those with certain classes/IDs
          if (this.shouldSkipElement(element)) {
            return;
          }
  
          const textLength = element.textContent.trim().length;
          const paragraphCount = element.querySelectorAll('p').length;
          const imageCount = element.querySelectorAll('img').length;
          const linkDensity = this.calculateLinkDensity(element);
          
          // Score based on content indicators
          let score = 0;
          
          // Text length is a strong indicator (normalized)
          score += Math.min(textLength * 0.1, 1000);
          
          // Paragraphs are good indicators
          score += paragraphCount * 25;
          
          // Images add some value
          score += Math.min(imageCount * 10, 50);
          
          // Penalize high link density (likely navigation)
          if (linkDensity > 0.5) {
            score -= 100;
          }
          
          // Penalize for common non-content indicators
          if (element.querySelector('nav, header, footer, aside, .sidebar, .menu')) {
            score -= 50;
          }
          
          // Bonus for semantic article elements
          if (element.tagName === 'ARTICLE') {
            score += 50;
          }
          
          // Add to candidates if score is positive
          if (score > 0) {
            candidates.push({ element, score });
          }
        });
      } catch (error) {
        console.error('Error scoring elements:', error);
      }
  
      // Sort by score and return the highest
      candidates.sort((a, b) => b.score - a.score);
      return candidates.length > 0 ? candidates[0].element : null;
    },
  
    /**
     * Calculate link density of an element
     * @param {Element} element - The element to check
     * @returns {number} - Link density (0-1)
     */
    calculateLinkDensity(element) {
      try {
        const textLength = element.textContent.trim().length;
        if (textLength === 0) return 0;
        
        const links = element.querySelectorAll('a');
        let linkTextLength = 0;
        
        links.forEach(link => {
          linkTextLength += link.textContent.trim().length;
        });
        
        return linkTextLength / textLength;
      } catch (error) {
        return 0;
      }
    },
  
    /**
     * Check if an element should be skipped for content extraction
     * @param {Element} element - The element to check
     * @returns {boolean} - True if element should be skipped
     */
    shouldSkipElement(element) {
      try {
        // Skip tiny elements
        if (element.textContent.trim().length < 100) {
          return true;
        }
        
        // Skip elements with certain classes or IDs
        const elementText = (element.className || '') + ' ' + (element.id || '');
        const skipPatterns = [
          'comment', 'sidebar', 'menu', 'nav', 'footer', 'header',
          'ad', 'ads', 'advertisement', 'widget', 'share', 'social',
          'related', 'promo', 'banner', 'popup', 'modal'
        ];
        
        const lowerText = elementText.toLowerCase();
        for (const pattern of skipPatterns) {
          if (lowerText.includes(pattern)) {
            return true;
          }
        }
      } catch (error) {
        console.warn('Error checking skip element:', error);
      }
      
      return false;
    },
  
    /**
     * Clean content by removing unwanted elements
     * @param {Element} element - The element to clean
     * @returns {Element} - The cleaned element
     */
    cleanContent(element) {
      if (!element) {
        return element;
      }
      
      // Create a clone to avoid modifying the original
      const cleanedElement = element.cloneNode(true);
      
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'form', 'iframe', 'nav', 'object', 'embed',
        '.comment', '.comments', '.comment-section',
        '.ad', '.ads', '.advertisement', '.adsbygoogle',
        '.share', '.social', '.social-share',
        '.related', '.related-posts', '.recommended',
        'aside', '.sidebar', '.widget', '.promo',
        '.newsletter', '.subscription', '.popup', '.modal'
      ];
      
      unwantedSelectors.forEach(selector => {
        try {
          const elements = cleanedElement.querySelectorAll(selector);
          elements.forEach(el => {
            try {
              el.remove();
            } catch (e) {
              console.warn(`Failed to remove ${selector}:`, e);
            }
          });
        } catch (error) {
          console.warn(`Error with selector ${selector}:`, error);
        }
      });
      
      // Remove empty paragraphs and divs
      try {
        const emptyElements = cleanedElement.querySelectorAll('p, div, span');
        emptyElements.forEach(el => {
          if (el.textContent.trim().length === 0 && !el.querySelector('img, video, audio')) {
            try {
              el.remove();
            } catch (e) {
              // Ignore
            }
          }
        });
      } catch (error) {
        console.warn('Error removing empty elements:', error);
      }
      
      return cleanedElement;
    },
  
    /**
     * Extract text content from an element
     * @param {Element} element - The element to extract text from
     * @returns {string} - The extracted text
     */
    extractText(element) {
      if (!element) {
        return '';
      }
      
      try {
        // Get text nodes from content elements
        const textElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre');
        let text = '';
        
        textElements.forEach(el => {
          const elementText = el.textContent.trim();
          if (elementText.length > 0) {
            text += elementText + ' ';
          }
        });
        
        // Clean up whitespace
        return text.replace(/\s+/g, ' ').trim();
      } catch (error) {
        console.error('Error extracting text:', error);
        return '';
      }
    },
  
    /**
     * Extract title from the document
     * @param {Document} dom - The document to extract from
     * @returns {string} - The extracted title
     */
    extractTitle(dom) {
      try {
        // Try meta tags first (Open Graph)
        const ogTitle = dom.querySelector('meta[property="og:title"]');
        if (ogTitle && ogTitle.getAttribute('content')) {
          return ogTitle.getAttribute('content').trim();
        }
        
        // Try Twitter card
        const twitterTitle = dom.querySelector('meta[name="twitter:title"]');
        if (twitterTitle && twitterTitle.getAttribute('content')) {
          return twitterTitle.getAttribute('content').trim();
        }
        
        // Then title tag
        const titleTag = dom.querySelector('title');
        if (titleTag && titleTag.textContent) {
          // Clean up title (remove site name if present)
          let title = titleTag.textContent.trim();
          // Remove common separators and site names
          title = title.split(/[|\-–—»]/)[0].trim();
          if (title.length > 0) {
            return title;
          }
        }
        
        // Then first heading
        const firstH1 = dom.querySelector('h1');
        if (firstH1 && firstH1.textContent) {
          return firstH1.textContent.trim();
        }
      } catch (error) {
        console.error('Error extracting title:', error);
      }
      
      return 'Untitled Article';
    },
  
    /**
     * Generate a short excerpt from text
     * @param {string} text - The text to excerpt
     * @param {number} length - Max length of excerpt
     * @returns {string} - The excerpt
     */
    generateExcerpt(text, length = 150) {
      if (!text || text.length === 0) {
        return '';
      }
      
      if (text.length <= length) {
        return text;
      }
      
      // Try to find a sentence break
      const truncated = text.substr(0, length);
      const sentenceBreak = truncated.lastIndexOf('.');
      
      if (sentenceBreak > length * 0.5) {
        return truncated.substr(0, sentenceBreak + 1);
      }
      
      // Fall back to word break
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 0) {
        return truncated.substr(0, lastSpace) + '...';
      }
      
      return truncated + '...';
    },
    
    /**
     * Calculate reading time based on word count
     * @param {string} text - The text to analyze
     * @param {number} wordsPerMinute - Average reading speed (default 200)
     * @returns {number} - Reading time in minutes
     */
    calculateReadingTime(text, wordsPerMinute = 200) {
      const wordCount = this.countWords(text);
      return Math.ceil(wordCount / wordsPerMinute);
    },
    
    /**
     * Count words in text
     * @param {string} text - The text to count
     * @returns {number} - Word count
     */
    countWords(text) {
      if (!text || typeof text !== 'string') {
        return 0;
      }
      
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      return words.length;
    }
  };