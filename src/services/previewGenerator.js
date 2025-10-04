/**
 * Preview Generator Service
 * Handles progressive loading and generation of preview content
 * src/services/previewGenerator.js
 */
class PreviewGenerator {
    constructor() {
      this.cache = new Map();
      this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    /**
     * Generate a preview based on extracted content
     * @param {Object} extractedData - Data extracted from the target URL
     * @returns {Promise<Object>} - Processed preview data
     */
    async generatePreview(extractedData) {
      if (!extractedData || !extractedData.url) {
        throw new Error('Invalid extracted data provided');
      }
      
      try {
        // Check cache first
        const cached = this.getCached(extractedData.url);
        if (cached) {
          console.log('Returning cached preview for:', extractedData.url);
          return cached;
        }
        
        // Start with basic preview (text content)
        const basicPreview = this.generateBasicPreview(extractedData);
        
        // Progressive loading - first return basic text preview
        if (extractedData.onProgressUpdate && typeof extractedData.onProgressUpdate === 'function') {
          setTimeout(() => {
            extractedData.onProgressUpdate({
              status: 'basic',
              preview: basicPreview
            });
          }, 10);
        }
        
        // Then load media content
        const mediaPreview = await this.enhanceWithMedia(basicPreview, extractedData);
        
        if (extractedData.onProgressUpdate && typeof extractedData.onProgressUpdate === 'function') {
          setTimeout(() => {
            extractedData.onProgressUpdate({
              status: 'media',
              preview: mediaPreview
            });
          }, 20);
        }
        
        // Finally, add any additional enrichments
        const fullPreview = await this.addEnrichments(mediaPreview, extractedData);
        
        // Cache the result
        this.setCached(extractedData.url, fullPreview);
        
        return fullPreview;
      } catch (error) {
        console.error('Error generating preview:', error);
        // Return minimal preview on error
        return this.generateFallbackPreview(extractedData);
      }
    }
    
    /**
     * Generate basic preview with text content
     * @param {Object} data - Extracted data
     * @returns {Object} - Basic preview
     */
    generateBasicPreview(data) {
      return {
        url: data.url,
        title: data.title || 'Untitled Page',
        description: data.description || '',
        contentType: data.contentType || 'article',
        domain: this.extractDomain(data.url),
        timestamp: new Date().toISOString(),
        status: 'basic'
      };
    }
    
    /**
     * Enhance preview with media content
     * @param {Object} preview - Basic preview data
     * @param {Object} data - Extracted data
     * @returns {Promise<Object>} - Preview with media
     */
    async enhanceWithMedia(preview, data) {
      const enhanced = { ...preview };
      
      try {
        // Add images if available
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          // Filter out invalid or broken images
          const validImages = data.images.filter(img => 
            img && typeof img === 'string' && 
            (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:'))
          );
          
          if (validImages.length > 0) {
            enhanced.mainImage = data.mainImage || validImages[0];
            enhanced.images = validImages.slice(0, 10); // Limit to 10 images
            enhanced.imageCount = validImages.length;
          }
        }
        
        // Add video data if available
        if (data.contentType === 'video') {
          if (data.thumbnail) {
            enhanced.mainImage = data.thumbnail;
          }
          if (data.embedUrl) {
            enhanced.embedUrl = data.embedUrl;
          }
          if (data.duration) {
            enhanced.duration = data.duration;
          }
        }
        
        enhanced.status = 'media';
      } catch (error) {
        console.error('Error enhancing with media:', error);
      }
      
      return enhanced;
    }
    
    /**
     * Add additional enrichments to the preview
     * @param {Object} preview - Preview with media
     * @param {Object} data - Extracted data
     * @returns {Promise<Object>} - Fully enriched preview
     */
    async addEnrichments(preview, data) {
      const enriched = { ...preview };
      
      try {
        // Add metadata based on content type
        switch (data.contentType) {
          case 'article':
            if (data.author) enriched.author = data.author;
            if (data.publishDate) enriched.publishDate = data.publishDate;
            if (data.readingTime) enriched.readingTime = data.readingTime;
            if (data.wordCount) enriched.wordCount = data.wordCount;
            break;
            
          case 'product':
            if (data.price) enriched.price = data.price;
            if (data.rating) enriched.rating = data.rating;
            if (data.availability) enriched.availability = data.availability;
            if (data.brand) enriched.brand = data.brand;
            break;
            
          case 'social':
            if (data.author) enriched.author = data.author;
            if (data.publishDate) enriched.publishDate = data.publishDate;
            if (data.interactions) enriched.interactions = data.interactions;
            break;
            
          case 'video':
            if (data.views) enriched.views = data.views;
            if (data.uploadDate) enriched.uploadDate = data.uploadDate;
            if (data.channel) enriched.channel = data.channel;
            break;
        }
        
        // Add any schema.org data that might be useful
        if (data.schema && typeof data.schema === 'object') {
          enriched.schema = data.schema;
        }
        
        // Add excerpt if available
        if (data.excerpt && typeof data.excerpt === 'string') {
          enriched.excerpt = data.excerpt;
        }
        
        enriched.status = 'complete';
      } catch (error) {
        console.error('Error adding enrichments:', error);
      }
      
      return enriched;
    }
    
    /**
     * Generate fallback preview when extraction fails
     * @param {Object} data - Original data
     * @returns {Object} - Minimal preview
     */
    generateFallbackPreview(data) {
      return {
        url: data.url || '',
        title: data.title || 'Unable to load preview',
        description: 'Preview could not be generated',
        contentType: 'unknown',
        domain: this.extractDomain(data.url || ''),
        timestamp: new Date().toISOString(),
        status: 'error',
        error: true
      };
    }
    
    /**
     * Extract domain name from URL
     * @param {string} url - URL to process
     * @returns {string} - Domain name
     */
    extractDomain(url) {
      if (!url || typeof url !== 'string') {
        return '';
      }
      
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace(/^www\./, '');
      } catch (error) {
        console.error('Error extracting domain:', error);
        return '';
      }
    }
    
    /**
     * Get cached preview
     * @param {string} url - URL to check
     * @returns {Object|null} - Cached preview or null
     */
    getCached(url) {
      const cached = this.cache.get(url);
      
      if (!cached) {
        return null;
      }
      
      // Check if cache is expired
      if (Date.now() - cached.timestamp > this.cacheTimeout) {
        this.cache.delete(url);
        return null;
      }
      
      return cached.preview;
    }
    
    /**
     * Set cached preview
     * @param {string} url - URL to cache
     * @param {Object} preview - Preview to cache
     */
    setCached(url, preview) {
      // Limit cache size
      if (this.cache.size > 50) {
        // Remove oldest entry
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      this.cache.set(url, {
        preview,
        timestamp: Date.now()
      });
    }
    
    /**
     * Clear cache
     */
    clearCache() {
      this.cache.clear();
    }
    
    /**
     * Clear expired cache entries
     */
    clearExpiredCache() {
      const now = Date.now();
      for (const [url, data] of this.cache.entries()) {
        if (now - data.timestamp > this.cacheTimeout) {
          this.cache.delete(url);
        }
      }
    }
  }
  
  export const previewGenerator = new PreviewGenerator();