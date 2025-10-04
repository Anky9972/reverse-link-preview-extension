# UI Components for Link Preview Visual

## Core Preview Components

### 1. **PreviewModal.jsx** 
- **Location**: `src/components/content/PreviewModal.jsx`
- **Purpose**: Main container for the preview modal
- **Visual Elements**:
  - Header with title and close button
  - Content area with scrolling
  - Footer with control panel
  - Background, borders, shadows
- **Styling**: Uses Tailwind classes + `preview-modal` CSS class

### 2. **PreviewPositioner.jsx**
- **Location**: `src/components/content/PreviewPositioner.jsx`  
- **Purpose**: Handles positioning and viewport calculations
- **Visual Elements**:
  - Fixed positioning
  - Animation transitions (scale, opacity)
  - Z-index management
- **Styling**: Uses `fixed` positioning with transform animations

### 3. **ArticlePreview.jsx**
- **Location**: `src/components/previews/ArticlePreview.jsx`
- **Purpose**: Renders article-type content
- **Visual Elements**:
  - Title and headline
  - Main image with loading states
  - Description/summary text
  - Author, date, reading time metadata
  - Source favicon and URL
- **Styling**: Uses `article-preview`, `article-headline`, `article-summary` classes

## Content Type Components

### 4. **VideoPreview.jsx**
- **Location**: `src/components/previews/VideoPreview.jsx`
- **Purpose**: Video content (YouTube, etc.)
- **Visual Elements**:
  - Thumbnail with play button overlay
  - Video title and channel info
  - Duration, views, upload date
  - Channel avatar

### 5. **ProductPreview.jsx**
- **Location**: `src/components/previews/ProductPreview.jsx`
- **Purpose**: E-commerce products
- **Visual Elements**:
  - Product images gallery
  - Price and availability
  - Star ratings
  - Product name and description

### 6. **SocialPreview.jsx**
- **Location**: `src/components/previews/SocialPreview.jsx`
- **Purpose**: Social media posts
- **Visual Elements**:
  - User avatar and profile info
  - Post content and media
  - Interaction stats (likes, shares, etc.)
  - Platform-specific styling

### 7. **ImageGalleryPreview.jsx**
- **Location**: `src/components/previews/ImageGalleryPreview.jsx`
- **Purpose**: Image collections/galleries
- **Visual Elements**:
  - Grid of thumbnail images
  - Navigation controls
  - Image counter/pagination
  - Lightbox-style interaction

## UI Control Components

### 8. **ControlPanel.jsx**
- **Location**: `src/components/ui/ControlPanel.jsx`
- **Purpose**: Action buttons in modal footer
- **Visual Elements**:
  - Bookmark, share, citation buttons
  - Reading time indicator
  - Settings toggle
- **Styling**: Uses `control-panel`, `control-button` classes

### 9. **HoverProgressIndicator.jsx**
- **Location**: `src/components/ui/HoverProgressIndicator.jsx`
- **Purpose**: Loading progress during hover delay
- **Visual Elements**:
  - Progress bar animation
  - Loading text
  - Tooltip-style positioning
- **Styling**: Uses inline styles for reliability

### 10. **CustomizationStudio.jsx**
- **Location**: `src/components/ui/CustomizationStudio.jsx`
- **Purpose**: Theme and appearance settings
- **Visual Elements**:
  - Color pickers
  - Size controls
  - Live preview
  - Reset/apply buttons

### 11. **SettingsFoldout.jsx**
- **Location**: `src/components/ui/SettingsFoldout.jsx`
- **Purpose**: Quick settings panel
- **Visual Elements**:
  - Collapsible settings panel
  - Toggle switches
  - Slider controls
  - Theme picker

## CSS Classes for Styling

### Main Preview Styles (`content.css`)
```css
.preview-modal          // Main modal container
.preview-header         // Modal header area
.preview-content        // Scrollable content area
.preview-footer         // Footer/controls area
.preview-close-button   // Close button styling
```

### Article-Specific Styles
```css
.article-preview        // Article container
.article-image          // Main article image
.article-headline       // Article title
.article-summary        // Description text
.article-meta           // Metadata (author, date, etc.)
.article-meta-separator // Dots between metadata
```

### Product Styles
```css
.product-preview        // Product container
.product-gallery        // Image carousel
.product-info          // Product details
.product-price         // Price display
.product-rating        // Star ratings
.product-availability  // Stock status
```

### Video Styles
```css
.video-preview         // Video container
.video-thumbnail       // Video thumbnail
.video-play-button     // Play overlay
.video-title          // Video title
.video-metadata       // Views, duration, etc.
```

### Social Styles
```css
.social-preview        // Social post container
.social-header        // User info area
.social-avatar        // Profile picture
.social-content       // Post text
.social-stats         // Like/share counts
```

### Control/UI Styles
```css
.control-panel        // Footer controls
.control-button       // Action buttons
.loading-spinner      // Loading animations
.queue-item          // Preview queue items
```

## Customizable Theme Properties

### Color Scheme
- `backgroundColor`: Modal background color
- `textColor`: Primary text color  
- `accentColor`: Links and highlights
- `borderRadius`: Corner rounding
- `opacity`: Modal transparency

### Size Options
- `small`: 320px max width
- `medium`: 450px max width (default)
- `large`: 600px max width

### Animation Classes
- `animate-fadeIn`: Fade in animation
- `animate-slideIn`: Slide in from right
- `animate-scaleIn`: Scale up animation
- `animate-spin`: Loading spinner rotation

## Responsive Breakpoints
- **Mobile**: `max-width: 640px` - Compact layouts
- **Tablet**: `641px - 1024px` - Medium sizing
- **Desktop**: `1025px+` - Full-size previews

To customize the visual appearance, you can:
1. Edit the component files directly
2. Modify the CSS classes in `content.css`
3. Update theme variables in user preferences
4. Add new preview types by creating new components