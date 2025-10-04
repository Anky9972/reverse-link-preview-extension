# Replace Screenshot Placeholders

This script helps you replace the placeholder screenshot files with your actual images.

## Quick Setup

1. **Save your screenshots** with these exact filenames in the `screenshots/` folder:
   - `preview-modal-9to5google.png` - The 9to5Google article preview 
   - `preview-modal-medium-llm.png` - The Medium LLM article preview
   - `settings-panel-medium.png` - The settings panel overlay
   - `options-page.png` - The full options page

2. **PowerShell Command** (run from project root):
```powershell
# Copy your screenshots to replace placeholders
Copy-Item "path\to\your\screenshot1.png" "screenshots\preview-modal-9to5google.png"
Copy-Item "path\to\your\screenshot2.png" "screenshots\preview-modal-medium-llm.png"  
Copy-Item "path\to\your\screenshot3.png" "screenshots\settings-panel-medium.png"
Copy-Item "path\to\your\screenshot4.png" "screenshots\options-page.png"
```

3. **Verify the images**:
```powershell
# Check file sizes (should be > 1KB for real images)
Get-ChildItem screenshots\*.png | Select-Object Name, Length
```

## Image Guidelines

- **Format**: PNG preferred for crisp UI elements
- **Size**: 1200x800 for modals, 1400x900 for full pages  
- **Quality**: High resolution for GitHub display
- **Content**: Show real usage on popular websites

## After Replacing

1. Remove the placeholder content from the files
2. Commit the real screenshots to git
3. Push to GitHub to see them in the README

## Automation Script

Save as `replace-screenshots.ps1`:

```powershell
param(
    [string]$SourceFolder = "."
)

$screenshots = @{
    "preview-modal-9to5google.png" = "9to5Google article preview"
    "preview-modal-medium-llm.png" = "Medium article preview" 
    "settings-panel-medium.png" = "Settings panel overlay"
    "options-page.png" = "Full options page"
}

foreach ($file in $screenshots.Keys) {
    $source = Join-Path $SourceFolder $file
    $dest = Join-Path "screenshots" $file
    
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "✅ Replaced $file - $($screenshots[$file])"
    } else {
        Write-Host "⚠️  Missing: $source"
    }
}

Write-Host "`n🎉 Screenshot replacement complete!"
Write-Host "📝 Remember to commit the changes to git"
```

Usage: `.\replace-screenshots.ps1 -SourceFolder "C:\path\to\your\screenshots"`