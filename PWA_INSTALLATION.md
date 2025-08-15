# Desktop Installation for Malibu PWA

This document explains the desktop installation features that have been added to the Malibu Progressive Web App.

## Features Added

### 1. Enhanced Web App Manifest (`public/manifest.json`)

The manifest has been updated with:
- **Description**: Added app description for better discoverability
- **Orientation**: Set to portrait-primary for consistent experience
- **Categories**: Added relevant categories (news, entertainment, lifestyle)
- **Language**: Set to English
- **Maskable Icons**: All icons now support maskable format for better integration
- **512x512 Icon**: Added the largest icon size for high-resolution displays

### 2. Windows Tile Support (`public/browserconfig.xml`)

Created a browserconfig.xml file for Windows tile support:
- Configures the tile color to match the app theme (#2F3BA2)
- Sets the tile image to use the 152x152 icon
- Enables proper Windows desktop integration

### 3. Enhanced HTML Head Tags (`views/pages/layout.ejs`)

Added comprehensive meta tags and link elements:
- **Application Name**: For Windows taskbar
- **Microsoft Tile**: Color and image configuration
- **Apple Touch Icons**: Multiple sizes for iOS devices
- **Favicon**: Standard favicon support
- **Shortcut Icon**: For older browsers

### 4. Installation Prompt (`public/js/install-prompt.js`)

Created a custom installation prompt that:
- Listens for the `beforeinstallprompt` event
- Shows a custom install banner after 3 seconds
- Allows users to install or dismiss the prompt
- Remembers user preference to avoid repeated prompts
- Provides a native-like installation experience

## How to Install on Desktop

### Chrome/Edge (Windows/macOS/Linux)
1. Visit the website
2. Look for the install icon in the address bar (or wait for the custom prompt)
3. Click "Install" to add to desktop
4. The app will appear in your applications list

### Safari (macOS)
1. Visit the website
2. Click "Share" button in the toolbar
3. Select "Add to Home Screen"
4. The app will appear in your Applications folder

### Firefox
1. Visit the website
2. Click the menu button (three lines)
3. Select "Install App"
4. The app will be added to your desktop

## Technical Details

### Service Worker
The existing service worker (`views/js/service-worker.ejs`) already supports:
- Offline functionality
- Asset caching
- App shell architecture
- Network-first strategy for dynamic content

### Icons Available
- 128x128 (favicon, small displays)
- 144x144 (Windows tiles)
- 152x152 (Apple touch, Android)
- 192x192 (Android, high-res displays)
- 256x256 (Windows, Linux)
- 512x512 (High-resolution displays, app stores)

### Browser Support
- Chrome 67+
- Edge 79+
- Firefox 58+
- Safari 11.1+
- Mobile browsers with PWA support

## Testing Installation

To test the desktop installation:

1. **Development Mode**:
   - Remove the production check in `app/client/app.js`
   - Remove asset_host from `config/publisher.yml`
   - Run `npm run compile && npm start`

2. **Production Mode**:
   - The service worker is automatically enabled
   - All PWA features are active

3. **Installation Test**:
   - Open Chrome DevTools
   - Go to Application tab
   - Check "Manifest" and "Service Workers" sections
   - Verify all icons are loading correctly

## Customization

### Changing App Name
Update the `name` and `short_name` fields in `public/manifest.json`

### Changing Colors
Update `background_color` and `theme_color` in `public/manifest.json`

### Adding New Icons
1. Add icon files to `public/icons/`
2. Update the manifest.json icons array
3. Update browserconfig.xml if needed

### Modifying Install Prompt
Edit `public/js/install-prompt.js` to customize:
- Timing (currently 3 seconds)
- Styling
- Text content
- Behavior

## Troubleshooting

### Installation Not Working
1. Check if service worker is registered
2. Verify manifest.json is accessible
3. Ensure HTTPS is enabled (required for PWA)
4. Check browser console for errors

### Icons Not Showing
1. Verify icon files exist in `public/icons/`
2. Check file permissions
3. Clear browser cache
4. Verify manifest.json paths are correct

### Custom Prompt Not Appearing
1. Check if `beforeinstallprompt` event fires
2. Verify localStorage is working
3. Check for JavaScript errors in console
4. Ensure the script is loading correctly
