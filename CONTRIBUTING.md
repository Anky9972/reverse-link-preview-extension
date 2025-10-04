# Contributing to Reverse Link Preview

First off, thank you for considering contributing to Reverse Link Preview! It's people like you that make this extension better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Google Chrome (for testing)
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/reverse-link-preview.git
   cd reverse-link-preview
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/reverse-link-preview.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build and test**:
   ```bash
   npm run build
   ```
6. **Load in Chrome** to verify everything works

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Detailed step-by-step
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Environment details**:
  - Chrome version
  - Operating System
  - Extension version
  - Website URL (if specific to a site)

**Example:**
```
Title: Preview modal doesn't close on ESC key

Steps to reproduce:
1. Hover over any link
2. Wait for preview to appear
3. Press ESC key

Expected: Modal should close
Actual: Modal stays open
Environment: Chrome 120, Windows 11, Extension v1.0.0
```

### Suggesting Enhancements

We love new ideas! Before suggesting enhancements:

1. **Check existing feature requests** in Discussions
2. **Ensure it aligns** with the project's goals
3. **Describe the use case** - Why is this needed?
4. **Propose implementation** - How might it work?

**Enhancement template:**
```
**Problem**: Users want to preview links without hovering

**Proposed Solution**: Add keyboard shortcut to trigger preview on focused link

**Benefits**: 
- Better accessibility
- Power user efficiency
- Reduced accidental hovers

**Implementation Ideas**:
- Use Alt+P as shortcut
- Highlight focused link
- Show preview anchored to link
```

### Your First Contribution

Not sure where to start? Look for issues labeled:

- `good first issue` - Simple, well-defined tasks
- `help wanted` - Tasks that need contributors
- `documentation` - Improve docs and guides
- `design` - UI/UX improvements

### Pull Requests

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing patterns
   - Update documentation

3. **Test thoroughly**:
   - Test on multiple websites
   - Try different content types
   - Check keyboard navigation
   - Verify in light/dark themes
   - Test on large/small screens

4. **Update documentation**:
   - Update README if adding features
   - Add JSDoc comments to functions
   - Update UI_COMPONENTS_GUIDE if adding components

5. **Commit your changes**:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**

---

## Development Process

### Branch Strategy

- `main` - Stable, production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Workflow

1. **Sync with upstream**:
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

2. **Create feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Develop and commit** regularly

4. **Keep branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

5. **Push and create PR**

### Testing Your Changes

#### Manual Testing Checklist

- [ ] Build succeeds without errors: `npm run build`
- [ ] Extension loads in Chrome without errors
- [ ] Previews appear on hover
- [ ] All content types render correctly (article, video, product, etc.)
- [ ] Keyboard shortcuts work
- [ ] Settings page functions properly
- [ ] Dark/light themes work
- [ ] Mobile viewport simulation works
- [ ] No console errors
- [ ] Performance is acceptable

#### Test Sites for Different Content Types

- **Articles**: nytimes.com, medium.com, dev.to
- **Videos**: youtube.com, vimeo.com
- **Products**: amazon.com, etsy.com
- **Social**: twitter.com, reddit.com
- **Images**: unsplash.com, imgur.com

---

## Style Guidelines

### JavaScript/React

- Use **functional components** with hooks
- Prefer **const** over let, never use var
- Use **meaningful variable names**: `previewData` not `data`
- Use **destructuring** where appropriate
- Use **optional chaining**: `user?.profile?.name`
- Add **PropTypes** or TypeScript types (future)

**Good:**
```javascript
const ArticlePreview = ({ data, isDetailed }) => {
  const { title, description, publishDate } = data;
  const readingTime = calculateReadingTime(data.content);
  
  return (
    <article className="article-preview">
      <h1>{title}</h1>
      {readingTime && <span>{readingTime} min read</span>}
    </article>
  );
};
```

**Bad:**
```javascript
function ArticlePreview(props) {
  var t = props.data.title;
  let d = props.data.description;
  
  return (
    <article>
      <h1>{t}</h1>
    </article>
  );
}
```

### CSS/Tailwind

- Use **Tailwind classes** first
- Custom CSS only when necessary
- Use **semantic class names**: `.preview-modal` not `.pm`
- Follow **BEM naming**: `.preview-modal__header`
- Keep **specificity low** to avoid conflicts
- Use **CSS variables** for theme colors

### File Organization

- One component per file
- File name matches component name
- Group related files in folders
- Export from index.js for cleaner imports

```
components/
  previews/
    ArticlePreview.jsx
    VideoPreview.jsx
    index.js  // Export all preview components
```

### Code Comments

- **Why**, not what - Code should be self-explanatory
- JSDoc for functions:
  ```javascript
  /**
   * Calculates estimated reading time based on word count
   * @param {string} content - The article content
   * @param {number} wpm - Words per minute (default: 200)
   * @returns {number} Reading time in minutes
   */
  const calculateReadingTime = (content, wpm = 200) => {
    // Implementation
  };
  ```

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding tests
- `chore` - Build process, dependencies

### Examples

**Feature:**
```
feat(preview): add video preview support

- Detect video content from meta tags
- Extract thumbnail, duration, channel info
- Add VideoPreview component
- Update content type detector

Closes #42
```

**Bug Fix:**
```
fix(positioning): prevent preview from appearing off-screen

The preview modal was sometimes positioned outside viewport
on smaller screens. Updated position calculator to check
viewport boundaries and adjust placement accordingly.

Fixes #38
```

**Documentation:**
```
docs(readme): add troubleshooting section

Added common issues and solutions based on user reports
in issues #15, #22, and #31
```

---

## Pull Request Process

### Before Submitting

1. ✅ **Code builds** without errors
2. ✅ **All tests pass** (when tests are added)
3. ✅ **No console errors** in browser
4. ✅ **Documentation updated** if needed
5. ✅ **Commits are clean** and well-formatted
6. ✅ **Branch is up-to-date** with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] Code builds successfully
- [ ] Tested on multiple websites
- [ ] Documentation updated
- [ ] No console errors
- [ ] Follows code style guidelines
```

### Review Process

1. **Automated checks** run (linting, build)
2. **Maintainer review** - Usually within 2-3 days
3. **Feedback addressed** - Make requested changes
4. **Approval** - PR is approved
5. **Merge** - Changes merged to main

### After Merge

- Your contribution will be in the next release
- You'll be added to contributors list
- Close any related issues

---

## Recognition

All contributors will be recognized in:
- README contributors section
- Release notes
- Project website (future)

Thank you for contributing! 🎉

---

## Questions?

- Open a [Discussion](https://github.com/yourusername/reverse-link-preview/discussions)
- Check the [Wiki](https://github.com/yourusername/reverse-link-preview/wiki)
- Contact maintainers

**Happy Contributing!** 🚀
