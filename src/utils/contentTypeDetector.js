/**
 * Utility to detect the content type of a page based on its DOM structure and URL
 * 
 * @file src/utils/contentTypeDetector.js
 * @version 2.0.0
 */

export const contentTypeDetector = {
  /**
   * Detects the content type of a page
   * @param {Document} dom - The parsed DOM of the page
   * @param {string} url - The URL of the page
   * @returns {string} The detected content type: 'article', 'product', 'gallery', 'video', 'social', or 'default'
   */
  detect(dom, url) {
    if (!dom || !url) {
      console.warn('Invalid parameters provided to contentTypeDetector');
      return 'default';
    }

    try {
      // Check URL patterns first
      if (this.isVideoSite(url)) {
        return 'video';
      }
      
      if (this.isSocialSite(url)) {
        return 'social';
      }
      
      if (this.isEcommerceSite(url)) {
        return 'product';
      }
      
      // Check DOM structure and schema
      if (this.hasArticleSchema(dom) || this.hasArticleStructure(dom)) {
        return 'article';
      }
      
      if (this.hasProductSchema(dom) || this.hasProductStructure(dom)) {
        return 'product';
      }
      
      if (this.hasGalleryStructure(dom)) {
        return 'gallery';
      }
      
      if (this.hasVideoStructure(dom)) {
        return 'video';
      }
      
      // Default to article if there's substantial text content
      if (this.hasSubstantialText(dom)) {
        return 'article';
      }
      
      return 'default';
    } catch (error) {
      console.error('Error detecting content type:', error);
      return 'default';
    }
  },
  
  /**
   * Check if the URL belongs to a known video site
   * @param {string} url - The URL to check
   * @returns {boolean} True if it's a video site
   */
  isVideoSite(url) {
    const videoSites = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'dailymotion.com',
      'twitch.tv',
      'ted.com',
      'netflix.com',
      'hulu.com',
      'disneyplus.com',
      'hbomax.com',
      'primevideo.com',
      'video'
    ];
    
    const urlLower = url.toLowerCase();
    return videoSites.some(site => urlLower.includes(site));
  },
  
  /**
   * Check if the URL belongs to a known social media site
   * @param {string} url - The URL to check
   * @returns {boolean} True if it's a social media site
   */
  isSocialSite(url) {
    const socialSites = [
      'twitter.com',
      'x.com',
      'facebook.com',
      'instagram.com',
      'linkedin.com',
      'pinterest.com',
      'reddit.com',
      'tumblr.com',
      'threads.net',
      'tiktok.com',
      'snapchat.com',
      'mastodon'
    ];
    
    const urlLower = url.toLowerCase();
    return socialSites.some(site => urlLower.includes(site));
  },
  
  /**
   * Check if the URL belongs to a known e-commerce site
   * @param {string} url - The URL to check
   * @returns {boolean} True if it's an e-commerce site
   */
  isEcommerceSite(url) {
    const ecommerceSites = [
      'amazon.com',
      'ebay.com',
      'walmart.com',
      'etsy.com',
      'shopify.com',
      'bestbuy.com',
      'target.com',
      'aliexpress.com',
      'newegg.com',
      'wayfair.com',
    ];
    
    const urlLower = url.toLowerCase();
    return ecommerceSites.some(site => urlLower.includes(site)) || 
           urlLower.includes('/product/') || 
           urlLower.includes('/products/') ||
           urlLower.includes('/shop/') ||
           urlLower.includes('/item/');
  },
  
  /**
   * Check if the page has Article schema.org markup
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if article schema found
   */
  hasArticleSchema(dom) {
    const schemas = dom.querySelectorAll('script[type="application/ld+json"]');
    let validSchemas = 0;
    let errorCount = 0;
    
    for (const schema of schemas) {
      try {
        const data = JSON.parse(schema.textContent);
        validSchemas++;
        
        // Check for Article types
        const type = data['@type'];
        if (type === 'Article' || 
            type === 'NewsArticle' || 
            type === 'BlogPosting' ||
            type === 'ScholarlyArticle' ||
            type === 'TechArticle') {
          return true;
        }
        
        // Handle arrays of schemas
        if (Array.isArray(data)) {
          const hasArticle = data.some(item => 
            item['@type'] === 'Article' || 
            item['@type'] === 'NewsArticle' || 
            item['@type'] === 'BlogPosting'
          );
          if (hasArticle) return true;
        }
      } catch (e) {
        errorCount++;
        if (errorCount > 5) {
          console.warn('Multiple JSON-LD parsing errors detected');
          break;
        }
      }
    }
    
    return false;
  },
  
  /**
   * Check if the page has Product schema.org markup
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if product schema found
   */
  hasProductSchema(dom) {
    const schemas = dom.querySelectorAll('script[type="application/ld+json"]');
    let errorCount = 0;
    
    for (const schema of schemas) {
      try {
        const data = JSON.parse(schema.textContent);
        
        // Check for Product types
        const type = data['@type'];
        if (type === 'Product' || type === 'Offer' || type === 'ProductModel') {
          return true;
        }
        
        // Handle arrays of schemas
        if (Array.isArray(data)) {
          const hasProduct = data.some(item => 
            item['@type'] === 'Product' || item['@type'] === 'Offer'
          );
          if (hasProduct) return true;
        }
      } catch (e) {
        errorCount++;
        if (errorCount > 5) break;
      }
    }
    
    return false;
  },
  
  /**
   * Check if the page has typical article structure
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if article structure found
   */
  hasArticleStructure(dom) {
    // Check for article tag
    if (dom.querySelector('article')) {
      return true;
    }
    
    // Check for common article classes
    const articleSelectors = [
      '.article',
      '.post',
      '.blog-post',
      '.news-article',
      '.story',
      '.entry-content',
      'main article',
      '#content article',
      '[role="article"]'
    ];
    
    for (const selector of articleSelectors) {
      try {
        if (dom.querySelector(selector)) {
          return true;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    
    // Check for article meta structure
    const hasAuthor = dom.querySelector('[rel="author"]') || 
                     dom.querySelector('.author') ||
                     dom.querySelector('[itemprop="author"]');
    const hasDate = dom.querySelector('[property="datePublished"]') || 
                   dom.querySelector('.date') ||
                   dom.querySelector('time') ||
                   dom.querySelector('[itemprop="datePublished"]');
    
    if (hasAuthor && hasDate) {
      return true;
    }
    
    return false;
  },
  
  /**
   * Check if the page has typical product structure
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if product structure found
   */
  hasProductStructure(dom) {
    // Check for common product elements
    const productSelectors = [
      '.product',
      '.product-details',
      '.product-info',
      '.product-description',
      '.product-price',
      '.add-to-cart',
      '.buy-now',
      '[itemprop="price"]',
      '[itemprop="offers"]',
      '.price',
      '.cart',
      '#add-to-cart'
    ];
    
    let productElementCount = 0;
    for (const selector of productSelectors) {
      try {
        if (dom.querySelector(selector)) {
          productElementCount++;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    
    // If we have at least 3 product elements, it's likely a product page
    return productElementCount >= 3;
  },
  
  /**
   * Check if the page has a gallery structure
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if gallery structure found
   */
  hasGalleryStructure(dom) {
    // Look for common gallery indicators
    const gallerySelectors = [
      '.gallery',
      '.slideshow',
      '.carousel',
      '.images',
      '.photos',
      '[data-gallery]',
      '.image-gallery',
      '.photo-gallery'
    ];
    
    for (const selector of gallerySelectors) {
      try {
        if (dom.querySelector(selector)) {
          return true;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    
    // Check for multiple images
    const images = dom.querySelectorAll('img');
    if (images.length > 5) {
      // Get only visible, reasonably sized images
      const significantImages = Array.from(images).filter(img => {
        const width = parseInt(img.getAttribute('width') || '0');
        const height = parseInt(img.getAttribute('height') || '0');
        const src = img.getAttribute('src') || '';
        
        // Filter out tracking pixels and icons
        if (src.includes('tracking') || src.includes('pixel') || src.includes('icon')) {
          return false;
        }
        
        return (width > 100 && height > 100) || (!width && !height);
      });
      
      if (significantImages.length > 4) {
        return true;
      }
    }
    
    return false;
  },
  
  /**
   * Check if the page has a video structure
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if video structure found
   */
  hasVideoStructure(dom) {
    // Look for video elements
    if (dom.querySelector('video') || 
        dom.querySelector('iframe[src*="youtube"]') || 
        dom.querySelector('iframe[src*="vimeo"]') ||
        dom.querySelector('iframe[src*="dailymotion"]')) {
      return true;
    }
    
    // Look for common video indicators
    const videoSelectors = [
      '.video',
      '.video-player',
      '.video-container',
      '.player',
      '[data-video]',
      '.video-embed',
      '#video-player'
    ];
    
    for (const selector of videoSelectors) {
      try {
        if (dom.querySelector(selector)) {
          return true;
        }
      } catch (e) {
        console.warn(`Invalid selector: ${selector}`);
      }
    }
    
    return false;
  },
  
  /**
   * Check if the page has substantial text content
   * Optimized to prevent performance issues on large pages
   * @param {Document} dom - The DOM to check
   * @returns {boolean} True if substantial text found
   */
  hasSubstantialText(dom) {
    // Get the main content blocks
    const contentBlocks = dom.querySelectorAll('p, article, .content, #content, main');
    let textLength = 0;
    const maxBlocks = 50; // Limit iteration for performance
    const targetLength = 1000; // Target character count
    
    // Calculate total text length with early exit
    const blocksToCheck = Math.min(contentBlocks.length, maxBlocks);
    for (let i = 0; i < blocksToCheck; i++) {
      const block = contentBlocks[i];
      const text = block.textContent.trim();
      textLength += text.length;
      
      // Early exit if we've found enough text
      if (textLength > targetLength) {
        return true;
      }
    }
    
    // Consider it substantial if there's more than 1000 characters
    return textLength > targetLength;
  },

  /**
   * Get a confidence score for the detected content type
   * @param {Document} dom - The DOM to analyze
   * @param {string} url - The URL of the page
   * @param {string} detectedType - The detected content type
   * @returns {number} Confidence score between 0 and 1
   */
  getConfidence(dom, url, detectedType) {
    let score = 0;
    let checks = 0;

    try {
      switch (detectedType) {
        case 'article':
          if (this.hasArticleSchema(dom)) { score += 0.3; checks++; }
          if (this.hasArticleStructure(dom)) { score += 0.2; checks++; }
          if (this.hasSubstantialText(dom)) { score += 0.1; checks++; }
          break;
        case 'product':
          if (this.hasProductSchema(dom)) { score += 0.3; checks++; }
          if (this.hasProductStructure(dom)) { score += 0.2; checks++; }
          if (this.isEcommerceSite(url)) { score += 0.2; checks++; }
          break;
        case 'video':
          if (this.isVideoSite(url)) { score += 0.3; checks++; }
          if (this.hasVideoStructure(dom)) { score += 0.3; checks++; }
          break;
        case 'social':
          if (this.isSocialSite(url)) { score += 0.5; checks++; }
          break;
        case 'gallery':
          if (this.hasGalleryStructure(dom)) { score += 0.4; checks++; }
          break;
      }

      return checks > 0 ? score : 0.5; // Default confidence
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0.5;
    }
  }
};

export default contentTypeDetector;