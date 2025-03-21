# Crack-O-Date

Crack-O-Date is a fun and educational math puzzle game where you create equations using today's date digits and various operators. The goal is to make both sides of the equation equal.

## Table of Contents

- [Features](#features)
- [How to Play](#how-to-play)
- [Operators](#operators)
- [Scoring](#scoring)
- [Installation](#installation)

## Features

- Uses today's date digits to create mathematical puzzles
- Real-time equation evaluation
- Wide range of mathematical operators
- Point-based scoring system
- Interactive UI with visual feedback
- Error checking and validation

## How to Play

1. The game displays today's date and provides its digits as buttons
2. You must use the date digits in the order they appear
3. Click on a side (left or right) of the equation to make it active
4. Add numbers and operators to build your equation
5. Create an equation where both sides are equal
6. Use all numbers from the date
7. Click "Check" to verify your solution
8. Click "Clear" to start over

## Operators

The game includes various operators with different point values:

### Basic Operators (1-2 points)
- `+` Addition (1 point)
- `-` Subtraction (1 point)
- `*` Multiplication (2 points)
- `/` Division (2 points)
- `%` Modulo (2 points)

### Advanced Operators (3 points)
- `^` Power/Exponent
- `√` Square Root
- `|` Bitwise OR
- `&` Bitwise AND

### Function Operators (4 points)
- `abs()` Absolute Value
- `log()` Base-10 Logarithm
- `!` Factorial

### Grouping
- `(` `)` Parentheses (for order of operations)

## Scoring

Points are awarded based on the operators used in your solution:
- Basic arithmetic (`+`, `-`): 1 point each
- Basic operations (`*`, `/`, `%`): 2 points each
- Advanced operators (`^`, `√`, `|`, `&`): 3 points each
- Functions (`abs`, `log`, `!`): 4 points each

The total score is the sum of points from both sides of the equation.

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/crack-o-date.git
    ```
2. Open `index.html` in your web browser to start playing

## Examples

Valid equations might look like:
- `√16 = 2^2`
- `5! = 120`
- `abs(-25) = 5^2`
- `log(100) = 2^(3&1)`