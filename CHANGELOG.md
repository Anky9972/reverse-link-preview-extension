# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Firefox extension port
- Offline mode with service worker caching
- PDF preview support
- Collections feature for saving previews

---

## [1.0.0] - 2025-10-04

### 🎉 Initial Release

The first stable release of Reverse Link Preview!

### Added

#### Core Features
- **Smart Link Previews** - Hover over any link to see rich content preview
- **Multi-Content Support** - Articles, videos, products, social posts, images
- **Intelligent Detection** - JSON-LD, Open Graph, Twitter Cards, semantic HTML parsing
- **Shadow DOM Rendering** - Isolated styles prevent conflicts with host pages

#### UI Components
- **PreviewModal** - Professional two-column layout inspired by NDTV design
- **ArticlePreview** - Clean newspaper-style article rendering
- **VideoPreview** - YouTube/Vimeo with thumbnails and metadata
- **ProductPreview** - E-commerce items with pricing and ratings
- **SocialPreview** - Social media posts with engagement metrics
- **ImageGalleryPreview** - Photo collections with grid layouts

#### User Experience
- **Hover Progress Indicator** - Visual feedback during content loading
- **Smart Positioning** - Auto-adjusts to viewport boundaries
- **Keyboard Shortcuts** - Full keyboard navigation support
- **Loading Animations** - Smooth scale, fade, and slide transitions
- **Loading Skeletons** - Beautiful placeholder states

#### Customization
- **Themes** - Light, Dark, and Auto modes
- **Preview Sizing** - Small, Medium, Large options
- **Custom Colors** - Background, text, and accent customization
- **Opacity Control** - Adjustable modal transparency
- **Hover Delay** - Configurable 0-2000ms delay

#### Advanced Features
- **Citation Generator** - APA, MLA, Chicago formats
- **Reading Time** - Automatic estimation based on word count
- **Content Caching** - LRU cache with TTL for performance
- **CORS Fallback** - Graceful degradation when direct fetch fails
- **Error Recovery** - Retry mechanisms with exponential backoff

#### Developer Features
- **React 19** - Modern functional components with hooks
- **Vite 6.2** - Lightning-fast build tool
- **Tailwind CSS 4** - Utility-first styling
- **Lucide Icons** - Beautiful, consistent iconography
- **Chrome Manifest V3** - Latest extension standards

### Fixed
- Extension context invalidation errors
- CORS policy violations
- Modal positioning off-screen issues
- CSS conflicts with host pages
- Memory leaks in content scripts
- React rendering errors
- Storage quota management

### Security
- Shadow DOM isolation
- HTML sanitization
- XSS prevention
- CORS respect
- No data collection
- Local-only processing

---

## Development Versions

### [0.9.0] - 2025-09-28 (Beta)
- Beta testing with core features
- UI refinements based on feedback
- Performance optimizations

### [0.5.0] - 2025-09-15 (Alpha)
- Alpha release for internal testing
- Basic preview functionality
- Initial content detection

### [0.1.0] - 2025-09-01 (Prototype)
- Proof of concept
- Basic hover detection
- Simple modal rendering

---

## Version Format

- **Major** (1.x.x) - Breaking changes, major features
- **Minor** (x.1.x) - New features, non-breaking changes
- **Patch** (x.x.1) - Bug fixes, minor improvements

## Types of Changes

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements

---

[Unreleased]: https://github.com/yourusername/reverse-link-preview/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/reverse-link-preview/releases/tag/v1.0.0
