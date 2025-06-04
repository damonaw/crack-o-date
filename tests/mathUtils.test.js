const { create, all } = require('mathjs');

let safeEval;

beforeAll(async () => {
  global.math = create(all, {});
  ({ safeEval } = await import('../static/scripts/mathUtils.js'));
});

describe('safeEval', () => {
  test('evaluates simple expressions', () => {
    expect(safeEval('2+3')).toBe(5);
    expect(safeEval('10-7')).toBe(3);
  });

  test('supports custom operators', () => {
    expect(safeEval('5!')).toBe(120);
    expect(safeEval('log(100)')).toBe(2);
  });

  test('returns empty string for invalid expressions', () => {
    expect(safeEval('2+')).toBe('');
    expect(safeEval('(')).toBe('');
  });
});
