# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please email us at:

**security@yourdomain.com** (or create a private security advisory on GitHub)

### What to Include

Please include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-3 days
  - High: 1-2 weeks
  - Medium: 2-4 weeks
  - Low: Next release cycle

## Security Considerations

### Extension Permissions

This extension requests the following permissions:
- `storage` - Save user preferences locally
- `contextMenus` - Add right-click menu options
- `tabs` - Access tab information for previews
- `alarms` - Schedule cache cleanup
- `scripting` - Inject content scripts
- `<all_urls>` - Preview links on any website

### Data Privacy

- ✅ **No data collection** - We don't collect any user data
- ✅ **Local processing** - All content extraction happens locally
- ✅ **No tracking** - No analytics or tracking scripts
- ✅ **No external servers** - No data sent to third parties

### Content Security

- Shadow DOM isolation prevents CSS/JS conflicts
- Content fetching respects CORS policies
- Sanitization of extracted HTML content
- XSS prevention in preview rendering

## Best Practices for Contributors

When contributing code:
1. **Sanitize user input** - Always validate and sanitize
2. **Avoid `eval()`** - Never use eval or similar functions
3. **Use Content Security Policy** - Follow CSP guidelines
4. **Validate URLs** - Check URLs before fetching
5. **Escape HTML** - Prevent XSS in rendered content
6. **Secure storage** - Don't store sensitive data
7. **Review dependencies** - Check for known vulnerabilities

## Security Updates

Security fixes are released as soon as possible:
- Patch versions (1.0.x) for minor security issues
- Minor versions (1.x.0) for moderate security issues
- Documentation updates for security best practices

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities.

Security contributors will be acknowledged in:
- SECURITY.md credits section
- Release notes (with permission)
- Hall of fame (coming soon)
