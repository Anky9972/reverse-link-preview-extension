import React, { forwardRef, useImperativeHandle } from 'react';
import { fetchService } from '../../services/contentProcessing/fetchService';
import { domParser } from '../../services/contentProcessing/domParser';
import { textSummarizer } from '../../services/contentProcessing/textSummarizer';
import { imageProcessor } from '../../services/contentProcessing/imageProcessor';
import { readabilityService } from '../../services/contentProcessing/readabilityService';
import { schemaDetector } from '../../services/schemaDetector';
import { contentTypeDetector } from '../../utils/contentTypeDetector';
import { readingTimeEstimator } from '../../utils/readingTimeEstimator';

export const ContentExtractor = forwardRef(({ onExtracted }, ref) => {
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    extract: async (url, text, linkElement) => {
      try {
        console.log('🔗 ContentExtractor: Starting extraction for URL:', url);
        
        // Fetch content from the URL
        const content = await fetchService.fetchContent(url);
        
        if (!content || content.trim().length === 0) {
          throw new Error('Empty content received from URL');
        }
        
        console.log('✅ ContentExtractor: Content fetched successfully, length:', content.length);
        
        // Parse the DOM
        const parsedDom = domParser.parseHTML(content);
        
        if (!parsedDom) {
          throw new Error('Failed to parse HTML content');
        }
        
        console.log('✅ ContentExtractor: DOM parsed successfully');
        
        // Detect content type
        const contentType = contentTypeDetector.detect(parsedDom, url);
        console.log('📄 ContentExtractor: Content type detected:', contentType);
        
        // Extract schema.org markup if available
        const schema = schemaDetector.extractSchema(parsedDom);
        console.log('🔍 ContentExtractor: Schema detected:', schema ? 'Yes' : 'No');
        
        // Initialize preview data
        let previewData = {
          url,
          contentType,
          title: text || extractTitle(parsedDom),
          sourceUrl: url,
          timestamp: new Date().toISOString(),
        };
        
        console.log('📝 ContentExtractor: Initial preview data:', previewData);
        
        // Process content based on type
        switch (contentType) {
          case 'article':
            previewData = processArticle(parsedDom, previewData);
            break;
          case 'product':
            previewData = processProduct(parsedDom, previewData, schema);
            break;
          case 'gallery':
            previewData = processGallery(parsedDom, previewData);
            break;
          case 'video':
            previewData = processVideo(parsedDom, previewData, schema);
            break;
          case 'social':
            previewData = processSocial(parsedDom, previewData, schema);
            break;
          default:
            previewData = processDefault(parsedDom, previewData);
        }
        
        // Send extracted data to parent component
        onExtracted(previewData);
      } catch (error) {
        console.error('Error extracting content:', error);
        
        // Provide user-friendly error messages based on error type
        let userMessage = 'Unable to load preview for this link.';
        let title = text || 'Preview unavailable';
        let actionable = false;
        
        if (error.message.includes('Extension context invalidated') || 
            error.message.includes('Extension was reloaded')) {
          title = 'Extension Reloaded';
          userMessage = 'The extension was updated or reloaded. Please refresh this page to continue using link previews.';
          actionable = true;
        } else if (error.message.includes('Mixed content blocked')) {
          title = 'Security Blocked';
          userMessage = 'Cannot load HTTP content from HTTPS page due to browser security policies.';
        } else if (error.message.includes('CORS') || 
                   error.message.includes('Failed to fetch')) {
          userMessage = 'This website blocks external preview requests for security reasons.';
        } else if (error.message.includes('timeout') || 
                   error.message.includes('Request timeout')) {
          userMessage = 'Preview request timed out. The website may be slow to respond.';
        } else if (error.message.includes('Network error') || 
                   error.message.includes('net::')) {
          userMessage = 'Network connection issue. Please check your internet connection.';
        } else if (error.message.includes('404') || 
                   error.message.includes('Not Found')) {
          userMessage = 'The requested page could not be found.';
        } else if (error.message.includes('403') || 
                   error.message.includes('Forbidden')) {
          userMessage = 'Access to this content is restricted or forbidden.';
        } else if (error.message.includes('500') || 
                   error.message.includes('Server Error')) {
          userMessage = 'The server encountered an error. Please try again later.';
        }
        
        onExtracted({
          url,
          contentType: 'error',
          title,
          description: userMessage,
          error: error.message
        });
      }
    }
  }));

  // Extract title from the DOM
  const extractTitle = (dom) => {
    const ogTitle = dom.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.getAttribute('content')) {
      return ogTitle.getAttribute('content');
    }
    
    const title = dom.querySelector('title');
    if (title && title.textContent) {
      return title.textContent.trim();
    }
    
    return 'Untitled Page';
  };

  // Process article content
  const processArticle = (dom, previewData) => {
    // Use readability to clean up the content
    const article = readabilityService.parseArticle(dom);
    
    // Extract important images
    const images = imageProcessor.extractImportantImages(dom);
    
    // Generate summary
    const fullText = article.textContent;
    const summary = textSummarizer.summarize(fullText);
    
    // Estimate reading time
    const readingTimeData = readingTimeEstimator.estimate(fullText);
    
    return {
      ...previewData,
      description: summary,
      mainImage: images.length > 0 ? images[0] : null,
      images: images,
      author: extractAuthor(dom),
      publishDate: extractPublishDate(dom),
      readingTime: readingTimeData.minutes, // Just the minutes value
      wordCount: fullText.split(/\s+/).length,
    };
  };

  // Process product content
  const processProduct = (dom, previewData, schema) => {
    // Extract product information
    let price = null;
    let rating = null;
    let availability = null;
    
    if (schema && schema['@type'] === 'Product') {
      price = schema.offers?.price;
      rating = schema.aggregateRating?.ratingValue;
      availability = schema.offers?.availability;
    } else {
      // Fallback to DOM parsing
      price = extractPrice(dom);
      rating = extractRating(dom);
      availability = extractAvailability(dom);
    }
    
    // Extract product images
    const images = imageProcessor.extractProductImages(dom);
    
    return {
      ...previewData,
      price,
      rating,
      availability,
      images,
      mainImage: images.length > 0 ? images[0] : null,
      description: extractDescription(dom),
    };
  };

