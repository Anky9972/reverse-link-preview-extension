/**
 * Position Calculator
 * 
 * Utility for calculating optimal positions for preview elements
 * based on viewport constraints and trigger positions.
 * 
 * @file src/utils/positionCalculator.js
 * @version 2.0.0
 */

class PositionCalculator {
  constructor() {
    this.defaultOptions = {
      padding: 10,
      preferredPlacement: 'bottom',
      offset: 10,
      allowOversize: false,
      zIndex: 10000,
      constrainToViewport: true,
      respectScrollPosition: true
    };
  }

  /**
   * Calculate the optimal position for a preview element
   * @param {Object} triggerPosition - The position of the trigger element (x, y)
   * @param {Object} previewSize - The size of the preview element (width, height)
   * @param {Object} viewportSize - The size of the viewport (width, height)
   * @param {Object} options - Additional options
   * @returns {Object} The calculated position (x, y) and placement (top, bottom, left, right)
   */
  calculatePosition(triggerPosition, previewSize, viewportSize, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    const {
      padding,
      preferredPlacement,
      offset,
      allowOversize,
      constrainToViewport
    } = config;
    
    const { x, y } = triggerPosition;
    const { width, height } = previewSize;
    const { width: viewportWidth, height: viewportHeight } = viewportSize;
    
    // Check if preview is oversized
    if (!allowOversize && (width > viewportWidth - 2 * padding || height > viewportHeight - 2 * padding)) {
      console.warn('Preview element is larger than viewport. Consider enabling allowOversize or reducing preview size.');
      
      // Scale down the preview size proportionally
      const scaleX = (viewportWidth - 2 * padding) / width;
      const scaleY = (viewportHeight - 2 * padding) / height;
      const scale = Math.min(scaleX, scaleY, 1);
      
      return {
        x: padding,
        y: padding,
        placement: 'center',
        scale: scale,
        oversized: true,
        width: width * scale,
        height: height * scale
      };
    }
    
    // Available space in each direction
    const availableSpace = {
      top: y - padding,
      bottom: viewportHeight - y - padding,
      left: x - padding,
      right: viewportWidth - x - padding,
    };
    
    // Determine the best placement based on available space and preferred placement
    let placement = this.determineBestPlacement(
      preferredPlacement,
      availableSpace,
      previewSize
    );
    
    // Calculate the position based on the placement
    let posX = x;
    let posY = y;
    
    switch (placement) {
      case 'top':
        posY = y - height - offset;
        posX = Math.max(padding, Math.min(x - width / 2, viewportWidth - width - padding));
        break;
      case 'bottom':
        posY = y + offset;
        posX = Math.max(padding, Math.min(x - width / 2, viewportWidth - width - padding));
        break;
      case 'left':
        posX = x - width - offset;
        posY = Math.max(padding, Math.min(y - height / 2, viewportHeight - height - padding));
        break;
      case 'right':
        posX = x + offset;
        posY = Math.max(padding, Math.min(y - height / 2, viewportHeight - height - padding));
        break;
      case 'center':
        posX = (viewportWidth - width) / 2;
        posY = (viewportHeight - height) / 2;
        break;
    }
    
    // Ensure the preview stays within the viewport
    if (constrainToViewport) {
      posX = Math.max(padding, Math.min(posX, viewportWidth - width - padding));
      posY = Math.max(padding, Math.min(posY, viewportHeight - height - padding));
    }
    
    return {
      x: posX,
      y: posY,
      placement,
      scale: 1,
      oversized: false
    };
  }

  /**
   * Determine the best placement for the preview
   * @param {string} preferredPlacement - The preferred placement
   * @param {Object} availableSpace - Available space in each direction
   * @param {Object} previewSize - The size of the preview
   * @returns {string} The best placement
   */
  determineBestPlacement(preferredPlacement, availableSpace, previewSize) {
    const { width, height } = previewSize;
    
    // Check if preferred placement has enough space
    const hasEnoughSpace = this.checkPlacementSpace(
      preferredPlacement,
      availableSpace,
      { width, height }
    );
    
    if (hasEnoughSpace) {
      return preferredPlacement;
    }
    
    // Find the direction with the most available space
    const placements = [
      { direction: 'bottom', space: availableSpace.bottom, needed: height },
      { direction: 'top', space: availableSpace.top, needed: height },
      { direction: 'right', space: availableSpace.right, needed: width },
      { direction: 'left', space: availableSpace.left, needed: width }
    ];
    
    // Sort by available space
    placements.sort((a, b) => b.space - a.space);
    
    // Find first placement with enough space
    for (const placement of placements) {
      if (placement.space >= placement.needed) {
        return placement.direction;
      }
    }
    
    // If no placement has enough space, return the one with most space
    return placements[0].direction;
  }

  /**
   * Check if a placement has enough space
   * @param {string} placement - The placement to check
   * @param {Object} availableSpace - Available space in each direction
   * @param {Object} size - Required size
   * @returns {boolean} Whether there's enough space
   */
  checkPlacementSpace(placement, availableSpace, size) {
    switch (placement) {
      case 'top':
      case 'bottom':
        return availableSpace[placement] >= size.height;
      case 'left':
      case 'right':
        return availableSpace[placement] >= size.width;
      default:
        return false;
    }
  }

  /**
   * Get the viewport size
   * @returns {Object} The viewport size (width, height)
   */
  getViewportSize() {
    return {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
    };
  }

