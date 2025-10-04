/**
 * Keyboard Manager
 * 
 * Handles keyboard shortcuts and events for the extension.
 * Provides utilities for keyboard shortcut detection and conflict resolution.
 * 
 * @file src/utils/keyboardManager.js
 * @version 2.0.0
 */

class KeyboardManager {
  constructor() {
    this.pressedKeys = new Set();
    this.shortcuts = new Map();
    this.listeners = new Map();
    this.conflictMap = new Map();
    this.isEnabled = true;
    this.preventDefaultMap = new Map();
    this.conflictDetectionDebounce = null;
    this.boundHandlers = {
      keydown: null,
      keyup: null,
      blur: null
    };
  }

  /**
   * Initialize keyboard manager with default shortcuts
   * @param {Object} defaultShortcuts - Default keyboard shortcuts
   * @param {Object} options - Configuration options
   */
  init(defaultShortcuts = {}, options = {}) {
    const {
      autoAttach = true,
      preventDefault = true
    } = options;

    // Register default shortcuts
    Object.entries(defaultShortcuts).forEach(([action, keys]) => {
      this.registerShortcut(action, keys, { preventDefault });
    });

    // Set up event listeners
    if (autoAttach) {
      this.attachListeners();
    }

    // Set up conflict detection
    this.detectConflicts();
  }

  /**
   * Attach keyboard event listeners
   */
  attachListeners() {
    if (this.boundHandlers.keydown) {
      return; // Already attached
    }

    this.boundHandlers.keydown = (e) => this.handleKeyDown(e);
    this.boundHandlers.keyup = (e) => this.handleKeyUp(e);
    this.boundHandlers.blur = () => this.handleBlur();

    window.addEventListener('keydown', this.boundHandlers.keydown);
    window.addEventListener('keyup', this.boundHandlers.keyup);
    window.addEventListener('blur', this.boundHandlers.blur);
  }

  /**
   * Detach keyboard event listeners
   */
  detachListeners() {
    if (!this.boundHandlers.keydown) {
      return; // Not attached
    }

    window.removeEventListener('keydown', this.boundHandlers.keydown);
    window.removeEventListener('keyup', this.boundHandlers.keyup);
    window.removeEventListener('blur', this.boundHandlers.blur);

    this.boundHandlers = {
      keydown: null,
      keyup: null,
      blur: null
    };
  }

  /**
   * Register a keyboard shortcut
   * @param {string} action - Action identifier
   * @param {string|Array} keys - Key or key combination
   * @param {Object} options - Options for the shortcut
   */
  registerShortcut(action, keys, options = {}) {
    const { preventDefault = true } = options;
    const keyCombo = Array.isArray(keys) ? keys : [keys];
    
    this.shortcuts.set(action, keyCombo);
    this.preventDefaultMap.set(action, preventDefault);
    
    // Debounce conflict detection
    this.scheduleConflictDetection();
  }

  /**
   * Unregister a keyboard shortcut
   * @param {string} action - Action identifier
   */
  unregisterShortcut(action) {
    this.shortcuts.delete(action);
    this.preventDefaultMap.delete(action);
    this.listeners.delete(action);
    this.scheduleConflictDetection();
  }

  /**
   * Schedule conflict detection with debouncing
   */
  scheduleConflictDetection() {
    if (this.conflictDetectionDebounce) {
      clearTimeout(this.conflictDetectionDebounce);
    }
    
    this.conflictDetectionDebounce = setTimeout(() => {
      this.detectConflicts();
      this.conflictDetectionDebounce = null;
    }, 100);
  }

  /**
   * Check if a given key combination is active
   * @param {string|Array} keys - Key or key combination to check
   * @returns {boolean} Whether the combination is active
   */
  isActive(keys) {
    const keyCombo = Array.isArray(keys) ? keys : [keys];
    return keyCombo.every(key => this.pressedKeys.has(key.toLowerCase()));
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} event - The keydown event
   * @returns {boolean} Whether default was prevented
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return false;

    const key = event.key.toLowerCase();
    this.pressedKeys.add(key);
    
