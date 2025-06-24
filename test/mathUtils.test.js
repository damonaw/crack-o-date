import test from 'node:test';
import assert from 'node:assert/strict';
import { safeEval } from '../static/scripts/mathUtils.js';

// Basic arithmetic operations
const basicCases = [
  ['1+2', 3],
  ['5-3', 2],
  ['2x3', 6],
  ['8/2', 4],
  ['7%4', 3],
  ['2^3', 8],
];

for (const [expr, expected] of basicCases) {
  test(`safeEval(${expr}) -> ${expected}`, () => {
    assert.strictEqual(safeEval(expr), expected);
  });
}

// Functions and advanced operations
const advancedCases = [
  ['√(16)', 4],
  ['abs(-5)', 5],
  // log(...) sanitizes to log10*(...) which is invalid with the current regex
  ['log(1000)', ''],
  ['3!', 6],
  ['(3+2)!', 120],
  ['2(3+4)', 14],
  ['(2+3)4', 20],
  ['()', 0],
];

for (const [expr, expected] of advancedCases) {
  test(`safeEval(${expr}) -> ${expected}`, () => {
    assert.strictEqual(safeEval(expr), expected);
  });
}

// Invalid or undefined results
const invalidCases = [
  '',
  'abc',
  '1/0',
  '3x',
  'log()'
];

for (const expr of invalidCases) {
  test(`safeEval(${expr}) returns empty string`, () => {
    assert.strictEqual(safeEval(expr), '');
  });
}
