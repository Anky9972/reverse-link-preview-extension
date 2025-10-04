/**
 * Enhanced utility for estimating reading time for text content
 * Supports multiple languages, content types, and advanced text processing
 * 
 * @file src/utils/readingTimeEstimator.js
 * @version 2.0.0
 */

export const readingTimeEstimator = {
  /**
   * Default reading speeds (words per minute) for different content types
   */
  speeds: {
    technical: 150,      // Technical documentation, code
    standard: 200,       // Regular articles, blog posts
    casual: 250,         // Social media, casual content
    complex: 180,        // Academic papers, research
    fiction: 230,        // Stories, novels
    skimming: 400,       // Quick skimming
    detailed: 100        // Detailed reading with note-taking
  },

  /**
   * Language-specific reading speeds (characters per minute for non-Latin scripts)
   */
  languageSpeeds: {
    zh: 500,  // Chinese - characters per minute
    ja: 600,  // Japanese - characters per minute
    ko: 600,  // Korean - characters per minute
    ar: 180,  // Arabic - words per minute
    he: 180,  // Hebrew - words per minute
    th: 180,  // Thai - words per minute
    default: 200  // Default for Latin scripts
  },

  /**
   * Estimates reading time for a given text
   * @param {string} text - The text to estimate reading time for
   * @param {number|string} speed - Reading speed (number or preset name)
   * @param {Object} options - Additional options
   * @returns {Object} Object containing reading time details
   */
  estimate(text, speed = 200, options = {}) {
    // Validate input
    if (!text || typeof text !== 'string') {
      return {
        minutes: 0,
        seconds: 0,
        formatted: 'No content',
        raw: 0,
        wordCount: 0,
        characterCount: 0,
        wordsPerMinute: 0
      };
    }

    const {
      imageCount = 0,
      codeBlockCount = 0,
      language = null,
      verbose = false,
      includeCodeBlocks = false
    } = options;

    // Get reading speed
    const wpm = typeof speed === 'string' 
      ? (this.speeds[speed] || this.speeds.standard)
      : speed;

    // Process and clean text
    const processedText = this.processText(text, {
      includeCodeBlocks,
      language
    });

    // Calculate word count
    const wordCount = this.countWords(processedText.cleaned, language);
    const characterCount = processedText.cleaned.length;

    // Calculate base reading time
    let baseMinutes = 0;

    if (language && ['zh', 'ja', 'ko'].includes(language)) {
      // For CJK languages, use character-based calculation
      const cpm = this.languageSpeeds[language];
      const cjkCharCount = this.countCJKCharacters(processedText.cleaned);
      const nonCjkWords = wordCount - Math.ceil(cjkCharCount / 2);
      
      baseMinutes = (cjkCharCount / cpm) + (nonCjkWords / wpm);
    } else {
      // For other languages, use word-based calculation
      baseMinutes = wordCount / wpm;
    }

    // Add time for images (12 seconds per image)
    const imageTime = imageCount * 0.2;

    // Add time for code blocks (30 seconds per block)
    const codeTime = codeBlockCount * 0.5;

    // Calculate total time
    const totalMinutes = baseMinutes + imageTime + codeTime;

    // Calculate minutes and seconds
    const minutesOnly = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutesOnly) * 60);

    // Format reading time
    const formatted = this.format(totalMinutes, verbose);

    return {
      minutes: minutesOnly,
      seconds,
      formatted,
      raw: totalMinutes,
      wordCount,
      characterCount,
      wordsPerMinute: wpm,
      imageTime,
      codeTime,
      baseTime: baseMinutes
    };
  },

  /**
   * Process and clean text for reading time calculation
   * @param {string} text - The text to process
   * @param {Object} options - Processing options
   * @returns {Object} Processed text data
   */
  processText(text, options = {}) {
    const { includeCodeBlocks = false, language = null } = options;
    
    let cleaned = text;
    let removedCodeBlocks = [];

    // Remove or extract code blocks
    if (!includeCodeBlocks) {
      cleaned = cleaned.replace(/<pre[^>]*>.*?<\/pre>/gis, (match) => {
        removedCodeBlocks.push(match);
        return ' ';
      });
      cleaned = cleaned.replace(/<code[^>]*>.*?<\/code>/gis, (match) => {
        removedCodeBlocks.push(match);
        return ' ';
      });
      cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
        removedCodeBlocks.push(match);
        return ' ';
      });
    }

    // Remove HTML tags
    cleaned = cleaned.replace(/<script[^>]*>.*?<\/script>/gis, ' ');
    cleaned = cleaned.replace(/<style[^>]*>.*?<\/style>/gis, ' ');
    cleaned = cleaned.replace(/<[^>]*>/g, ' ');

    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, ' ');
    
    // Remove email addresses
    cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, ' ');

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Handle special characters based on language
    if (!language || !['zh', 'ja', 'ko'].includes(language)) {
      // For non-CJK languages, keep only letters, numbers, and basic punctuation
      cleaned = cleaned.replace(/[^\w\s'-.,!?;:]/g, ' ');
    }

    return {
      cleaned,
      removedCodeBlocks,
      originalLength: text.length,
      cleanedLength: cleaned.length
    };
  },

  /**
   * Count words in text, with language-specific handling
   * @param {string} text - The text to count words in
   * @param {string} language - The language code
   * @returns {number} Word count
   */
  countWords(text, language = null) {
    if (!text) return 0;

    // For CJK languages, count characters and words separately
    if (language && ['zh', 'ja', 'ko'].includes(language)) {
      const cjkCount = this.countCJKCharacters(text);
      const nonCjkText = text.replace(/[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g, ' ');
      const nonCjkWords = nonCjkText.split(/\s+/).filter(word => word.length > 0);
      
      // Count CJK characters as "half words" for mixed content
      return nonCjkWords.length + Math.ceil(cjkCount / 2);
    }

    // For other languages, split by whitespace
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  },

  /**
   * Count CJK (Chinese, Japanese, Korean) characters
   * @param {string} text - The text to analyze
   * @returns {number} Number of CJK characters
   */
  countCJKCharacters(text) {
    if (!text) return 0;
    
    const cjkPattern = /[\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/g;
    const matches = text.match(cjkPattern);
    return matches ? matches.length : 0;
  },

  /**
   * Formats reading time for display
   * @param {number} minutes - Reading time in minutes
   * @param {boolean} verbose - Whether to use verbose format
   * @returns {string} Formatted reading time string
   */
  format(minutes, verbose = false) {
    if (!minutes || minutes <= 0) {
      return verbose ? 'Less than 1 minute' : '< 1 min';
    }

    const minutesOnly = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesOnly) * 60);
    
    // For very short content (under 1 minute)
    if (minutesOnly === 0) {
      if (seconds < 30) {
        return verbose ? 'Less than 1 minute' : '< 1 min';
      }
      return verbose ? 'About 1 minute' : '1 min';
    }
    
    // For content under 10 minutes, show rounded minutes
    if (minutesOnly < 10) {
      const totalMins = seconds >= 30 ? minutesOnly + 1 : minutesOnly;
      
      if (verbose) {
        return `${totalMins} minute${totalMins !== 1 ? 's' : ''}`;
      }
      return `${totalMins} min`;
    }
    
    // For longer content, round to nearest 5 minutes
    if (minutesOnly >= 10 && minutesOnly < 60) {
      const roundedMins = Math.round(minutesOnly / 5) * 5;
      
      if (verbose) {
        return `About ${roundedMins} minutes`;
      }
      return `~${roundedMins} min`;
    }

    // For content over an hour
    const hours = Math.floor(minutesOnly / 60);
    const remainingMins = minutesOnly % 60;

    if (verbose) {
      if (remainingMins === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }

    if (remainingMins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMins}m`;
  },

  /**
   * Calculates reading progress percentage
   * @param {number} wordsRead - Number of words read
   * @param {number} totalWords - Total number of words
   * @returns {number} Progress percentage (0-100)
   */
  progress(wordsRead, totalWords) {
    if (!totalWords || totalWords <= 0) return 0;
    if (!wordsRead || wordsRead <= 0) return 0;
    
    return Math.min(Math.round((wordsRead / totalWords) * 100), 100);
  },

  /**
   * Estimates remaining reading time
   * @param {number} totalMinutes - Total reading time
   * @param {number} progressPercent - Current progress (0-100)
   * @returns {Object} Remaining time details
   */
  remaining(totalMinutes, progressPercent) {
    if (!totalMinutes || totalMinutes <= 0) {
      return {
        minutes: 0,
        seconds: 0,
        formatted: 'No time remaining'
      };
    }

    const validProgress = Math.max(0, Math.min(100, progressPercent || 0));
    const remainingMinutes = totalMinutes * (1 - validProgress / 100);
    
    return {
      minutes: Math.floor(remainingMinutes),
      seconds: Math.round((remainingMinutes % 1) * 60),
      formatted: this.format(remainingMinutes),
      raw: remainingMinutes
    };
  },

  /**
   * Validates and normalizes reading time data
   * @param {number|string} time - Time value to validate
   * @returns {number} Validated time in minutes
   */
  normalize(time) {
    if (typeof time === 'number') {
      return Math.max(0, isFinite(time) ? time : 0);
    }
    if (typeof time === 'string') {
      const parsed = parseFloat(time);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    return 0;
  },

  /**
   * Calculate reading time for HTML content
   * @param {HTMLElement|string} content - HTML element or HTML string
   * @param {Object} options - Estimation options
   * @returns {Object} Reading time data
   */
  estimateHTML(content, options = {}) {
    let element;
    
    if (typeof content === 'string') {
      // Parse HTML string
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      element = doc.body;
    } else if (content instanceof HTMLElement) {
      element = content;
    } else {
      console.error('Invalid content provided to estimateHTML');
      return this.estimate('', options.speed, options);
    }

    // Extract text content
    const textContent = element.textContent || '';

    // Count images
    const imageCount = element.querySelectorAll('img').length;

    // Count code blocks
    const codeBlockCount = element.querySelectorAll('pre, code').length;

    return this.estimate(textContent, options.speed || 'standard', {
      ...options,
      imageCount: options.imageCount || imageCount,
      codeBlockCount: options.codeBlockCount || codeBlockCount
    });
  },

  /**
   * Get reading speed recommendation based on content type
   * @param {string} contentType - The type of content
   * @returns {number} Recommended words per minute
   */
  getRecommendedSpeed(contentType) {
    const normalizedType = contentType ? contentType.toLowerCase() : 'standard';
    return this.speeds[normalizedType] || this.speeds.standard;
  },

  /**
   * Batch estimate reading times for multiple texts
   * @param {Array<string>} texts - Array of texts to estimate
   * @param {Object} options - Estimation options
   * @returns {Array<Object>} Array of reading time data
   */
  batchEstimate(texts, options = {}) {
    if (!Array.isArray(texts)) {
      console.error('batchEstimate requires an array of texts');
      return [];
    }

    return texts.map(text => this.estimate(text, options.speed, options));
  }
};

export default readingTimeEstimator;