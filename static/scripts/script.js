import { safeEval } from './mathUtils.js';

let digits = [];
let digitIndex = 0;
let activeSide = 'left';
let dragData = null; // info about current drag

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

function createToken(text, type) {
  const el = document.createElement('span');
  el.className = `token ${type}`;
  el.textContent = text;
  el.dataset.value = text;
  el.dataset.type = type;
  el.draggable = true;
  el.addEventListener('click', () => { el.remove(); update(); });
  el.addEventListener('dragstart', onTokenDragStart);
  el.addEventListener('dragover', e => e.preventDefault());
  el.addEventListener('drop', onTokenDrop);
  return el;
}

function expressionFrom(container) {
  return Array.from(container.children).map(c => c.dataset.value).join('');
}

function combineFractions(container) {
  const children = Array.from(container.children);
  for (let i = 0; i < children.length - 2; i++) {
    const a = children[i];
    const op = children[i + 1];
    const b = children[i + 2];
    if (a.dataset.type === 'number' && op.dataset.value === '/' && b.dataset.type === 'number') {
      const frac = document.createElement('span');
      frac.className = 'token fraction';
      frac.dataset.type = 'fraction';
      frac.dataset.value = `${a.dataset.value}/${b.dataset.value}`;
      frac.draggable = true;
      frac.innerHTML = `<span class="numerator">${a.textContent}</span><span class="line"></span><span class="denominator">${b.textContent}</span>`;
      frac.addEventListener('click', () => { frac.remove(); update(); });
      frac.addEventListener('dragstart', onTokenDragStart);
      frac.addEventListener('dragover', e => e.preventDefault());
      frac.addEventListener('drop', onTokenDrop);
      container.insertBefore(frac, a);
      container.removeChild(a);
      container.removeChild(op);
      container.removeChild(b);
      children.splice(i, 3, frac);
      i--;
    }
  }
}

function update() {
  combineFractions(leftSide);
  combineFractions(rightSide);
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
  dragData = null;
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

function onDigitDragStart(e) {
  const idx = Number(e.target.dataset.index);
  if (idx !== digitIndex) {
    showMessage('Use numbers in order');
    e.preventDefault();
    return;
  }
  dragData = { source: 'digit', text: e.target.textContent, element: e.target, index: idx };
  e.dataTransfer.setData('text/plain', dragData.text);
}

function onOpDragStart(e) {
  const op = e.target.textContent;
  const text = ['abs', 'log', '√'].includes(op) ? op + '(' : op;
  dragData = { source: 'operator', text, element: e.target };
  e.dataTransfer.setData('text/plain', text);
}

function onTokenDragStart(e) {
  dragData = { source: 'token', element: e.target, text: e.target.dataset.value };
  e.dataTransfer.setData('text/plain', dragData.text);
}

function onTokenDrop(e) {
  e.preventDefault();
  const before = e.currentTarget.classList.contains('token') ? e.currentTarget : null;
  const container = before ? before.parentElement : e.currentTarget;
  insertDraggedToken(container, before);
}

function insertDraggedToken(container, before) {
  if (!dragData) return;
  let tokenEl;
  if (dragData.source === 'digit') {
    if (dragData.index !== digitIndex) {
      showMessage('Use numbers in order');
      dragData = null;
      return;
    }
    dragData.element.disabled = true;
    dragData.element.classList.add('disabled');
    digitIndex++;
    tokenEl = createToken(dragData.text, 'number');
  } else if (dragData.source === 'operator') {
    tokenEl = createToken(dragData.text, 'operator');
  } else if (dragData.source === 'token') {
    tokenEl = dragData.element;
  }

  if (before) {
    container.insertBefore(tokenEl, before);
  } else {
    container.appendChild(tokenEl);
  }
  dragData = null;
  update();
}

function setupNumberButtons() {
  const container = document.getElementById('date-buttons');
  digits.forEach((n, i) => {
    const btn = createButton(String(n), 'number');
    btn.dataset.index = i;
    btn.draggable = true;
    btn.addEventListener('dragstart', onDigitDragStart);
    btn.addEventListener('click', () => {
      if (i !== digitIndex) {
        showMessage('Use numbers in order');
        return;
      }
      btn.disabled = true;
      btn.classList.add('disabled');
      digitIndex++;
      const tokenEl = createToken(String(n), 'number');
      (activeSide === 'left' ? leftSide : rightSide).appendChild(tokenEl);
      update();
    });
    container.appendChild(btn);
  });
}

function setupOperatorButtons() {
  const ops = ['+', '-', 'x', '/', '%', '^', '√', 'abs', 'log', '!', '(', ')'];
  const container = document.getElementById('operator-buttons');
  ops.forEach(op => {
    const btn = createButton(op, 'operator');
    btn.draggable = true;
    btn.addEventListener('dragstart', onOpDragStart);
    btn.addEventListener('click', () => {
      const text = ['abs', 'log', '√'].includes(op) ? op + '(' : op;
      const tokenEl = createToken(text, 'operator');
      (activeSide === 'left' ? leftSide : rightSide).appendChild(tokenEl);
      update();
    });
    container.appendChild(btn);
  });
}

function setupSides() {
  [leftSide, rightSide].forEach(side => {
    side.addEventListener('dragover', e => e.preventDefault());
    side.addEventListener('drop', onTokenDrop);
    side.addEventListener('click', () => { activeSide = side.id === 'left-side' ? 'left' : 'right'; });
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
  setupSides();
  document.getElementById('clear-button').addEventListener('click', reset);
  document.getElementById('check-button').addEventListener('click', check);
  update();
}

document.addEventListener('DOMContentLoaded', init);
