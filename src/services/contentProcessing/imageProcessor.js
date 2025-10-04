/**
 * Image Processing Service
 * Handles extraction and processing of images from web pages
 * src/services/contentProcessing/imageProcessor.js
 */
const imageProcessor = {
    /**
     * Extract the most important images from a document
     * Uses heuristics to determine image importance
     * 
     * @param {Document} dom - The parsed DOM document
     * @param {Number} maxImages - Maximum number of images to extract
     * @param {String} baseUrl - Base URL for resolving relative image URLs
     * @return {Array} - Array of image objects with src, alt, dimensions
     */
    extractImportantImages(dom, maxImages = 5, baseUrl = null) {
      if (!dom) {
        console.warn('No DOM provided to extractImportantImages');
        return [];
      }
      
      // List of potential important image selectors in order of priority
      const prioritySelectors = [
        'meta[property="og:image"]',         // Open Graph image
        'meta[name="twitter:image"]',        // Twitter card image
        'meta[property="twitter:image"]',    // Twitter card alternate
        'link[rel="image_src"]',             // Link rel image
        'article img[src]',                  // Images within article tags
        '.post-content img[src]',            // Images in post content
        '.article-content img[src]',         // Images in article content
        'main img[src]',                     // Images in main content
        '.content img[src]',                 // Images in content area
        '.entry-content img[src]'            // Images in entry content
      ];
  
      const images = [];
      const seenUrls = new Set();
  
      // First try the priority selectors
      for (const selector of prioritySelectors) {
        try {
          let elements;
          
          if (selector.startsWith('meta') || selector.startsWith('link')) {
            elements = dom.querySelectorAll(selector);
            for (const element of elements) {
              const src = element.getAttribute('content') || element.getAttribute('href');
              if (src && this.isValidImageUrl(src)) {
                const resolvedUrl = this.resolveImageUrl(src, baseUrl);
                if (resolvedUrl && !seenUrls.has(resolvedUrl)) {
                  seenUrls.add(resolvedUrl);
                  images.push({
                    src: resolvedUrl,
                    alt: element.getAttribute('alt') || '',
                    width: null,
                    height: null,
                    priority: true
                  });
                  
                  if (images.length >= maxImages) {
                    return images;
                  }
                }
              }
            }
          } else {
            elements = dom.querySelectorAll(selector);
            for (const element of elements) {
              const src = element.getAttribute('src') || element.getAttribute('data-src');
              if (src && this.isValidImageUrl(src)) {
                const resolvedUrl = this.resolveImageUrl(src, baseUrl);
                if (resolvedUrl && !seenUrls.has(resolvedUrl)) {
                  seenUrls.add(resolvedUrl);
                  images.push({
                    src: resolvedUrl,
                    alt: element.getAttribute('alt') || '',
                    width: element.getAttribute('width') || null,
                    height: element.getAttribute('height') || null,
                    priority: true
                  });
                  
                  if (images.length >= maxImages) {
                    return images;
                  }
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Error with selector ${selector}:`, error);
        }
      }
  
      // If we still need more images, get all remaining images and sort by presumed importance
      if (images.length < maxImages) {
        const remainingImages = dom.querySelectorAll('img[src], img[data-src]');
        const scoredImages = [];
  
        for (const img of remainingImages) {
          const src = img.getAttribute('src') || img.getAttribute('data-src');
          if (!src || !this.isValidImageUrl(src)) {
            continue;
          }
          
          const resolvedUrl = this.resolveImageUrl(src, baseUrl);
          if (!resolvedUrl || seenUrls.has(resolvedUrl)) {
            continue;
          }
  
          const score = this.calculateImageScore(img);
          if (score > 0) {
            scoredImages.push({
              element: img,
              src: resolvedUrl,
              score
            });
          }
        }
  
        // Sort by score (descending) and add to images array
        scoredImages.sort((a, b) => b.score - a.score);
        for (const { element, src } of scoredImages) {
          if (images.length >= maxImages) break;
          
          seenUrls.add(src);
          images.push({
            src,
            alt: element.getAttribute('alt') || '',
            width: element.getAttribute('width') || null,
            height: element.getAttribute('height') || null,
            priority: false
          });
        }
      }
  
      return images;
    },
  
    /**
     * Extract product images from the DOM
     * Specialized for e-commerce sites
     * 
     * @param {Document} dom - The parsed DOM document
     * @param {String} baseUrl - Base URL for resolving relative URLs
     * @return {Array} - Array of image objects
     */
    extractGalleryImages(dom, baseUrl = null) {
      if (!dom) {
        return [];
      }
      
      // Gallery selectors in order of priority
      const gallerySelectors = [
        '.gallery img',
        '.slider img',
        '.carousel img',
        '.gallery-item img',
        '.slideshow img',
        'figure img'
      ];
  
      const images = [];
      const seenUrls = new Set();
      
      // First look for structured gallery images
      for (const selector of gallerySelectors) {
        try {
          const elements = dom.querySelectorAll(selector);
          for (const element of elements) {
            const src = element.getAttribute('src') || element.getAttribute('data-src');
            if (src && this.isValidImageUrl(src)) {
              const resolvedUrl = this.resolveImageUrl(src, baseUrl);
              if (resolvedUrl && !seenUrls.has(resolvedUrl)) {
                seenUrls.add(resolvedUrl);
                images.push({
                  src: resolvedUrl,
                  alt: element.getAttribute('alt') || '',
                  width: element.getAttribute('width') || null,
                  height: element.getAttribute('height') || null,
                  caption: this.extractCaption(element)
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Error with gallery selector ${selector}:`, error);
        }
      }
  
      return images;
    },
  
    /**
     * Calculate a score for an image based on various heuristics
     * Higher score means more important
     * 
     * @param {Element} img - The image element
     * @return {Number} - The calculated score
     */
    calculateImageScore(img) {
      let score = 0;
      
      try {
        // Images with alt text are more likely to be content images
        if (img.hasAttribute('alt') && img.getAttribute('alt').trim().length > 0) {
          score += 10;
        }
        
        // Images with explicit dimensions are more likely to be content images
        if (img.hasAttribute('width') && img.hasAttribute('height')) {
          const width = parseInt(img.getAttribute('width'), 10);
          const height = parseInt(img.getAttribute('height'), 10);
          
          // Larger images get higher scores
          if (width && height && !isNaN(width) && !isNaN(height)) {
            if (width >= 300 && height >= 200) {
              score += 20;
            } else if (width >= 100 && height >= 100) {
              score += 10;
            } else if (width < 50 || height < 50) {
              score -= 30; // Penalize tiny images
            }
            
            // Reward certain aspect ratios common in content images (between 0.5 and 2.0)
            const ratio = width / height;
            if (ratio >= 0.5 && ratio <= 2.0) {
              score += 10;
            }
          }
        }
        
        // Check if image is in a figure element
        if (img.closest('figure')) {
          score += 15;
        }
        
        // Check if image has a caption
        if (img.nextElementSibling && (
            img.nextElementSibling.tagName === 'FIGCAPTION' || 
            img.nextElementSibling.className.includes('caption'))) {
          score += 15;
        }
        
        // Check if image is in the main content area
        if (img.closest('article') || img.closest('main') || 
            img.closest('.content') || img.closest('.post')) {
          score += 15;
        }
        
        // Penalize images that are clearly icons or common ui elements
        const src = img.getAttribute('src');
        if (src) {
          const srcLower = src.toLowerCase();
          if (srcLower.includes('icon') || srcLower.includes('logo') || 
              srcLower.includes('avatar') || srcLower.includes('button') ||
              srcLower.includes('badge') || srcLower.includes('sprite')) {
            score -= 20;
          }
        }
        
        // Penalize images with loading="lazy" attribute in headers/footers
        if (img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy') {
          if (img.closest('header') || img.closest('footer') || img.closest('nav')) {
            score -= 10;
          }
        }
      } catch (error) {
        console.warn('Error calculating image score:', error);
      }
      
      return score;
    },
  
    /**
     * Extract caption for an image if available
     * 
     * @param {Element} img - The image element
     * @return {String|null} - The extracted caption or null
     */
    extractCaption(img) {
      try {
        // Check for figcaption
        const figure = img.closest('figure');
        if (figure) {
          const figcaption = figure.querySelector('figcaption');
          if (figcaption) {
            return figcaption.textContent.trim();
          }
        }
        
        // Check for caption class
        const parent = img.parentElement;
        if (parent) {
          const captionEl = parent.querySelector('.caption, .wp-caption-text, .image-caption');
          if (captionEl) {
            return captionEl.textContent.trim();
          }
        }
        
        // Check if next sibling is a caption
        const nextSibling = img.nextElementSibling;
        if (nextSibling && (
            nextSibling.className.includes('caption') || 
            nextSibling.tagName === 'FIGCAPTION')) {
          return nextSibling.textContent.trim();
        }
        
        // Use alt text as caption if available and descriptive
        if (img.hasAttribute('alt')) {
          const alt = img.getAttribute('alt').trim();
          if (alt.length > 0 && alt.length < 200) {
            return alt;
          }
        }
      } catch (error) {
        console.warn('Error extracting caption:', error);
      }
      
      return null;
    },
  
    /**
     * Check if a URL is a valid image URL
     * 
     * @param {String} url - The URL to check
     * @return {Boolean} - Whether the URL is a valid image URL
     */
    isValidImageUrl(url) {
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      // Ignore data URLs that are too small (likely placeholders)
      if (url.startsWith('data:')) {
        return url.length > 100; // Allow substantial data URLs
      }
      
      // Block SVG data URLs (potential security risk)
      if (url.startsWith('data:image/svg')) {
        return false;
      }
      
      // Check if URL is relative, if so it's likely valid
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return true;
      }
      
      try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname.toLowerCase();
        
        // Check for common image extensions
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
        const hasExtension = extensions.some(ext => path.endsWith(ext));
        
        // Also accept URLs with image-like patterns or query params
        const hasImagePattern = path.includes('/image') || 
                               path.includes('/img') || 
                               path.includes('/photo') ||
                               parsedUrl.search.includes('image');
        
        return hasExtension || hasImagePattern;
      } catch (error) {
        // If URL parsing fails, check if it looks like a relative path
        return url.includes('.jpg') || url.includes('.png') || 
               url.includes('.gif') || url.includes('.webp');
      }
    },
    
    /**
     * Resolve relative image URL to absolute URL
     * 
     * @param {String} imageUrl - The image URL (possibly relative)
     * @param {String} baseUrl - The base URL to resolve against
     * @return {String|null} - Resolved absolute URL or null if invalid
     */
    resolveImageUrl(imageUrl, baseUrl) {
      if (!imageUrl) {
        return null;
      }
      
      // If already absolute, return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      
      // If data URL, return as is
      if (imageUrl.startsWith('data:')) {
        return imageUrl;
      }
      
      // If no base URL provided, return relative URL
      if (!baseUrl) {
        return imageUrl;
      }
      
      try {
        const base = new URL(baseUrl);
        const resolved = new URL(imageUrl, base.origin);
        return resolved.href;
      } catch (error) {
        console.warn('Error resolving image URL:', error);
        return null;
      }
    }
  };
  
  export { imageProcessor };