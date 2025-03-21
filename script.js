document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let isLeftSide = true;
    let currentNumberIndex = 0;
    
    // Get date components
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();
    
    // Get date numbers without leading zeros
    const dateNumbers = [
        ...String(month).split('').map(Number),
        ...String(day).split('').map(Number),
        ...String(year).split('').map(Number)
    ];
    
    // Display date
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // UI helpers
    function createButton(text, type) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('btn', type);
        return button;
    }
    
    function getActiveSide() {
        return document.getElementById(isLeftSide ? 'left-side' : 'right-side');
    }
    
    function getExpressionFromSide(side) {
        return Array.from(side.querySelectorAll('button'))
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
    }
    
    // Expression evaluation
    function safeEval(expression) {
        if (!expression) return '';
        try {
            const cleaned = expression
                .replace(/(\d+)\s*%\s*(\d+)/g, '($1%$2)')
                .replace(/(\d+)\s*\(/g, '$1*(')
                .replace(/\)\s*(\d+)/g, ')*$1')
                .replace(/-\s*\(/g, '-1*(');
            return Function(`'use strict'; return (${cleaned})`)();
        } catch (error) {
            console.error('Expression evaluation error:', error, expression);
            return 'Error';
        }
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
            .replace(/(\d+)<sup>(\d+)/g, '$1<sup>$2</sup>');
    }
    
    // UI updates
    function updateCurrentValues() {
        const leftExpression = getExpressionFromSide(document.getElementById('left-side'));
        const rightExpression = getExpressionFromSide(document.getElementById('right-side'));
        
        document.getElementById('left-value').textContent = safeEval(leftExpression) || '?';
        document.getElementById('right-value').textContent = safeEval(rightExpression) || '?';
        updateEqualsSign(leftExpression, rightExpression);
    }
    
    function updateEqualsSign(leftExpression, rightExpression) {
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        const equalsSign = document.getElementById('equals-sign');
        equalsSign.textContent = (leftExpression && rightExpression && leftValue !== 'Error' && 
            rightValue !== 'Error' && leftValue === rightValue) ? '=' : '≠';
    }
    
    function updateActiveSide() {
        document.getElementById('left-side').classList.toggle('active', isLeftSide);
        document.getElementById('right-side').classList.toggle('active', !isLeftSide);
    }
    
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
    
    // Game logic
    function calculatePoints(expression) {
        return expression.split('').reduce((points, char) => {
            if (char === '+' || char === '-') return points + 1;
            if (char === '*' || char === '/' || char === '%') return points + 2;
            if (char === '^') return points + 3;
            return points;
        }, 0);
    }
    
    function addButtonToEquation(sourceButton) {
        const newButton = createButton(sourceButton.textContent, 
            sourceButton.classList.contains('number') ? 'number' : 'operator');
        
        newButton.addEventListener('click', () => {
            const currentSide = getActiveSide();
            if (currentSide.lastElementChild === newButton) {
                newButton.remove();
                if (sourceButton.classList.contains('number')) {
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
    
    // Initialize UI
    const dateButtonsContainer = document.getElementById('date-buttons');
    let currentIndex = 0;
    
    // Add month digits
    String(month).split('').forEach(digit => {
        dateButtonsContainer.appendChild(createButton(digit, 'number'));
        currentIndex++;
    });
    dateButtonsContainer.appendChild(document.createElement('span')).textContent = '/';
    
    // Add day digits
    String(day).split('').forEach(digit => {
        dateButtonsContainer.appendChild(createButton(digit, 'number'));
        currentIndex++;
    });
    dateButtonsContainer.appendChild(document.createElement('span')).textContent = '/';
    
    // Add year digits
    String(year).split('').forEach(digit => {
        dateButtonsContainer.appendChild(createButton(digit, 'number'));
        currentIndex++;
    });
    
    ['+', '-', '*', '/', '%', '(', ')', '^'].forEach(op => 
        document.getElementById('operator-buttons').appendChild(createButton(op, 'operator'))
    );
    
    // Event listeners
    ['left-side', 'right-side'].forEach(sideId => {
        document.getElementById(sideId).addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                isLeftSide = sideId === 'left-side';
                updateActiveSide();
            }
        });
    });
    
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
    
    document.querySelectorAll('#operator-buttons .operator').forEach(button => 
        button.addEventListener('click', () => addButtonToEquation(button))
    );
    
    document.getElementById('clear-button').addEventListener('click', () => {
        document.querySelectorAll('.equation-side').forEach(side => side.innerHTML = '');
        document.querySelectorAll('#date-buttons .number').forEach(button => {
            button.disabled = false;
            button.classList.remove('disabled');
        });
        currentNumberIndex = 0;
        isLeftSide = true;
        updateActiveSide();
        updateCurrentValues();
        hideMessage();
    });
    
    document.getElementById('check-button').addEventListener('click', () => {
        const leftExpression = getExpressionFromSide(document.getElementById('left-side'));
        const rightExpression = getExpressionFromSide(document.getElementById('right-side'));
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        
        const usedNumbers = Array.from(document.querySelectorAll('.equation-side button'))
            .map(btn => btn.textContent)
            .filter(val => /^\d+$/.test(val))
            .join('');
        
        const allDateNumbers = dateNumbers.join('');
        const allNumbersUsed = usedNumbers.length >= allDateNumbers.length;
        
        if (!leftExpression || !rightExpression) {
            showMessage('Please add numbers and operators to both sides of the equation.');
        } else if (leftValue === 'Error' || rightValue === 'Error') {
            showMessage('Invalid expression. Please check your equation.');
        } else if (!allNumbersUsed) {
            showMessage('You must use all numbers from the date.');
        } else if (leftValue === rightValue) {
            hideMessage();
            const points = calculatePoints(leftExpression) + calculatePoints(rightExpression);
            showMessage(
                `Correct! ${formatExpression(leftExpression.replace(/\*\*/g, '^'))} = ${formatExpression(rightExpression.replace(/\*\*/g, '^'))} (Points: ${points})`,
                'success'
            );
        } else {
            showMessage('Incorrect. The left side does not equal the right side.');
        }
    });
    
    // Initialize game state
    updateActiveSide();
    updateCurrentValues();
    hideMessage();
});