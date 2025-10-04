/**
 * Shared URL validation utility
 * Used across content script, background script, and React components
 */

export const urlValidator = {
  /**
   * Validates if a URL is safe and supported
   * @param {string} url - The URL to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValid(url) {
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

      // Block file:// and other potentially dangerous protocols
      if (parsed.protocol === 'file:') {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Extracts hostname from URL
   * @param {string} url - The URL
   * @returns {string|null} - Hostname or null if invalid
   */
  getHostname(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname;
    } catch (e) {
      return null;
    }
  },

  /**
   * Normalizes URL (removes fragments, sorts query params)
   * @param {string} url - The URL to normalize
   * @returns {string|null} - Normalized URL or null if invalid
   */
  normalize(url) {
    try {
      const parsed = new URL(url);
      
      // Remove fragment
      parsed.hash = '';
      
      // Sort query parameters for consistency
      const params = new URLSearchParams(parsed.search);
      const sortedParams = new URLSearchParams(
        [...params.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      );
      parsed.search = sortedParams.toString();
      
      return parsed.toString();
    } catch (e) {
      return null;
    }
  },

  /**
   * Checks if URL is same-origin
   * @param {string} url - The URL to check
   * @returns {boolean} - True if same origin as current page
   */
  isSameOrigin(url) {
    try {
      const parsed = new URL(url);
      const current = new URL(window.location.href);
      return parsed.origin === current.origin;
    } catch (e) {
      return false;
    }
  }
};