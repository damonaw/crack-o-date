// Simplified game logic for crack-o-date
import { safeEval } from './mathUtils.js';

// Track which side of the equation is active
let isLeftSide = true;
let currentIndex = 0;
let dateNumbers = [];

function getDateNumbers(date) {
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

function addNumberButtons(container) {
    dateNumbers.forEach(n => {
        const btn = createButton(String(n), 'number');
        btn.addEventListener('click', () => handleNumberClick(btn));
        container.appendChild(btn);
    });
}

function addOperatorButtons(container) {
    ['+', '-', 'x', '/', '%', '^', '√', 'abs', 'log', '!', '(', ')'].forEach(op => {
        const btn = createButton(op, 'operator');
        btn.addEventListener('click', () => handleOperatorClick(btn));
        container.appendChild(btn);
    });
}

function getActiveContainer() {
    return document.getElementById(isLeftSide ? 'left-side' : 'right-side');
}

function handleNumberClick(btn) {
    if (parseInt(btn.textContent) !== dateNumbers[currentIndex]) {
        showMessage('Use numbers in order');
        return;
    }
    btn.disabled = true;
    btn.classList.add('disabled');
    currentIndex++;
    appendToActive(btn.textContent);
}

function handleOperatorClick(btn) {
    const text = btn.textContent;
    if (['abs', 'log', '√'].includes(text)) {
        appendToActive(text + '(');
    } else {
        appendToActive(text);
    }
}

function appendToActive(text) {
    const container = getActiveContainer();
    const newBtn = createButton(text);
    newBtn.addEventListener('click', () => {
        newBtn.remove();
        updateValues();
    });
    container.appendChild(newBtn);
    updateValues();
}

function getExpression(sideId) {
    return Array.from(document.getElementById(sideId).children)
        .map(b => b.textContent).join('');
}

function updateValues() {
    const leftExpr = getExpression('left-side');
    const rightExpr = getExpression('right-side');
    const leftVal = safeEval(leftExpr);
    const rightVal = safeEval(rightExpr);
    document.getElementById('left-value').textContent = leftVal !== '' ? leftVal : '?';
    document.getElementById('right-value').textContent = rightVal !== '' ? rightVal : '?';
    document.getElementById('equals-sign').textContent = leftVal === rightVal && leftExpr && rightExpr ? '=' : '≠';
}

function clearGame() {
    document.getElementById('left-side').innerHTML = '';
    document.getElementById('right-side').innerHTML = '';
    currentIndex = 0;
    isLeftSide = true;
    document.querySelectorAll('#date-buttons .number').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('disabled');
    });
    updateValues();
}

function handleCheck() {
    const leftExpr = getExpression('left-side');
    const rightExpr = getExpression('right-side');
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

function showMessage(msg, type = 'error') {
    const el = document.getElementById('error-message');
    el.textContent = msg;
    el.className = `error-message ${type}`;
    el.style.display = 'block';
    setTimeout(() => {
        el.style.display = 'none';
    }, 3000);
}

function setup() {
    const today = new Date();
    dateNumbers = getDateNumbers(today);
    document.getElementById('header-date').textContent = formatDate(today);
    addNumberButtons(document.getElementById('date-buttons'));
    addOperatorButtons(document.getElementById('operator-buttons'));
    document.getElementById('clear-button').addEventListener('click', clearGame);
    document.getElementById('check-button').addEventListener('click', handleCheck);
    document.getElementById('left-side').addEventListener('click', () => { isLeftSide = true; });
    document.getElementById('right-side').addEventListener('click', () => { isLeftSide = false; });
    updateValues();
}

document.addEventListener('DOMContentLoaded', setup);
