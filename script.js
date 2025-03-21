document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let isLeftSide = true;
    let currentNumberIndex = 0;
    
    // Initialize date data
    const today = new Date();
    const dateNumbers = getDateNumbers(today);
    
    // Display formatted date
    document.getElementById('current-date').textContent = formatDate(today);
    
    // Initialize game UI
    initializeUI();
    setupEventListeners();
    updateGameState();
    
    // === Date Handling Functions ===
    function getDateNumbers(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        
        return [
            ...String(month).split('').map(Number),
            ...String(day).split('').map(Number),
            ...String(year).split('').map(Number)
        ];
    }
    
    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // === UI Helper Functions ===
    function createButton(text, type) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('btn', type);
        return button;
    }
    
    function getActiveSide() {
        return document.getElementById(isLeftSide ? 'left-side' : 'right-side');
    }
    
    // === Expression Handling Functions ===
    function getExpressionFromSide(side) {
        return Array.from(side.querySelectorAll('button'))
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
    }
    
    function safeEval(expression) {
        if (!expression) return '';
        try {
            const cleaned = cleanExpression(expression);
            return Function(`'use strict'; return (${cleaned})`)();
        } catch (error) {
            console.error('Expression evaluation error:', error, expression);
            return 'Error';
        }
    }
    
    function cleanExpression(expression) {
        return expression
            .replace(/(\d+)\s*%\s*(\d+)/g, '($1%$2)')
            .replace(/(\d+)\s*\(/g, '$1*(')
            .replace(/\)\s*(\d+)/g, ')*$1')
            .replace(/-\s*\(/g, '-1*(')
            .replace(/√(\d+)/g, 'Math.sqrt($1)')
            .replace(/(\d+)!/g, 'factorial($1)')
            .replace(/\|(\d+)\|/g, 'Math.abs($1)')
            .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
            .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
            .replace(/(\d+)\s*&\s*(\d+)/g, '($1&$2)')
            .replace(/(\d+)\s*\|\s*(\d+)/g, '($1|$2)');
    }
    
    function formatExpression(expression) {
        if (!expression) return '';
        return expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/%/g, ' mod ')
            .replace(/\(/g, '<span class="paren">(</span>')
            .replace(/\)/g, '<span class="paren">)</span>')
            .replace(/\^/g, '<sup>')
            .replace(/(\d+)<sup>(\d+)/g, '$1<sup>$2</sup>')
            .replace(/Math\.sqrt/g, '√')
            .replace(/Math\.abs/g, '|')
            .replace(/Math\.log10/g, 'log')
            .replace(/&/g, '∧')
            .replace(/\|(?![^|]*\|)/g, '∨');
    }
    
    // === UI Update Functions ===
    function updateCurrentValues() {
        const leftSide = document.getElementById('left-side');
        const rightSide = document.getElementById('right-side');
        const leftExpression = getExpressionFromSide(leftSide);
        const rightExpression = getExpressionFromSide(rightSide);
        
        document.getElementById('left-value').textContent = safeEval(leftExpression) || '?';
        document.getElementById('right-value').textContent = safeEval(rightExpression) || '?';
        updateEqualsSign(leftExpression, rightExpression);
    }
    
    function updateEqualsSign(leftExpression, rightExpression) {
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        const equalsSign = document.getElementById('equals-sign');
        
        const isValid = leftExpression && rightExpression && 
                       leftValue !== 'Error' && rightValue !== 'Error';
        equalsSign.textContent = (isValid && leftValue === rightValue) ? '=' : '≠';
    }
    
    function updateActiveSide() {
        document.getElementById('left-side').classList.toggle('active', isLeftSide);
        document.getElementById('right-side').classList.toggle('active', !isLeftSide);
    }
    
    // === Message Handling ===
    function showMessage(message, type = 'error') {
        const messageElement = document.getElementById('error-message');
        messageElement.textContent = message;
        messageElement.className = `error-message ${type}`;
        messageElement.style.display = 'block';
        setTimeout(() => messageElement.style.display = 'none', 5000);
    }
    
    function hideMessage() {
        document.getElementById('error-message').style.display = 'none';
    }
    
    // === Game Logic Functions ===
    function calculatePoints(expression) {
        const pointValues = {
            '+': 1, '-': 1,
            '*': 2, '/': 2, '%': 2,
            '^': 3, '√': 3,
            '!': 4, '|': 3, '&': 3,
            'abs': 4, 'log': 4
        };
        
        return expression.split(/([+\-*/%^√!|&]|abs|log)/).reduce((points, char) => 
            points + (pointValues[char] || 0), 0);
    }
    
    function addButtonToEquation(sourceButton) {
        const buttonType = sourceButton.classList.contains('number') ? 'number' : 'operator';
        const newButton = createButton(sourceButton.textContent, buttonType);
        
        newButton.addEventListener('click', () => {
            const currentSide = getActiveSide();
            if (currentSide.lastElementChild === newButton) {
                newButton.remove();
                if (buttonType === 'number') {
                    sourceButton.disabled = false;
                    sourceButton.classList.remove('disabled');
                    currentNumberIndex--;
                }
                updateCurrentValues();
            }
        });
        
        getActiveSide().appendChild(newButton);
        updateCurrentValues();
    }
    
    // === Initialization Functions ===
    function initializeUI() {
        initializeDateButtons();
        initializeOperatorButtons();
    }
    
    function initializeDateButtons() {
        const dateButtonsContainer = document.getElementById('date-buttons');
        const [month, day, year] = [today.getMonth() + 1, today.getDate(), today.getFullYear()];
        
        // Add month digits
        addNumberButtons(String(month), dateButtonsContainer);
        dateButtonsContainer.appendChild(document.createElement('span')).textContent = '/';
        
        // Add day digits
        addNumberButtons(String(day), dateButtonsContainer);
        dateButtonsContainer.appendChild(document.createElement('span')).textContent = '/';
        
        // Add year digits
        addNumberButtons(String(year), dateButtonsContainer);
    }
    
    function addNumberButtons(numberString, container) {
        numberString.split('').forEach(digit => {
            container.appendChild(createButton(digit, 'number'));
        });
    }
    
    function initializeOperatorButtons() {
        const operators = [
            '+', '-', '*', '/', '%', 
            '(', ')', 
            '^', '√',
            '!', '|', '&',
            'abs', 'log'
        ];
        
        const container = document.getElementById('operator-buttons');
        operators.forEach(op => {
            const btn = createButton(op, 'operator');
            if (op.length > 1) {
                btn.classList.add('function-operator');
            }
            container.appendChild(btn);
        });
    }
    
    // === Event Listeners Setup ===
    function setupEventListeners() {
        setupSideClickListeners();
        setupNumberButtonListeners();
        setupOperatorButtonListeners();
        setupActionButtonListeners();
    }
    
    function setupSideClickListeners() {
        ['left-side', 'right-side'].forEach(sideId => {
            document.getElementById(sideId).addEventListener('click', e => {
                if (e.target === e.currentTarget) {
                    isLeftSide = sideId === 'left-side';
                    updateActiveSide();
                }
            });
        });
    }
    
    function setupNumberButtonListeners() {
        document.querySelectorAll('#date-buttons .number').forEach(button => {
            button.addEventListener('click', function() {
                if (parseInt(this.textContent) === dateNumbers[currentNumberIndex]) {
                    hideMessage();
                    this.disabled = true;
                    this.classList.add('disabled');
                    currentNumberIndex++;
                    addButtonToEquation(this);
                } else {
                    showMessage('Please use numbers in the order they appear in the date.');
                }
            });
        });
    }
    
    function setupOperatorButtonListeners() {
        document.querySelectorAll('#operator-buttons .operator').forEach(button => 
            button.addEventListener('click', () => addButtonToEquation(button))
        );
    }
    
    function setupActionButtonListeners() {
        document.getElementById('clear-button').addEventListener('click', handleClear);
        document.getElementById('check-button').addEventListener('click', handleCheck);
    }
    
    function handleClear() {
        document.querySelectorAll('.equation-side').forEach(side => side.innerHTML = '');
        document.querySelectorAll('#date-buttons .number').forEach(button => {
            button.disabled = false;
            button.classList.remove('disabled');
        });
        currentNumberIndex = 0;
        isLeftSide = true;
        updateGameState();
    }
    
    function handleCheck() {
        const leftSide = document.getElementById('left-side');
        const rightSide = document.getElementById('right-side');
        const leftExpression = getExpressionFromSide(leftSide);
        const rightExpression = getExpressionFromSide(rightSide);
        
        if (!validateEquation(leftExpression, rightExpression)) {
            return;
        }
        
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        
        if (leftValue === rightValue) {
            const points = calculatePoints(leftExpression) + calculatePoints(rightExpression);
            showMessage(
                `Correct! ${formatExpression(leftExpression.replace(/\*\*/g, '^'))} = ${formatExpression(rightExpression.replace(/\*\*/g, '^'))} (Points: ${points})`,
                'success'
            );
        } else {
            showMessage('Incorrect. The left side does not equal the right side.');
        }
    }
    
    function validateEquation(leftExpression, rightExpression) {
        if (!leftExpression || !rightExpression) {
            showMessage('Please add numbers and operators to both sides of the equation.');
            return false;
        }
        
        const usedNumbers = Array.from(document.querySelectorAll('.equation-side button'))
            .map(btn => btn.textContent)
            .filter(val => /^\d+$/.test(val))
            .join('');
        
        if (usedNumbers.length < dateNumbers.length) {
            showMessage('You must use all numbers from the date.');
            return false;
        }
        
        return true;
    }
    
    function updateGameState() {
        updateActiveSide();
        updateCurrentValues();
        hideMessage();
    }

    // Add factorial function for ! operator
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result;
    }
});