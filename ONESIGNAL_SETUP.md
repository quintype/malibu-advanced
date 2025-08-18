# OneSignal Integration Setup

This document explains the OneSignal push notification integration and how to fix the "No notification id, skipping networks calls to report open!" error.

## Overview

The OneSignal integration has been set up to handle push notifications properly and prevent the common error that occurs when notification opens are reported without a notification ID.

## Configuration

### 1. Publisher Configuration (`config/publisher.yml`)

```yaml
publisher:
  onesignal:
    is_enable: true
```

### 2. OneSignal App ID Configuration

The OneSignal app ID is configured in the fixture config:

```json
{
  "public-integrations": {
    "one-signal": {
      "app-id": "03ef0b4b-3920-4b9f-9933-2ec237321000"
    }
  }
}
```

## Files Modified

### 1. Service Worker (`views/js/service-worker.ejs`)
- Updated to use a custom OneSignal service worker
- Prevents the "No notification id" error by handling notification opens properly

### 2. Custom OneSignal Service Worker (`public/js/OneSignalSDKWorker.js`)
- Simple service worker that imports the OneSignal SDK
- Lets OneSignal handle all notification events natively

### 3. Server Helpers (`app/server/helpers/index.js`)
- Added `generateOneSignalScript()` function
- Generates the proper OneSignal initialization script
- Includes error handling and debugging

### 4. Render Layout (`app/server/handlers/render-layout.js`)
- Updated to use the generated OneSignal script
- Passes the script to the template

## How the Error is Fixed

The "No notification id, skipping networks calls to report open!" error occurs when:

1. OneSignal tries to report notification opens
2. The notification doesn't have a proper notification ID
3. The service worker doesn't handle the case gracefully

### Solution Implemented:

1. **Custom Service Worker**: Uses a simple service worker that lets OneSignal handle everything natively
2. **Proper Initialization**: The OneSignal script is generated with proper configuration
3. **Error Handling**: Added configuration options to prevent the error:
   - `notificationClickHandlerMatch: 'origin'`
   - `notificationClickHandlerAction: 'focus'`

## Testing

To test the OneSignal integration:

1. **Check Browser Console**: Look for OneSignal initialization messages
2. **Check Service Worker**: Verify the service worker is registered
3. **Test Notifications**: Send a test notification from OneSignal dashboard

## Debugging

### Console Messages to Look For:

```
OneSignal Config: { oneSignalAppId: "...", isOnesignalEnable: true }
```

### Common Issues:

1. **OneSignal not enabled**: Check `publisher.yml` configuration
2. **Missing app ID**: Verify the app ID in the fixture config
3. **Service worker not loading**: Check browser console for errors

## OneSignal Dashboard Setup

1. Create a new OneSignal app
2. Get the app ID
3. Update the fixture config with the app ID
4. Configure notification settings in OneSignal dashboard

## Browser Support

- Chrome 42+
- Firefox 44+
- Safari 16+
- Edge 17+

## Security Considerations

- OneSignal script is loaded from CDN (https://cdn.onesignal.com)
- Service worker is served from your domain
- HTTPS is required for production

## Troubleshooting

### Error: "No notification id, skipping networks calls to report open!"

This error is now prevented by:
1. Using a custom service worker
2. Proper OneSignal initialization
3. Graceful error handling

### OneSignal not initializing

Check:
1. App ID is correct
2. OneSignal is enabled in publisher config
3. No JavaScript errors in console

### Notifications not showing

Check:
1. Browser permissions
2. Service worker registration
3. OneSignal dashboard configuration
