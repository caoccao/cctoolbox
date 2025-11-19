# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

CCToolbox is a collection of small open source tools written by Sam Cao, containing multiple independent projects:

### Rust Projects (Native Tools)
- **touch** - Touch command for Windows (recreates Linux touch functionality)
- **uptime** - Uptime command for Windows
- **simple-message-box (smbox)** - Cross-platform GUI message box for console automation

### TypeScript/React Project
- **web-tools** - React-based web application with tools like "Grep It" and "Srt Sync"

### Other Tools
- **hide-volume-osd** - Windows volume OSD visibility tool
- **pku-check** - Linux kernel Memory Protection Keys availability checker

## Development Commands

### Rust Projects (touch, uptime, simple-message-box)
```bash
# Build any Rust project
cd <project-directory>
cargo build --release

# For simple-message-box specifically, first checkout druid dependency:
cd ..
git clone https://github.com/linebender/druid.git
cd simple-message-box
RUSTFLAGS="-Awarnings" cargo build --release
```

### Web Tools (React + Vite)
```bash
cd web-tools

# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Type checking
pnpm run check

# Linting and formatting
pnpm run lint
pnpm run format

# Testing
pnpm run test
```

## Architecture Notes

### Rust Projects Structure
- Each Rust project is self-contained with its own `Cargo.toml`
- All use `clap` for command-line argument parsing
- **simple-message-box** has external dependency on druid GUI framework (requires manual checkout)
- All tools are designed as native Windows replacements for Linux utilities

### Web Tools Architecture
- React application using TypeScript and Vite
- Uses Material-UI (MUI) component library (`@mui/material`)
- Path-based routing with React Router DOM
- Two main tools implemented as separate React components:
  - `GrepIt.tsx` - JavaScript regex tool with template generation
  - `SrtSync.tsx` - Subtitle file timeline synchronization with native MUI Table
- Component structure:
  - `Layout.tsx` - Header, footer, and tab navigation
  - `types/srt.ts` - SRT data models (SrtLine, SrtMarker, Velocity classes)
  - `utils/srtParser.ts` - SRT parsing utilities
- Static site generation for GitHub Pages deployment

### Build Automation
- GitHub Actions workflows for each project:
  - `build_smbox.yml` - Cross-platform builds (Windows, Linux, macOS x86_64/ARM64)
  - `build_touch.yml`, `build_uptime.yml` - Platform-specific builds
  - `build_web_tools.yml` - React build and GitHub Pages deployment
- All Rust builds use `RUSTFLAGS="-Awarnings"` to suppress warnings

## Important Dependencies

### External Dependencies
- **simple-message-box** requires druid framework to be cloned at `../druid/`
- **web-tools** uses pnpm as package manager (not npm)

### Key Libraries
- Rust: `clap`, `chrono`, `filetime` (touch), `druid` (simple-message-box)
- Web: React, React Router DOM, Material-UI (MUI), TypeScript, Vite, Vitest

## Development Notes

- Each project maintains independent versioning (currently all at 0.1.0)
- All code follows Apache License 2.0
- Cross-platform compatibility is a key design goal for Rust tools
- Web tools are designed for static deployment without backend dependencies