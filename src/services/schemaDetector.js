/**
 * Schema Detector Service
 * Detects and extracts schema.org structured data from web pages
 * src/services/schemaDetector.js
 */
class SchemaDetector {
    /**
     * Extract schema.org data from a parsed DOM
     * @param {Document} dom - Parsed DOM document
     * @returns {Object|null} - Extracted schema data or null if none found
     */
    extractSchema(dom) {
      if (!dom) {
        console.warn('No DOM provided to extractSchema');
        return null;
      }
      
      try {
        // Look for JSON-LD schema (most common and reliable)
        const jsonldSchema = this.extractJsonLdSchema(dom);
        if (jsonldSchema) {
          return jsonldSchema;
        }
        
        // Look for microdata schema
        const microdataSchema = this.extractMicrodataSchema(dom);
        if (microdataSchema) {
          return microdataSchema;
        }
        
        // Look for RDFa schema
        const rdfaSchema = this.extractRdfaSchema(dom);
        if (rdfaSchema) {
          return rdfaSchema;
        }
        
        return null;
      } catch (error) {
        console.error('Error extracting schema:', error);
        return null;
      }
    }
    
    /**
     * Extract JSON-LD schema data
     * @param {Document} dom - Parsed DOM document
     * @returns {Object|null} - JSON-LD schema data or null
     */
    extractJsonLdSchema(dom) {
      try {
        const scripts = dom.querySelectorAll('script[type="application/ld+json"]');
        
        if (scripts.length === 0) {
          return null;
        }
        
        // Process all JSON-LD scripts
        for (const script of scripts) {
          try {
            let textContent = script.textContent.trim();
            if (!textContent) {
              continue;
            }
            
            // Sanitize JSON-LD content to remove control characters
            textContent = this.sanitizeJsonLdContent(textContent);
            
            const jsonData = JSON.parse(textContent);
            
            // Handle different JSON-LD formats
            if (Array.isArray(jsonData)) {
              // Return the first relevant schema
              const relevant = this.findRelevantSchema(jsonData);
              if (relevant) {
                return relevant;
              }
            } else if (jsonData['@graph']) {
              // Handle @graph format
              const relevant = this.findRelevantSchema(jsonData['@graph']);
              if (relevant) {
                return relevant;
              }
            } else if (jsonData['@type']) {
              // Direct schema object
              return this.normalizeSchema(jsonData);
            }
          } catch (parseError) {
            console.warn('Error parsing JSON-LD:', parseError);
            continue;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error extracting JSON-LD schema:', error);
        return null;
      }
    }
    
    /**
     * Sanitize JSON-LD content by removing control characters that cause parsing errors
     * @param {string} content - Raw JSON-LD content
     * @returns {string} - Sanitized content
     */
    sanitizeJsonLdContent(content) {
      try {
        // Remove common control characters that break JSON parsing
        // Remove characters like \u0000-\u001F except \t, \n, \r
        return content.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
                     .replace(/[\u007F-\u009F]/g, '') // Remove DEL and C1 control characters
                     .replace(/\\\\/g, '\\'); // Fix double backslashes
      } catch (error) {
        console.warn('Error sanitizing JSON-LD content:', error);
        return content; // Return original if sanitization fails
      }
    }
    
    /**
     * Extract microdata schema
     * @param {Document} dom - Parsed DOM document
     * @returns {Object|null} - Microdata schema or null
     */
    extractMicrodataSchema(dom) {
      try {
        const elements = dom.querySelectorAll('[itemscope]');
        
        if (elements.length === 0) {
          return null;
        }
        
        // Process the most relevant itemscope element
        const topLevelElements = Array.from(elements).filter(el => {
          // Find elements that aren't nested inside other itemscope elements
          const parent = el.parentElement;
          return parent && !parent.closest('[itemscope]');
        });
        
        if (topLevelElements.length === 0) {
          return null;
        }
        
        // Get the first top-level element with a type
        for (const element of topLevelElements) {
          const type = element.getAttribute('itemtype');
          if (type && type.includes('schema.org')) {
            return this.parseMicrodataElement(element);
          }
        }
        
        // If no typed elements found, just take the first one
        if (topLevelElements[0]) {
          return this.parseMicrodataElement(topLevelElements[0]);
        }
        
        return null;
      } catch (error) {
        console.error('Error extracting microdata schema:', error);
        return null;
      }
    }
    
    /**
     * Parse microdata element into a structured object
     * @param {Element} element - Element with itemscope
     * @returns {Object} - Parsed microdata
     */
    parseMicrodataElement(element) {
      const result = {};
      
      try {
        // Get type
        const itemType = element.getAttribute('itemtype');
        if (itemType) {
          result['@type'] = this.extractTypeFromUrl(itemType);
        }
        
        // Get properties
        const propElements = element.querySelectorAll('[itemprop]');
        for (const propElement of propElements) {
          const propName = propElement.getAttribute('itemprop');
          
          if (!propName) {
            continue;
          }
          
          // Skip if this property belongs to a nested itemscope
          const nearestScope = propElement.closest('[itemscope]');
          if (nearestScope !== element && nearestScope !== null) {
            continue;
          }
          
          // Get property value based on element type
          let propValue;
          
          if (propElement.hasAttribute('itemscope')) {
            // Nested object
            propValue = this.parseMicrodataElement(propElement);
          } else if (propElement.tagName === 'META') {
            propValue = propElement.getAttribute('content');
          } else if (propElement.tagName === 'IMG') {
            propValue = propElement.getAttribute('src');
          } else if (propElement.tagName === 'A') {
            propValue = propElement.getAttribute('href');
          } else if (propElement.tagName === 'TIME') {
            propValue = propElement.getAttribute('datetime') || propElement.textContent.trim();
          } else {
            propValue = propElement.textContent.trim();
          }
          
          // Handle multiple values for same property
          if (result[propName]) {
            if (!Array.isArray(result[propName])) {
              result[propName] = [result[propName]];
            }
            result[propName].push(propValue);
          } else {
            result[propName] = propValue;
          }
        }
      } catch (error) {
        console.error('Error parsing microdata element:', error);
      }
      
      return result;
    }
    
    /**
     * Extract RDFa schema
     * @param {Document} dom - Parsed DOM document
     * @returns {Object|null} - RDFa schema or null
     */
    extractRdfaSchema(dom) {
      try {
        const elements = dom.querySelectorAll('[typeof], [property]');
        
        if (elements.length === 0) {
          return null;
        }
        
        // Find top-level elements with schema.org types
        const topLevelElements = Array.from(elements).filter(el => {
          const typeAttr = el.getAttribute('typeof');
          if (!typeAttr) {
            return false;
          }
          
          const isSchema = typeAttr.includes('schema.org') || typeAttr.includes('schema:');
          const parent = el.parentElement;
          const notNested = parent && !parent.closest('[typeof]');
          
          return isSchema && notNested;
        });
        
        if (topLevelElements.length === 0) {
          return null;
        }
        
        // Parse the first relevant element
        return this.parseRdfaElement(topLevelElements[0]);
      } catch (error) {
        console.error('Error extracting RDFa schema:', error);
        return null;
      }
    }
    
    /**
     * Parse RDFa element into a structured object
     * @param {Element} element - Element with typeof
     * @returns {Object} - Parsed RDFa data
     */
    parseRdfaElement(element) {
      const result = {};
      
      try {
        // Get type
        const typeAttr = element.getAttribute('typeof');
        if (typeAttr) {
          result['@type'] = this.extractTypeFromUrl(typeAttr);
        }
        
        // Get properties
        const propElements = element.querySelectorAll('[property]');
        for (const propElement of propElements) {
          const propAttr = propElement.getAttribute('property');
          if (!propAttr) {
            continue;
          }
          
          const propName = propAttr.replace('schema:', '').replace(/^[^:]+:/, '');
          
          // Skip if this property belongs to a nested typed element
          const nearestTyped = propElement.closest('[typeof]');
          if (nearestTyped !== element && nearestTyped !== null) {
            continue;
          }
          
          // Get property value based on element
          let propValue;
          
          if (propElement.hasAttribute('typeof')) {
            // Nested object
            propValue = this.parseRdfaElement(propElement);
          } else if (propElement.hasAttribute('content')) {
            propValue = propElement.getAttribute('content');
          } else if (propElement.tagName === 'IMG') {
            propValue = propElement.getAttribute('src');
          } else if (propElement.tagName === 'A') {
            propValue = propElement.getAttribute('href');
          } else if (propElement.tagName === 'TIME') {
            propValue = propElement.getAttribute('datetime') || propElement.textContent.trim();
          } else {
            propValue = propElement.textContent.trim();
          }
          
          // Handle multiple values
          if (result[propName]) {
            if (!Array.isArray(result[propName])) {
              result[propName] = [result[propName]];
            }
            result[propName].push(propValue);
          } else {
            result[propName] = propValue;
          }
        }
      } catch (error) {
        console.error('Error parsing RDFa element:', error);
      }
      
      return result;
    }
    
    /**
     * Find the most relevant schema from an array of schemas
     * @param {Array} schemas - Array of schema objects
     * @returns {Object|null} - Most relevant schema
     */
    findRelevantSchema(schemas) {
      if (!schemas || !Array.isArray(schemas) || schemas.length === 0) {
        return null;
      }
      
      // Priority types for preview content
      const priorityTypes = [
        'Article', 'NewsArticle', 'BlogPosting', 'ScholarlyArticle',
        'Product', 'Review', 'AggregateRating', 'Recipe',
        'VideoObject', 'Movie', 'TVEpisode', 'TVSeries',
        'Person', 'Organization', 'Event', 'Place',
        'WebPage', 'ItemList', 'ImageGallery', 'Book'
      ];
      
      // Find schema with priority type
      for (const type of priorityTypes) {
        const found = schemas.find(schema => {
          if (!schema) return false;
          
          const schemaType = schema['@type'];
          if (!schemaType) return false;
          
          return schemaType === type || 
                 (Array.isArray(schemaType) && schemaType.includes(type));
        });
        
        if (found) {
          return this.normalizeSchema(found);
        }
      }
      
      // If no priority types found, return the first schema with a type
      for (const schema of schemas) {
        if (schema && schema['@type']) {
          return this.normalizeSchema(schema);
        }
      }
      
      return null;
    }
    
    /**
     * Normalize schema object
     * @param {Object} schema - Raw schema object
     * @returns {Object} - Normalized schema
     */
    normalizeSchema(schema) {
      if (!schema || typeof schema !== 'object') {
        return schema;
      }
      
      const normalized = { ...schema };
      
      // Normalize @type to string if it's an array with one element
      if (Array.isArray(normalized['@type']) && normalized['@type'].length === 1) {
        normalized['@type'] = normalized['@type'][0];
      }
      
      return normalized;
    }
    
    /**
     * Extract type name from schema.org URL or prefix
     * @param {string} url - Schema.org URL or prefixed type
     * @returns {string} - Type name
     */
    extractTypeFromUrl(url) {
      if (!url || typeof url !== 'string') {
        return '';
      }
      
      // Handle prefixed types (schema:Article, og:Article, etc.)
      if (url.includes(':') && !url.includes('://')) {
        const parts = url.split(':');
        if (parts.length === 2) {
          return parts[1];
        }
      }
      
      // Handle full URLs (https://schema.org/Article)
      if (url.includes('schema.org/')) {
        const parts = url.split('schema.org/');
        if (parts.length === 2) {
          return parts[1];
        }
      }
      
      // Return as is if we can't parse
      return url;
    }
  }
  
  export const schemaDetector = new SchemaDetector();