    // Check for modifiers
    if (event.shiftKey) this.pressedKeys.add('shift');
    if (event.ctrlKey) this.pressedKeys.add('control');
    if (event.altKey) this.pressedKeys.add('alt');
    if (event.metaKey) this.pressedKeys.add('meta');
    
    // Check for shortcuts
    const triggered = this.checkShortcuts(event);
    
    // Prevent default if shortcut was triggered and preventDefault is enabled
    if (triggered && event.cancelable) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  }

  /**
   * Handle keyup event
   * @param {KeyboardEvent} event - The keyup event
   */
  handleKeyUp(event) {
    const key = event.key.toLowerCase();
    this.pressedKeys.delete(key);
    
    // Remove modifiers if released
    if (!event.shiftKey) this.pressedKeys.delete('shift');
    if (!event.ctrlKey) this.pressedKeys.delete('control');
    if (!event.altKey) this.pressedKeys.delete('alt');
    if (!event.metaKey) this.pressedKeys.delete('meta');
  }

  /**
   * Handle window blur - clear all pressed keys
   */
  handleBlur() {
    this.pressedKeys.clear();
  }

  /**
   * Check for active shortcuts and trigger actions
   * @param {KeyboardEvent} event - The keyboard event
   * @returns {boolean} Whether any shortcut was triggered
   */
  checkShortcuts(event) {
    let triggered = false;

    this.shortcuts.forEach((keyCombo, action) => {
      if (this.isActive(keyCombo)) {
        const shouldPreventDefault = this.preventDefaultMap.get(action);
        this.triggerAction(action, event);
        
        if (shouldPreventDefault) {
          triggered = true;
        }
      }
    });

    return triggered;
  }

  /**
   * Trigger an action associated with a shortcut
   * @param {string} action - Action identifier
   * @param {KeyboardEvent} event - The keyboard event
   */
  triggerAction(action, event = null) {
    const listeners = this.listeners.get(action) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in keyboard shortcut handler for "${action}":`, error);
      }
    });
  }

  /**
   * Add a listener for a specific action
   * @param {string} action - Action identifier
   * @param {Function} callback - Callback function
   */
  addListener(action, callback) {
    if (typeof callback !== 'function') {
      console.error('Callback must be a function');
      return;
    }

    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action).push(callback);
  }

  /**
   * Remove a listener for a specific action
   * @param {string} action - Action identifier
   * @param {Function} callback - Callback function to remove
   */
  removeListener(action, callback) {
    if (!this.listeners.has(action)) return;
    
    const listeners = this.listeners.get(action);
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // Clean up if no listeners remain
    if (listeners.length === 0) {
      this.listeners.delete(action);
    }
  }

  /**
   * Remove all listeners for a specific action
   * @param {string} action - Action identifier
   */
  removeAllListeners(action) {
    this.listeners.delete(action);
  }

  /**
   * Detect conflicts between registered shortcuts
   * @returns {Map} Map of conflicting shortcuts
   */
  detectConflicts() {
    this.conflictMap.clear();
    
    const shortcutEntries = Array.from(this.shortcuts.entries());
    
    for (let i = 0; i < shortcutEntries.length; i++) {
      const [action1, keys1] = shortcutEntries[i];
      const keySet1 = new Set(keys1.map(k => k.toLowerCase()));
      
      for (let j = i + 1; j < shortcutEntries.length; j++) {
        const [action2, keys2] = shortcutEntries[j];
        const keySet2 = new Set(keys2.map(k => k.toLowerCase()));
        
        // Check if keysets are identical
        const hasConflict = this.checkKeySetsConflict(keySet1, keySet2);
        
        if (hasConflict) {
          if (!this.conflictMap.has(action1)) {
            this.conflictMap.set(action1, new Set());
          }
          if (!this.conflictMap.has(action2)) {
            this.conflictMap.set(action2, new Set());
          }
          
          this.conflictMap.get(action1).add(action2);
          this.conflictMap.get(action2).add(action1);
        }
      }
    }
    
    if (this.conflictMap.size > 0) {
      console.warn('Keyboard shortcut conflicts detected:', 
        Array.from(this.conflictMap.entries()).map(([action, conflicts]) => 
          `${action} conflicts with: ${Array.from(conflicts).join(', ')}`
        ).join('\n')
      );
    }
    
    return this.conflictMap;
  }

  /**
   * Check if two keysets conflict
   * @param {Set} keySet1 - First keyset
   * @param {Set} keySet2 - Second keyset
   * @returns {boolean} Whether the keysets conflict
   */
  checkKeySetsConflict(keySet1, keySet2) {
    // Keysets conflict if they're identical
    if (keySet1.size !== keySet2.size) {
      return false;
    }

    for (const key of keySet1) {
      if (!keySet2.has(key)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all keyboard conflicts
   * @returns {Map} Map of conflicting shortcuts
   */
  getConflicts() {
    return this.conflictMap;
  }

  /**
   * Check if a shortcut has conflicts
   * @param {string} action - Action identifier
   * @returns {boolean} Whether the shortcut has conflicts
   */
  hasConflicts(action) {
    return this.conflictMap.has(action) && this.conflictMap.get(action).size > 0;
  }

  /**
   * Get all registered shortcuts
   * @returns {Map} Map of all shortcuts
   */
  getAllShortcuts() {
    return new Map(this.shortcuts);
  }

  /**
   * Enable keyboard manager
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable keyboard manager
   */
  disable() {
    this.isEnabled = false;
    this.pressedKeys.clear();
  }

  /**
   * Convert a key combination to a readable string
   * @param {string|Array} keys - Key or key combination
   * @returns {string} Human-readable key combination
   */
  getReadableKeyCombo(keys) {
    const keyCombo = Array.isArray(keys) ? keys : [keys];
    const formattedKeys = keyCombo.map(key => {
      const keyLower = key.toLowerCase();
      switch (keyLower) {
        case 'control': return 'Ctrl';
        case 'meta': return 'Cmd';
        case 'alt': return 'Alt';
        case 'shift': return 'Shift';
        case ' ': return 'Space';
        case 'enter': return 'Enter';
        case 'escape': return 'Esc';
        case 'tab': return 'Tab';
        case 'arrowup': return '↑';
        case 'arrowdown': return '↓';
        case 'arrowleft': return '←';
        case 'arrowright': return '→';
        case 'backspace': return 'Backspace';
        case 'delete': return 'Delete';
        default: return key.length === 1 ? key.toUpperCase() : key;
      }
    });
    
    return formattedKeys.join(' + ');
  }

  /**
   * Clean up and remove all listeners
   */
  cleanup() {
    this.detachListeners();
    this.pressedKeys.clear();
    this.shortcuts.clear();
    this.listeners.clear();
    this.conflictMap.clear();
    this.preventDefaultMap.clear();
    
    if (this.conflictDetectionDebounce) {
      clearTimeout(this.conflictDetectionDebounce);
      this.conflictDetectionDebounce = null;
    }
  }

  /**
   * Export current configuration
   * @returns {Object} Configuration object
   */
  exportConfig() {
    return {
      shortcuts: Object.fromEntries(this.shortcuts),
      preventDefaults: Object.fromEntries(this.preventDefaultMap)
    };
  }

  /**
   * Import configuration
   * @param {Object} config - Configuration object
   */
  importConfig(config) {
    if (!config || typeof config !== 'object') {
      console.error('Invalid configuration provided');
      return;
    }

    // Clear existing shortcuts
    this.shortcuts.clear();
    this.preventDefaultMap.clear();

    // Import shortcuts
    if (config.shortcuts) {
      Object.entries(config.shortcuts).forEach(([action, keys]) => {
        const preventDefault = config.preventDefaults?.[action] ?? true;
        this.registerShortcut(action, keys, { preventDefault });
      });
    }
  }
}

// Export a singleton instance
export const keyboardManager = new KeyboardManager();

// Export class for creating multiple instances if needed
export { KeyboardManager };

export default keyboardManager;