<div align="center">

# 🔗 Reverse Link Preview

### Smart Link Previews for Every Website

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen?logo=google-chrome&logoColor=white)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/reverse-link-preview)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)

**Instantly preview any link with beautiful, intelligent content extraction**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Development](#-development) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Reverse Link Preview** is a powerful Chrome extension that revolutionizes how you browse the web. Hover over any link to instantly see a rich preview with intelligent content extraction, multiple content type support, and a beautiful, customizable interface inspired by professional news platforms like NDTV.

### ✨ What Makes It Special?

- 🎯 **Universal Compatibility** - Works on any website with any link
- 🧠 **Intelligent Extraction** - Detects articles, videos, products, social posts, and images
- 🎨 **Beautiful Design** - Clean, professional UI with dark/light themes
- ⚡ **Lightning Fast** - Smart caching and optimized performance
- 🛡️ **Privacy First** - All processing happens locally, no data collection
- 🎛️ **Fully Customizable** - Tailor every aspect to your preferences

---

## 🚀 Features

### Core Functionality

#### 🔍 Smart Content Detection
- **Articles** - News, blogs, and editorial content with clean typography
- **Videos** - YouTube, Vimeo with thumbnails, duration, and channel info
- **Products** - E-commerce items with pricing, ratings, and availability
- **Social Media** - Twitter/X, Facebook posts with engagement metrics
- **Image Galleries** - Photo collections with grid layouts

#### 💫 Advanced Features

- **Hover Progress Indicator** - Visual feedback during content loading
- **Reading Time Estimation** - Automatic calculation based on word count
- **Citation Generator** - Create properly formatted citations (APA, MLA, Chicago)
- **Keyboard Shortcuts** - Navigate and control previews without a mouse
- **Responsive Positioning** - Smart placement that adapts to viewport boundaries
- **Content Caching** - Faster subsequent previews for visited links
- **CORS Fallback** - Graceful degradation when direct fetching fails

### User Interface

#### 🎨 Customization Studio
- **Themes** - Light, Dark, and Auto modes
- **Colors** - Custom background, text, and accent colors
- **Sizing** - Small, Medium, Large preview dimensions
- **Opacity** - Adjust modal transparency
- **Animations** - Enable/disable transitions and effects

#### ⚙️ Control Panel
- **Quick Actions** - Bookmark, Share, Copy, Open in new tab
- **Info Badges** - Views, comments, reading time, publish date
- **Settings Foldout** - Inline customization without leaving the page
- **Tutorial Overlay** - First-time user guidance

---

## 📦 Installation

### For Users (Chrome Web Store)

1. Visit the [Chrome Web Store](#) (Coming Soon)
2. Click **Add to Chrome**
3. Confirm permissions
4. Start hovering over links!

### For Developers (Local Installation)

#### Prerequisites
- **Node.js** 18+ and npm
- **Google Chrome** or any Chromium-based browser
- **Git** (optional)

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/reverse-link-preview.git
cd reverse-link-preview

# Install dependencies
npm install

# Build the extension
npm run build

# The extension is now in the 'dist' folder
```

#### Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dist` folder from the project directory
5. The extension icon should appear in your toolbar!

---

## 🎯 Usage

### Basic Usage

1. **Hover** over any link on any webpage
2. **Wait** 300ms (customizable delay)
3. **Preview** appears with rich content
4. **Move away** to close, or click the X button

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Hover + Hold` | Show preview |
| `Esc` | Close preview |
| `Ctrl + Shift + P` | Toggle preview mode |
| `Ctrl + Click` | Open in new tab (bypass preview) |

### Customization

1. Click the **extension icon** in toolbar
2. Select **Options** or right-click → Options
3. Customize:
   - Hover delay (0-2000ms)
   - Preview size (Small/Medium/Large)
   - Theme (Light/Dark/Auto)
   - Enable/disable specific content types
   - Keyboard shortcuts
   - Animation preferences

### Advanced Features

#### Citation Generator
1. Open any preview
2. Click **Citation** button in control panel
3. Choose format (APA, MLA, Chicago)
4. Copy to clipboard

#### Content Filtering
- **Blacklist domains** - Prevent previews on specific sites
- **Content type filters** - Show only articles, videos, etc.
- **Minimum content length** - Skip previews for short snippets

---

## 🛠️ Development

### Project Structure

```
reverse-link-preview/
├── src/
│   ├── components/
│   │   ├── content/          # Core preview components
│   │   │   ├── PreviewModal.jsx
│   │   │   ├── PreviewPositioner.jsx
│   │   │   ├── ContentExtractor.jsx
│   │   │   └── LinkPreview.jsx
│   │   ├── previews/         # Content type renderers
│   │   │   ├── ArticlePreview.jsx
│   │   │   ├── VideoPreview.jsx
│   │   │   ├── ProductPreview.jsx
│   │   │   ├── SocialPreview.jsx
│   │   │   └── ImageGalleryPreview.jsx
│   │   └── ui/               # UI controls
│   │       ├── ControlPanel.jsx
│   │       ├── CustomizationStudio.jsx
│   │       ├── HoverProgressIndicator.jsx
│   │       └── SettingsFoldout.jsx
│   ├── context/              # React Context providers
│   │   ├── PreferenceContext.jsx
│   │   └── PreviewContext.jsx
│   ├── services/             # Core business logic
│   │   ├── previewGenerator.js
│   │   ├── schemaDetector.js
│   │   ├── contentProcessing/
│   │   │   ├── fetchService.js
│   │   │   ├── domParser.js
│   │   │   ├── imageProcessor.js
│   │   │   └── textSummarizer.js
│   │   └── userPreferences.js
│   ├── utils/                # Utility functions
│   │   ├── citationGenerator.js
│   │   ├── contentTypeDetector.js
│   │   ├── keyboardManager.js
│   │   ├── positionCalculator.js
│   │   └── urlValidator.js
│   └── pages/
│       ├── background/       # Service worker
│       ├── popup/            # Extension popup
│       └── options/          # Settings page
├── public/
│   ├── manifest.json         # Extension manifest
│   └── icons/                # Extension icons
├── dist/                     # Build output (gitignored)
└── docs/                     # Documentation
```

### Tech Stack

- **Frontend**: React 19, Tailwind CSS 4
- **Build Tool**: Vite 6.2
- **Icons**: Lucide React
- **Manifest**: Chrome Extension Manifest V3
- **Styling**: Shadow DOM + Tailwind CSS
- **State Management**: React Context API

### Build Scripts

```bash
# Development mode (watch for changes)
npm run dev

# Production build
npm run build

# Build individual parts
npm run build:main      # Build popup and options pages
npm run build:content   # Build content script
npm run copy:assets     # Copy static assets

# Linting
npm run lint
```

### Architecture Highlights

#### Shadow DOM Isolation
All preview modals render in Shadow DOM to prevent CSS conflicts with host pages:

```javascript
const shadowRoot = container.attachShadow({ mode: 'open' });
ReactDOM.createRoot(shadowRoot).render(<PreviewModal />);
```

#### Smart Content Detection
Multi-layered detection strategy:

1. **JSON-LD Schema** - Structured data parsing
2. **Open Graph** - Social media meta tags
3. **Twitter Cards** - Twitter-specific metadata
4. **HTML5 Semantic** - Article, video, product elements
5. **DOM Analysis** - Fallback content extraction

#### Performance Optimization

- **Lazy Loading** - Components loaded on-demand
- **Memoization** - React.memo for expensive renders
- **Debounced Hover** - Configurable delay prevents unnecessary fetches
- **Cache Strategy** - LRU cache with TTL for preview data
- **Image Optimization** - Lazy loading with progressive enhancement

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or design enhancements.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed
4. **Test thoroughly**
   - Test on multiple websites
   - Check different content types
   - Verify keyboard navigation
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Include screenshots for UI changes

### Development Guidelines

- **Code Style**: Follow existing patterns, use meaningful variable names
- **React Best Practices**: Functional components, hooks, proper prop-types
- **Performance**: Profile before optimizing, avoid premature optimization
- **Accessibility**: Ensure ARIA labels, keyboard navigation, screen reader support
- **Browser Compatibility**: Test on Chrome, Edge, Brave

### Reporting Issues

Found a bug? Have a feature request?

1. Check [existing issues](https://github.com/yourusername/reverse-link-preview/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots or screen recordings
   - Browser version and OS

---

## 📋 Roadmap

### Version 1.1 (Planned)
- [ ] Firefox extension port
- [ ] Edge/Safari compatibility
- [ ] Offline mode with service worker caching
- [ ] PDF preview support
- [ ] Enhanced video player embed

### Version 1.2 (Future)
- [ ] Collections - Save favorite previews
- [ ] Sync settings across devices
- [ ] Advanced filtering rules
- [ ] Custom preview templates
- [ ] Analytics dashboard (privacy-preserving)

### Community Requests
See [Feature Requests](https://github.com/yourusername/reverse-link-preview/discussions) for community-driven ideas!

---

## 🐛 Troubleshooting

### Common Issues

#### Previews not appearing
- Check if extension is enabled in `chrome://extensions/`
- Verify hover delay isn't too long in settings
- Check browser console for errors

#### Content not loading
- Some sites block CORS requests (expected behavior)
- Extension will show fallback metadata
- Try enabling "Fetch through background" in settings

#### Styling looks broken
- Clear browser cache and reload
- Ensure Shadow DOM is supported (Chrome 53+)
- Check for conflicting extensions

#### Performance issues
- Reduce preview size in settings
- Disable animations
- Clear cache in extension options
- Check CPU usage - some sites have heavy pages

### Debug Mode

Enable debug logging:
1. Open extension options
2. Toggle **Debug Mode**
3. Check browser console for detailed logs

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
✅ **Commercial use** - Use in commercial projects  
✅ **Modification** - Modify and adapt the code  
✅ **Distribution** - Distribute freely  
✅ **Private use** - Use privately  
⚠️ **Liability** - Provided "as is" without warranty  
⚠️ **License notice** - Must include license in distributions

---

## 🙏 Acknowledgments

### Built With

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Icon library
- [Mozilla Readability](https://github.com/mozilla/readability) - Article extraction

### Inspiration

- **NDTV News** - Design inspiration for article previews
- **Twitter Cards** - Link preview concept
- **Arc Browser** - Hover interaction patterns

### Contributors

Thanks to all contributors who help make this project better!

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- This section is auto-generated, do not edit manually -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

---

## 📞 Contact & Support

### Get Help
- 📚 [Documentation](https://github.com/yourusername/reverse-link-preview/wiki)
- 💬 [Discussions](https://github.com/yourusername/reverse-link-preview/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/reverse-link-preview/issues)

### Stay Connected
- ⭐ Star this repo to show support
- 👀 Watch for updates
- 🍴 Fork to create your own version

### Author
Created with ❤️ by [Your Name](https://github.com/yourusername)

---

<div align="center">

**If you find this project useful, please consider giving it a ⭐!**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/reverse-link-preview?style=social)](https://github.com/yourusername/reverse-link-preview/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/reverse-link-preview?style=social)](https://github.com/yourusername/reverse-link-preview/network/members)

</div>
