# Deslopifai

A Chrome extension that detects AI-generated content ("slop") on web pages using heuristic analysis.

## Features

### Core Detection (Free Tier)
- **Heuristic scoring**: Flags AI-telltale phrases ("delve," "tapestry," "it's important to note," "unlock the potential," etc.) weighted by density per word count
- **Structural signals**: Detects excessive bullet points, uniform sentence length, low lexical diversity
- **Visual indicators**: Subtle highlights or badges on flagged content

### Whitelist/Blacklist System
- Store trusted/blocked domains in chrome.storage.sync
- Domain check runs first—skip detection entirely for whitelisted sites, auto-flag blacklisted
- Right-click context menu: "Trust this site" / "Always flag this site"
- Per-article override: "Mark as human" / "Mark as AI"
- Stores user corrections with content hash for future learning

### UI Components
- **Popup**: Quick view of current site status, flagged count, trust/block toggles
- **Options page**: Manage domain lists, import/export settings, sensitivity slider
- **Content overlays**: Clickable badges showing detection score and details

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `Deslopifai` folder
5. The extension icon will appear in your toolbar

## Usage

- Browse any website - detection runs automatically
- Click the extension icon to see the current page status
- Use "Trust Site" to whitelist domains (detection skipped)
- Use "Block Site" to blacklist domains (auto-flagged)
- Click on any detection badge to see detailed scores
- Mark content as "Human" or "AI" to improve future detection

## Settings

Access via the extension popup → Settings link, or right-click extension icon → Options

- **Sensitivity**: 0-100 slider (50 = default)
- **Highlight Style**: Subtle, Prominent, or Badge Only
- **Domain Lists**: Manage trusted/blocked domains
- **Import/Export**: Backup and restore settings

## Premium Features (Coming Soon)

Stubs are in place for:
- LLM verification endpoint for ambiguous scores
- Community-curated lists sync
- Custom phrase lists

## Architecture

```
Deslopifai/
├── manifest.json          # Extension manifest (v3)
├── popup.html             # Extension popup UI
├── options.html           # Settings page
├── src/
│   ├── background.js      # Service worker (storage, context menus, badge)
│   ├── content.js         # DOM scanning, detection, overlays
│   ├── detector.js        # Detection engine (standalone module)
│   ├── storage.js         # Storage utilities (standalone module)
│   ├── popup.js           # Popup logic
│   └── options.js         # Options page logic
├── styles/
│   └── overlay.css        # Content overlay styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Detection Algorithm

The detection engine scores content based on:

1. **Phrase Analysis (0-40 points)**: Matches ~100 AI-telltale phrases with weighted scores
2. **Sentence Uniformity (0-20 points)**: Low variance in sentence length suggests AI
3. **Lexical Diversity (0-20 points)**: Low type-token ratio suggests AI
4. **Structural Patterns (0-20 points)**: Excessive bullets/numbered lists

Final score is adjusted by sensitivity setting and clamped to 0-100.

## License

MIT
