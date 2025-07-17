# Crack-O-Date

A fun mathematical puzzle web game where players use today's date digits to create equal equations!

## How to Play

1. **Today's Date**: The digits from today's date (MM/DD/YYYY format) are displayed at the top
2. **Operators**: Common math operators are available: +, -, ×, /, mod, pow, abs, √, ( )
3. **Create Equations**: Drag and drop numbers and operators to create equations on both sides
4. **Make Them Equal**: The goal is to make both sides of the equation equal
5. **Score Points**: Submit when both sides are equal to earn points!

## Scoring System

- **1 point**: When both sides of the equation are equal
- **2 points**: When sides are equal AND all date digits are used
- **3 points**: When sides are equal, all digits are used, AND they're used in order
- **Bonus**: +1 point for each operator used

## Features

- **Mobile-Friendly**: Responsive design that works on all device sizes
- **Touch Support**: Full touch and drag support for mobile devices
- **Interactive**: Multiple ways to add elements:
  - Drag and drop from palette to equation
  - Click to select input area, then click numbers/operators
  - Drag elements within equations to rearrange
  - Click elements in equations to remove them
- **Real-time Evaluation**: Equations are evaluated as you build them
- **Visual Feedback**: Clear indication of equal/unequal states

## Controls

- **Clear**: Remove all elements from both sides (available when elements are present)
- **Submit**: Submit the equation for points (available when both sides are equal)

## Technical Details

Built with vanilla HTML, CSS, and JavaScript. Uses:
- CSS Grid and Flexbox for responsive layout
- HTML5 Drag and Drop API
- Touch event handling for mobile devices
- Modern JavaScript features (ES6+)

## Files

- `index.html`: Main game interface
- `styles.css`: Responsive styling and animations
- `script.js`: Game logic, drag-and-drop, and evaluation system

## Getting Started

Simply open `index.html` in a web browser to start playing!

## Browser Compatibility

Works in all modern browsers including:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers

## Future Enhancements

Potential features to add:
- High score tracking
- Different difficulty levels
- Multiplayer mode
- Daily challenges
- More mathematical functions
- Hint system
- Undo/redo functionality