// Process gallery content
const processGallery = (dom, previewData) => {
    // Extract gallery images
    const images = imageProcessor.extractGalleryImages(dom);
    
    return {
      ...previewData,
      images,
      mainImage: images.length > 0 ? images[0] : null,
      description: extractDescription(dom),
      imageCount: images.length,
    };
  };

  // Process video content
  const processVideo = (dom, previewData, schema) => {
    // Extract video information
    let thumbnail = null;
    let duration = null;
    let embedUrl = null;
    
    if (schema && (schema['@type'] === 'VideoObject' || schema['@type'] === 'Movie')) {
      thumbnail = schema.thumbnailUrl;
      duration = schema.duration;
      embedUrl = schema.embedUrl;
    } else {
      // Fallback to DOM parsing
      thumbnail = extractVideoThumbnail(dom);
      duration = extractVideoDuration(dom);
      embedUrl = extractVideoEmbedUrl(dom, previewData.url);
    }
    
    return {
      ...previewData,
      thumbnail,
      duration,
      embedUrl,
      mainImage: thumbnail,
      description: extractDescription(dom),
    };
  };

  // Process social media content
  const processSocial = (dom, previewData, schema) => {
    // Extract social media information
    const author = extractAuthor(dom);
    const publishDate = extractPublishDate(dom);
    const interactions = extractSocialInteractions(dom);
    const images = imageProcessor.extractImportantImages(dom);
    
    return {
      ...previewData,
      author,
      publishDate,
      interactions,
      images,
      mainImage: images.length > 0 ? images[0] : null,
      description: extractDescription(dom),
    };
  };

  // Process default content
  const processDefault = (dom, previewData) => {
    // Extract basic information
    const description = extractDescription(dom);
    const images = imageProcessor.extractImportantImages(dom);
    
    return {
      ...previewData,
      description,
      images,
      mainImage: images.length > 0 ? images[0] : null,
    };
  };

  // Helper functions for content extraction
  const extractDescription = (dom) => {
    // Try to extract description from meta tags
    const metaDescription = dom.querySelector('meta[name="description"]');
    if (metaDescription && metaDescription.getAttribute('content')) {
      return metaDescription.getAttribute('content');
    }
    
    const ogDescription = dom.querySelector('meta[property="og:description"]');
    if (ogDescription && ogDescription.getAttribute('content')) {
      return ogDescription.getAttribute('content');
    }
    
    // Fallback to first paragraph
    const firstParagraph = dom.querySelector('p');
    if (firstParagraph && firstParagraph.textContent) {
      return firstParagraph.textContent.trim();
    }
    
    return 'No description available';
  };

  const extractAuthor = (dom) => {
    // Try to extract author from meta tags
    const metaAuthor = dom.querySelector('meta[name="author"]');
    if (metaAuthor && metaAuthor.getAttribute('content')) {
      return metaAuthor.getAttribute('content');
    }
    
    // Try schema.org markup
    const schemaAuthor = dom.querySelector('[itemprop="author"]');
    if (schemaAuthor) {
      const authorName = schemaAuthor.querySelector('[itemprop="name"]');
      if (authorName && authorName.textContent) {
        return authorName.textContent.trim();
      }
      return schemaAuthor.textContent.trim();
    }
    
    return null;
  };

  const extractPublishDate = (dom) => {
    // Try to extract date from meta tags
    const metaDate = dom.querySelector('meta[property="article:published_time"]');
    if (metaDate && metaDate.getAttribute('content')) {
      return metaDate.getAttribute('content');
    }
    
    // Try schema.org markup
    const schemaDate = dom.querySelector('[itemprop="datePublished"]');
    if (schemaDate && schemaDate.getAttribute('content')) {
      return schemaDate.getAttribute('content');
    }
    
    return null;
  };

  const extractPrice = (dom) => {
    // Try schema.org markup
    const schemaPrice = dom.querySelector('[itemprop="price"]');
    if (schemaPrice && schemaPrice.getAttribute('content')) {
      return schemaPrice.getAttribute('content');
    }
    
    // Try common price selectors
    const priceSelectors = [
      '.price',
      '.product-price',
      '.offer-price',
      '.regular-price',
      '.current-price'
    ];
    
    for (const selector of priceSelectors) {
      const priceElement = dom.querySelector(selector);
      if (priceElement && priceElement.textContent) {
        // Clean up the price text
        const priceText = priceElement.textContent.trim().replace(/[^\d.,]/g, '');
        if (priceText) {
          return priceText;
        }
      }
    }
    
    return null;
  };

  const extractRating = (dom) => {
    // Try schema.org markup
    const schemaRating = dom.querySelector('[itemprop="ratingValue"]');
    if (schemaRating && schemaRating.getAttribute('content')) {
      return schemaRating.getAttribute('content');
    }
    
    // Try common rating selectors
    const ratingSelectors = [
      '.rating',
      '.product-rating',
      '.review-rating',
      '.stars'
    ];
    
    for (const selector of ratingSelectors) {
      const ratingElement = dom.querySelector(selector);
      if (ratingElement && ratingElement.textContent) {
        // Try to extract a number from the rating text
        const match = ratingElement.textContent.match(/(\d+(\.\d+)?)/);
        if (match) {
          return match[1];
        }
      }
    }
    
    return null;
  };

  const extractAvailability = (dom) => {
    // Try schema.org markup
    const schemaAvailability = dom.querySelector('[itemprop="availability"]');
    if (schemaAvailability && schemaAvailability.getAttribute('content')) {
      return schemaAvailability.getAttribute('content');
    }
    
    // Try common availability selectors
    const availabilitySelectors = [
      '.availability',
      '.stock-status',
      '.in-stock',
      '.out-of-stock'
    ];
    
    for (const selector of availabilitySelectors) {
      const availabilityElement = dom.querySelector(selector);
      if (availabilityElement && availabilityElement.textContent) {
        return availabilityElement.textContent.trim();
      }
    }
    
    return null;
  };

  const extractVideoThumbnail = (dom) => {
    // Try Open Graph
    const ogImage = dom.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.getAttribute('content')) {
      return ogImage.getAttribute('content');
    }
    
    // Try Twitter card
    const twitterImage = dom.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.getAttribute('content')) {
      return twitterImage.getAttribute('content');
    }
    
    // Try to find video poster
    const videoPoster = dom.querySelector('video[poster]');
    if (videoPoster && videoPoster.getAttribute('poster')) {
      return videoPoster.getAttribute('poster');
    }
    
    return null;
  };

  const extractVideoDuration = (dom) => {
    // Try schema.org markup
    const schemaDuration = dom.querySelector('[itemprop="duration"]');
    if (schemaDuration && schemaDuration.getAttribute('content')) {
      return schemaDuration.getAttribute('content');
    }
    
    // Look for time element
    const timeElement = dom.querySelector('time');
    if (timeElement && timeElement.textContent) {
      return timeElement.textContent.trim();
    }
    
    return null;
  };

  const extractVideoEmbedUrl = (dom, sourceUrl) => {
    // Try to find embed URL from Open Graph
    const ogVideo = dom.querySelector('meta[property="og:video"]');
    if (ogVideo && ogVideo.getAttribute('content')) {
      return ogVideo.getAttribute('content');
    }
    
    // Try to find iframe with embed
    const iframe = dom.querySelector('iframe[src*="youtube"], iframe[src*="vimeo"], iframe[src*="dailymotion"]');
    if (iframe && iframe.getAttribute('src')) {
      return iframe.getAttribute('src');
    }
    
    // Try to generate embed URL based on source URL
    if (sourceUrl.includes('youtube.com') || sourceUrl.includes('youtu.be')) {
      // Extract YouTube video ID
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = sourceUrl.match(youtubeRegex);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    } else if (sourceUrl.includes('vimeo.com')) {
      // Extract Vimeo video ID
      const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/;
      const match = sourceUrl.match(vimeoRegex);
      if (match && match[1]) {
        return `https://player.vimeo.com/video/${match[1]}`;
      }
    }
    
    return null;
  };

  const extractSocialInteractions = (dom) => {
    const interactions = {};
    
    // Try to find common social interaction elements
    const likeSelectors = ['.likes', '.like-count', '[data-testid="like"]'];
    const commentSelectors = ['.comments', '.comment-count', '[data-testid="comment"]'];
    const shareSelectors = ['.shares', '.share-count', '[data-testid="share"]'];
    
    // Extract likes
    for (const selector of likeSelectors) {
      const element = dom.querySelector(selector);
      if (element && element.textContent) {
        const match = element.textContent.match(/\d+/);
        if (match) {
          interactions.likes = parseInt(match[0], 10);
          break;
        }
      }
    }
    
    // Extract comments
    for (const selector of commentSelectors) {
      const element = dom.querySelector(selector);
      if (element && element.textContent) {
        const match = element.textContent.match(/\d+/);
        if (match) {
          interactions.comments = parseInt(match[0], 10);
          break;
        }
      }
    }
    
    // Extract shares
    for (const selector of shareSelectors) {
      const element = dom.querySelector(selector);
      if (element && element.textContent) {
        const match = element.textContent.match(/\d+/);
        if (match) {
          interactions.shares = parseInt(match[0], 10);
          break;
        }
      }
    }
    
    return Object.keys(interactions).length > 0 ? interactions : null;
  };

  // This component doesn't render anything
  return null;
});