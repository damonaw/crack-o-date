# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Crack-O-Date is a daily math puzzle web application where users create equations using the digits from today's date. The app validates that all date numbers are used in order and both sides of the equation are equal.

## Architecture

This is a full-stack TypeScript application with:

- **Client**: React SPA with TypeScript, React Router, and custom CSS
- **Server**: Express.js API with TypeScript, SQLite database
- **Core Logic**: Date parsing utilities and mathematical expression parser/validator

### Key Components

**Date Processing (`client/src/utils/dateUtils.ts`)**:
- Parses current date into individual digits (e.g., 7/18/2025 → [7,1,8,2,0,2,5])
- Handles timezone and date format normalization
- Supports historical date parsing for past puzzle attempts

**Math Parser (`client/src/utils/mathParser.ts`)**:
- Validates mathematical expressions using recursive descent parsing
- Enforces date number usage rules (all numbers, in order, exactly once)
- Calculates scores based on operator complexity: basic (+,-) = 1pt, intermediate (*,/) = 2pts, advanced (^,sqrt,abs,mod) = 3pts
- Returns detailed validation results including left/right values and errors

**UI Structure**:
- `GamePage`: Main puzzle interface with date display, equation input, and validation
- `LoginPage`: User authentication (authentication system not yet implemented)
- `ProfilePage`: Solution history and user statistics with math textbook formatting
- `MathDisplay`: KaTeX-powered component for rendering mathematical equations in textbook format
- `SolutionHistory`: Component displaying solutions with proper mathematical notation

## Development Commands

### Client (React)
```bash
cd client
npm start          # Development server (http://localhost:3000)
npm run build      # Production build
npm test           # Run tests
```

### Server (Express)
```bash
cd server
npm run dev        # Development server with auto-reload (port 3001)
npm run build      # Compile TypeScript to JavaScript
npm start          # Production server (requires build first)
npm test           # Run tests
```

## Core Game Rules

1. **Date Numbers**: All digits from today's date must be used exactly once
2. **Order Constraint**: Numbers must appear in the equation in the same order as the date
3. **Equation Balance**: Left side must equal right side mathematically
4. **Scoring**: Points awarded based on operator complexity (parentheses don't affect score)
5. **Historical Play**: Past dates can be solved but are marked as retroactive and don't count toward averages

## Database Schema (Planned)

The application will use SQLite with:
- `users` table for authentication
- `solutions` table linking users to their equation solutions
- `dates` table for tracking puzzle dates and metadata

## Authentication System

User authentication is planned but not yet implemented. The current structure includes:
- Login/signup UI components
- JWT token handling preparation in server dependencies
- User session management placeholders

## Mathematical Notation

The app uses KaTeX for rendering mathematical equations in textbook format:
- **MathDisplay Component**: Converts standard notation to LaTeX and renders with KaTeX
- **Operator Conversion**: `*` → `⋅`, `/` → `÷`, `sqrt()` → `√`, `abs()` → `|x|`, `mod` → `mod`
- **Error Handling**: Graceful fallback to plain text if KaTeX rendering fails
- **Styling**: Textbook-style formatting with proper spacing and typography

## Testing Strategy

The math parser and date utilities contain the core business logic and should be thoroughly tested. React components use standard Create React App testing setup with Jest and React Testing Library.