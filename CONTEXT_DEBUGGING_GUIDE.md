# Extension Context Issues - Debugging Guide

## What is "Extension context invalidated"?

When you see this error, it means the Chrome extension was reloaded, updated, or disabled while you were still browsing pages where it was active. The extension's background script becomes invalid, but the content scripts on open pages try to communicate with it.

## Common Scenarios

### 1. **Extension Reload/Update**
- **When**: You manually reload the extension in chrome://extensions/
- **Why**: Background script context gets invalidated
- **Fix**: Refresh all open tabs where you want to use the extension

### 2. **Extension Auto-Update**
- **When**: Chrome automatically updates the extension
- **Why**: Old context becomes invalid after update
- **Fix**: Refresh affected pages

### 3. **Chrome Extension Management**
- **When**: Disabling/enabling the extension
- **Why**: Context lifecycle interruption
- **Fix**: Refresh pages after re-enabling

## Automatic Detection & Recovery

The extension now includes:

✅ **Context Validation**: Checks if extension context is valid before API calls
✅ **Ping Test**: Tests communication with background script
✅ **Timeout Protection**: Prevents hanging on invalid contexts (10s timeout)
✅ **User-Friendly Errors**: Clear messages instead of technical jargon
✅ **One-Click Recovery**: Refresh button in error previews

## Error Messages Explained

### "Extension was reloaded. Please refresh the page..."
- **Cause**: Extension context became invalid
- **Action**: Click the refresh button or press F5
- **Prevention**: Avoid reloading extension while browsing

### "Request timeout - extension context may be invalid"
- **Cause**: Background script not responding (likely invalid context)
- **Action**: Refresh the page
- **Note**: 10-second timeout prevents hanging

### "This website blocks external preview requests"
- **Cause**: CORS policy prevents content fetching
- **Action**: Normal behavior for some sites (not an error)
- **Note**: Not related to extension context

## Best Practices

### For Users:
1. **Refresh pages** after extension updates/reloads
2. **Don't reload extension** while actively browsing
3. **Wait for updates** to complete before using extension
4. **Use refresh button** in error messages for quick recovery

### For Developers:
1. **Test context validation** in development
2. **Handle all async operations** with timeouts
3. **Provide clear error messages** to users
4. **Implement graceful degradation** when context is lost

## Technical Details

### Context Validation Process:
```javascript
// 1. Check runtime existence
if (!chrome || !chrome.runtime || !chrome.runtime.id) {
  throw new Error('Extension context invalidated');
}

// 2. Test runtime access
chrome.runtime.getURL(''); // Throws if invalid

// 3. Ping background script
await chrome.runtime.sendMessage({ action: 'ping' });

// 4. Proceed with actual request (with timeout)
```

### Recovery Mechanisms:
- **Error categorization** for appropriate user messaging
- **Automatic refresh suggestions** with one-click buttons
- **Graceful fallbacks** for non-critical operations
- **State preservation** where possible during context loss

## Troubleshooting

### If errors persist after refresh:
1. Check if extension is enabled in chrome://extensions/
2. Disable and re-enable the extension
3. Clear browser cache and reload page
4. Check browser console for additional error details

### If preview functionality is completely broken:
1. Reload the extension in chrome://extensions/
2. Refresh all tabs
3. Test on a simple webpage (like google.com)
4. Check extension permissions

## Support

If you continue experiencing context issues:
1. Note the exact error message and website URL
2. Check browser console (F12) for additional details
3. Try the extension on different websites
4. Report the issue with specific reproduction steps

The extension is now designed to handle these scenarios gracefully and guide users through recovery!