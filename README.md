# DiskMate - Professional Mac Disk Cleanup Tool

DiskMate is a professional-grade macOS disk cleanup tool built with Tauri 2 + React. It offers six core features: system cache cleanup, large file scanning, duplicate file detection, app uninstall leftovers, Trash cleanup, and disk usage visualization.

## Tech Stack

- Frontend: React 18 + TypeScript + Vite 5 + Tailwind CSS 3 + Zustand
- Backend: Rust + Tauri 2 (walkdir / sha2 / trash / sysinfo / tokio)

## Features

| Module | Description |
|------|------|
| Dashboard | Disk overview donut chart, health score, smart scan, quick access to all 6 modules |
| System Cache Cleanup | Scans ~/Library/Caches and Logs, deletes grouped by app |
| Large File Scan | Configurable threshold (50MB-1GB), list view with details |
| Duplicate File Detection | Three-stage hashing algorithm (size → partial → full SHA256) |
| App Uninstall Leftovers | Scans Application Support/Preferences/Caches/Logs/Saved State |
| Trash Cleanup | Shows occupied size, one-click safe empty |
| Disk Usage Visualization | Treemap + details panel |

## Security Design

- All deletions go through the trash crate to the Trash, so files can be recovered
- Destructive actions (empty Trash, uninstall apps) require a second confirmation

## Development

```bash
npm install
npm run tauri dev
npm run tauri build
```

## System Requirements

- macOS 12+
- Node.js 18+
- Rust 1.70+
