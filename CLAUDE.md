# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a vanilla web application with no build process. To run the game:

```bash
# Serve locally using any web server
python3 -m http.server 8000
# OR
npx serve .
# OR simply open index.html in a browser
```

## Architecture Overview

Crack-O-Date is a mathematical puzzle game built with vanilla HTML, CSS, and JavaScript. The application follows a class-based architecture pattern:

### Core Components

- **CrackODate class** (`script.js:1-894`): Main game controller that manages all game state and interactions
- **Date Processing** (`script.js:32-103`): Extracts and displays today's date digits using local timezone handling
- **Drag & Drop System** (`script.js:309-496`): Implements both desktop drag-and-drop and touch support for mobile
- **Equation Evaluation** (`script.js:559-636`): Builds and safely evaluates mathematical expressions using Function constructor
- **Scoring System** (`script.js:707-743`): Calculates points based on operators used and advanced mode bonus

### Game Mechanics

The game requires players to:
1. Use ALL date digits in the exact order they appear (enforced by `checkDigitsInOrder()`)
2. Create equal mathematical expressions on both sides
3. Submit only when both sides equal and all digits are used in order

### UI Features

- **Theme System**: Dark/light mode toggle with localStorage persistence
- **Advanced Mode**: Hides real-time results for added challenge
- **Responsive Design**: Mobile-first CSS with touch-friendly interactions
- **Modal System**: Informational popups for rules and scoring

### Key Implementation Details

- **Safe Expression Evaluation**: Uses Function constructor instead of eval for security
- **Touch Support**: Custom touch event handlers for mobile drag-and-drop (`script.js:897-961`)
- **Local Storage**: Persists theme and mode preferences
- **CSS Variables**: Theme system using CSS custom properties for easy color management

### File Structure

- `index.html`: Complete game interface with semantic HTML structure
- `script.js`: Single-file application logic (894 lines)
- `styles.css`: Comprehensive styling with CSS Grid/Flexbox and responsive design
- `README.md`: User-facing documentation and gameplay instructions

## Development Notes

- No dependencies or build tools required
- All code is vanilla JavaScript (ES6+)
- Mobile-optimized with touch event handling
- Uses modern CSS features (CSS Grid, custom properties, flexbox)
- Expression evaluation is contained and safe (no arbitrary code execution)