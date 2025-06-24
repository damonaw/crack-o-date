import { create, all } from 'mathjs';

const math = create(all);

math.import({
  factorial: n => {
    n = Number(n);
    if (!Number.isInteger(n) || n < 0) return NaN;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }
}, { override: true });

export function safeEval(expression) {
  if (!expression) return '';
  try {
    const cleaned = sanitize(expression);
    const value = math.evaluate(cleaned);
    return (typeof value === 'number' && Number.isFinite(value))
      ? parseFloat(value.toFixed(10))
      : '';
  } catch {
    return '';
  }
}

function sanitize(exp) {
  return exp
    .replace(/x/g, '*')
    .replace(/√/g, 'sqrt')
    .replace(/log(?=\()/g, 'log10')
    .replace(/(\d+|\([^()]+\))!/g, 'factorial($1)')
    .replace(/(\d)\s*\(/g, '$1*(')
    .replace(/\)\s*(\d)/g, ')*$1')
    .replace(/\(\)/g, '0');
}