  /**
   * Get the element size
   * @param {HTMLElement} element - The element to measure
   * @returns {Object} The element size (width, height)
   */
  getElementSize(element) {
    if (!element) {
      console.warn('No element provided to getElementSize');
      return { width: 0, height: 0 };
    }
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
    };
  }

  /**
   * Get the position of an element relative to the viewport
   * @param {HTMLElement} element - The element to measure
   * @param {Object} options - Options for position calculation
   * @returns {Object} The element position (x, y)
   */
  getElementPosition(element, options = {}) {
    if (!element) {
      console.warn('No element provided to getElementPosition');
      return { x: 0, y: 0 };
    }
    
    const { useCenter = true, respectScroll = false } = options;
    const rect = element.getBoundingClientRect();
    
    let x = rect.left;
    let y = rect.top;
    
    if (useCenter) {
      x += rect.width / 2;
      y += rect.height / 2;
    }
    
    // Add scroll position if needed
    if (respectScroll) {
      x += window.pageXOffset || document.documentElement.scrollLeft;
      y += window.pageYOffset || document.documentElement.scrollTop;
    }
    
    return { x, y };
  }

  /**
   * Get scroll position
   * @returns {Object} The scroll position (x, y)
   */
  getScrollPosition() {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || 0
    };
  }

  /**
   * Calculate the optimal position for a preview element relative to a trigger element
   * @param {HTMLElement} triggerElement - The trigger element
   * @param {HTMLElement} previewElement - The preview element
   * @param {Object} options - Additional options
   * @returns {Object} The calculated position (x, y) and placement (top, bottom, left, right)
   */
  calculatePositionFromElements(triggerElement, previewElement, options = {}) {
    if (!triggerElement || !previewElement) {
      console.error('Both triggerElement and previewElement are required');
      return {
        x: 0,
        y: 0,
        placement: 'bottom',
        scale: 1,
        oversized: false
      };
    }

    const triggerPosition = this.getElementPosition(triggerElement, {
      useCenter: true,
      respectScroll: options.respectScrollPosition
    });
    const previewSize = this.getElementSize(previewElement);
    const viewportSize = this.getViewportSize();
    
    return this.calculatePosition(triggerPosition, previewSize, viewportSize, options);
  }

  /**
   * Apply the calculated position to an element
   * @param {HTMLElement} element - The element to position
   * @param {Object} position - The position to apply (x, y)
   * @param {string} placement - The placement direction (top, bottom, left, right)
   * @param {Object} options - Additional options
   */
  applyPosition(element, position, placement, options = {}) {
    if (!element) {
      console.warn('No element provided to applyPosition');
      return;
    }
    
    const { zIndex = this.defaultOptions.zIndex, animated = false } = options;
    
    element.style.position = 'fixed';
    element.style.left = `${position.x}px`;
    element.style.top = `${position.y}px`;
    element.style.zIndex = String(zIndex);
    
    // Apply scale if oversized
    if (position.scale && position.scale !== 1) {
      element.style.transform = `scale(${position.scale})`;
      element.style.transformOrigin = 'top left';
    }
    
    // Add transition for smooth positioning
    if (animated) {
      element.style.transition = 'left 0.2s ease, top 0.2s ease, transform 0.2s ease';
    }
    
    // Add data attribute for placement
    element.setAttribute('data-placement', placement);
    
    // Remove all placement classes
    element.classList.remove(
      'placement-top',
      'placement-bottom',
      'placement-left',
      'placement-right',
      'placement-center'
    );
    
    // Add the appropriate placement class
    element.classList.add(`placement-${placement}`);
    
    // Add oversized class if applicable
    if (position.oversized) {
      element.classList.add('placement-oversized');
    } else {
      element.classList.remove('placement-oversized');
    }
  }

  /**
   * Calculate and apply position in one call
   * @param {HTMLElement} triggerElement - The trigger element
   * @param {HTMLElement} previewElement - The preview element
   * @param {Object} options - Additional options
   * @returns {Object} The calculated position
   */
  positionElement(triggerElement, previewElement, options = {}) {
    const position = this.calculatePositionFromElements(
      triggerElement,
      previewElement,
      options
    );
    
    this.applyPosition(previewElement, position, position.placement, options);
    
    return position;
  }

  /**
   * Reposition an element (useful for window resize or scroll)
   * @param {HTMLElement} triggerElement - The trigger element
   * @param {HTMLElement} previewElement - The preview element
   * @param {Object} options - Additional options
   */
  reposition(triggerElement, previewElement, options = {}) {
    return this.positionElement(triggerElement, previewElement, {
      ...options,
      animated: true
    });
  }

  /**
   * Check if an element is visible in the viewport
   * @param {HTMLElement} element - The element to check
   * @returns {boolean} Whether the element is visible
   */
  isInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportSize();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewport.height &&
      rect.right <= viewport.width
    );
  }

  /**
   * Get percentage of element visible in viewport
   * @param {HTMLElement} element - The element to check
   * @returns {number} Percentage visible (0-100)
   */
  getVisibilityPercentage(element) {
    if (!element) return 0;
    
    const rect = element.getBoundingClientRect();
    const viewport = this.getViewportSize();
    
    const visibleWidth = Math.max(
      0,
      Math.min(rect.right, viewport.width) - Math.max(rect.left, 0)
    );
    const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0)
    );
    
    const elementArea = rect.width * rect.height;
    const visibleArea = visibleWidth * visibleHeight;
    
    return elementArea > 0 ? Math.round((visibleArea / elementArea) * 100) : 0;
  }
}

// Export a singleton instance
export const positionCalculator = new PositionCalculator();

// Export class for creating multiple instances if needed
export { PositionCalculator };

export default positionCalculator;