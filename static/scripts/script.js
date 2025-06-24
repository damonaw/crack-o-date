import { safeEval } from './mathUtils.js';

let digits = [];
let digitIndex = 0;
let activeSide = 'left';

const leftSide = document.getElementById('left-side');
const rightSide = document.getElementById('right-side');
const leftValue = document.getElementById('left-value');
const rightValue = document.getElementById('right-value');
const equalsEl = document.getElementById('equals-sign');
const messageEl = document.getElementById('error-message');
let themeToggle;

function getDigits(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const y = date.getFullYear();
  return [...String(m), ...String(d), ...String(y)].map(Number);
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createButton(text, cls) {
  const btn = document.createElement('button');
  btn.textContent = text;
  if (cls) btn.classList.add(cls);
  return btn;
}

function appendToken(text) {
  const container = activeSide === 'left' ? leftSide : rightSide;
  const btn = createButton(text);
  btn.addEventListener('click', () => {
    btn.remove();
    update();
  });
  container.appendChild(btn);
  update();
}

function expressionFrom(container) {
  return Array.from(container.children).map(b => b.textContent).join('');
}

function update() {
  const leftExpr = expressionFrom(leftSide);
  const rightExpr = expressionFrom(rightSide);
  const leftVal = safeEval(leftExpr);
  const rightVal = safeEval(rightExpr);
  leftValue.textContent = leftVal === '' ? '?' : leftVal;
  rightValue.textContent = rightVal === '' ? '?' : rightVal;
  equalsEl.textContent = leftVal !== '' && rightVal !== '' && leftVal === rightVal ? '=' : '≠';
}

function showMessage(msg, type = 'error') {
  messageEl.textContent = msg;
  messageEl.className = `error-message ${type}`;
  messageEl.style.display = 'block';
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 3000);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

function reset() {
  leftSide.innerHTML = '';
  rightSide.innerHTML = '';
  digitIndex = 0;
  activeSide = 'left';
  document.querySelectorAll('#date-buttons .number').forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('disabled');
  });
  update();
}

function check() {
  const leftExpr = expressionFrom(leftSide);
  const rightExpr = expressionFrom(rightSide);
  if (!leftExpr || !rightExpr) {
    showMessage('Build both sides');
    return;
  }
  const leftVal = safeEval(leftExpr);
  const rightVal = safeEval(rightExpr);
  if (leftVal !== '' && rightVal !== '' && leftVal === rightVal) {
    showMessage('Correct!', 'success');
  } else {
    showMessage('Not equal');
  }
}

function setupNumberButtons() {
  const container = document.getElementById('date-buttons');
  digits.forEach((n, i) => {
    const btn = createButton(String(n), 'number');
    btn.addEventListener('click', () => {
      if (i !== digitIndex) {
        showMessage('Use numbers in order');
        return;
      }
      btn.disabled = true;
      btn.classList.add('disabled');
      digitIndex++;
      appendToken(String(n));
    });
    container.appendChild(btn);
  });
}

function setupOperatorButtons() {
  const ops = ['+', '-', 'x', '/', '%', '^', '√', 'abs', 'log', '!', '(', ')'];
  const container = document.getElementById('operator-buttons');
  ops.forEach(op => {
    const btn = createButton(op, 'operator');
    btn.addEventListener('click', () => {
      const text = ['abs', 'log', '√'].includes(op) ? op + '(' : op;
      appendToken(text);
    });
    container.appendChild(btn);
  });
}

function init() {
  const today = new Date();
  digits = getDigits(today);
  document.getElementById('header-date').textContent = formatDate(today);
  themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);
  themeToggle.addEventListener('click', toggleTheme);
  setupNumberButtons();
  setupOperatorButtons();
  document.getElementById('clear-button').addEventListener('click', reset);
  document.getElementById('check-button').addEventListener('click', check);
  leftSide.addEventListener('click', () => (activeSide = 'left'));
  rightSide.addEventListener('click', () => (activeSide = 'right'));
  update();
}

document.addEventListener('DOMContentLoaded', init);
