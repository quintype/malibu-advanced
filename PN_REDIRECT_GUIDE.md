# Push Notification (PN) Redirect to PWA Guide

This guide explains how the push notification redirect system works to direct users from PN links to your PWA.

## Overview

When users click on push notification links, the system automatically:
1. **Detects** if the user has the PWA installed
2. **Prompts** for PWA installation if not installed (on mobile)
3. **Redirects** to the target content within the PWA
4. **Provides** a seamless user experience

## How It Works

### 1. PN Link Detection

The system detects PN links through:
- Query parameters: `?pn=true`, `?push=true`, `?notification=true`
- URL patterns: `/pn/`, `/push/`, `/notification/`
- Custom parameters: `?url=`, `?target=`, `?redirect=`, `?link=`

### 2. Target URL Extraction

The system extracts the target URL from:
```javascript
// Priority order:
1. url parameter
2. target parameter
3. redirect parameter
4. link parameter
5. Fallback to home page (/)
```

### 3. PWA Detection

Checks if the app is installed as PWA:
```javascript
// Multiple detection methods:
- display-mode: standalone (Chrome/Edge)
- navigator.standalone (Safari)
- android-app:// referrer (Android)
```

## Usage Examples

### Basic PN Link
```
https://yourdomain.com/pn/redirect?url=/story/breaking-news
```

### With Multiple Parameters
```
https://yourdomain.com/pn/redirect?url=/story/breaking-news&pn=true&source=notification
```

### Alternative Formats
```
https://yourdomain.com/push/redirect?target=/story/breaking-news
https://yourdomain.com/notification/redirect?redirect=/story/breaking-news
https://yourdomain.com/?pn=true&url=/story/breaking-news
```

### OneSignal Integration
```
https://yourdomain.com/pn/redirect?url=/story/breaking-news&onesignal=true
```

## Implementation Details

### Server-Side Handler (`app/server/handlers/pn-redirect.js`)

```javascript
// Handles PN redirects with security validation
export function handlePNRedirect(req, res, next) {
  // 1. Detect PN links
  // 2. Extract target URL
  // 3. Validate URL security
  // 4. Add PWA parameters
  // 5. Perform redirect
}
```

### Client-Side Script (`public/js/push-notification-redirect.js`)

```javascript
// Handles PWA installation prompts and redirects
function handlePNRedirect() {
  // 1. Check if PWA installed
  // 2. Show install prompt (mobile)
  // 3. Redirect to target URL
}
```

## Security Features

### URL Validation
- Only allows relative URLs (`/story/...`)
- Validates against trusted domains
- Prevents open redirect attacks

### Allowed Domains
```javascript
const allowedDomains = [
  'localhost',
  '127.0.0.1',
  'malibu-advanced-web.quintype.io',
  'malibu-advanced-web.qtstage.io'
];
```

### Logging
- Logs all redirects for analytics
- Tracks user agent and IP
- Monitors for suspicious activity

## Integration with OneSignal

### OneSignal Configuration
The system works with your existing OneSignal setup:

```javascript
// In your OneSignal notification payload:
{
  "url": "https://yourdomain.com/pn/redirect?url=/story/breaking-news",
  "data": {
    "target_url": "/story/breaking-news"
  }
}
```

### Service Worker Integration
```javascript
// views/js/service-worker.ejs
if("<%= config["public-integrations"]["one-signal"] &&  config["public-integrations"]["one-signal"]["app-id"] %>") {
  importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');
}
```

## User Experience Flow

### Mobile Users (PWA Not Installed)
1. Click PN link
2. See PWA install prompt
3. Choose to install or skip
4. Redirect to target content

### Mobile Users (PWA Installed)
1. Click PN link
2. Direct redirect to target content in PWA

### Desktop Users
1. Click PN link
2. Direct redirect to target content
3. Can manually install PWA later

## Customization

### Modify PN Link Detection
Edit `isPNLink()` function in `push-notification-redirect.js`:
```javascript
function isPNLink() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('your_custom_param') ||
         urlParams.has('pn') ||
         urlParams.has('push');
}
```

### Custom Install Prompt
Modify `showPWAInstallPrompt()` function:
```javascript
function showPWAInstallPrompt() {
  // Customize the prompt styling and content
  const installPrompt = document.createElement('div');
  installPrompt.style.cssText = `
    // Your custom styles
  `;
}
```

### Add Analytics
Track PN redirects in your analytics:
```javascript
// In handlePNRedirect function
logger.info('PN Redirect:', {
  from: req.originalUrl,
  to: redirectURL.toString(),
  userAgent: req.get('User-Agent'),
  ip: req.ip,
  timestamp: new Date().toISOString()
});
```

## Testing

### Test PN Links
1. Create test PN links with different parameters
2. Test on mobile and desktop
3. Test with PWA installed and not installed
4. Verify redirect behavior

### Example Test URLs
```
http://localhost:3000/pn/redirect?url=/story/test-story
http://localhost:3000/?pn=true&url=/story/test-story
http://localhost:3000/push/redirect?target=/story/test-story
```

### Browser Testing
- Chrome/Edge: Test PWA installation flow
- Safari: Test standalone mode detection
- Firefox: Test fallback behavior
- Mobile browsers: Test install prompts

## Troubleshooting

### Common Issues

1. **PN links not redirecting**
   - Check if the script is loading
   - Verify URL parameters are correct
   - Check browser console for errors

2. **PWA install prompt not showing**
   - Ensure `beforeinstallprompt` event fires
   - Check if PWA criteria are met
   - Verify service worker is registered

3. **Invalid redirect URLs**
   - Check URL validation logic
   - Verify allowed domains list
   - Check for URL encoding issues

### Debug Mode
Add debug logging:
```javascript
// In push-notification-redirect.js
const DEBUG = true;

function debugLog(message, data) {
  if (DEBUG) {
    console.log('[PN Redirect]', message, data);
  }
}
```

## Best Practices

1. **Always encode URLs** in PN links
2. **Use relative URLs** when possible
3. **Test on multiple devices** and browsers
4. **Monitor redirect logs** for issues
5. **Keep allowed domains list** updated
6. **Provide fallback behavior** for edge cases

## API Reference

### Server Functions
- `handlePNRedirect(req, res, next)` - Main redirect handler
- `isValidRedirectURL(url)` - URL validation
- `createPNRedirectURL(targetURL, baseURL)` - Create PN links

### Client Functions
- `isPWAInstalled()` - Check PWA installation status
- `isPNLink()` - Detect PN links
- `getTargetURL()` - Extract target URL
- `showPWAInstallPrompt()` - Show install prompt
- `installPWA()` - Handle PWA installation
- `dismissPWAInstall()` - Dismiss install prompt
