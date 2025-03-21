// Game data management
const gameData = {
    stats: {
        totalSolutions: 0,
        totalPoints: 0,
        highScore: 0,
        currentStreak: 0,
        bestStreak: 0,
        averagePoints: 0,
        lastPlayedDate: null
    },
    solutions: [],
    
    load() {
        const savedStats = JSON.parse(localStorage.getItem('stats') || '{}');
        const savedSolutions = JSON.parse(localStorage.getItem('solutions') || '[]');
        
        this.stats = { ...this.stats, ...savedStats };
        this.solutions = savedSolutions;
        
        this.updateDisplay();
    },
    
    save() {
        localStorage.setItem('stats', JSON.stringify(this.stats));
        localStorage.setItem('solutions', JSON.stringify(this.solutions));
        this.updateDisplay();
    },
    
    updateDisplay() {
        // Update today's solutions count
        const todaySolutions = this.getTodaysSolutions();
        document.getElementById('total-solutions').textContent = todaySolutions.length;
        
        // Update high score
        document.getElementById('high-score').textContent = this.stats.highScore;
        
        // Update day streak
        document.getElementById('current-streak').textContent = this.stats.currentStreak;
    },
    
    addSolution(leftExpression, rightExpression, points) {
        const today = new Date().toISOString().split('T')[0];
        const solution = {
            date: new Date().toISOString(),
            left: leftExpression,
            right: rightExpression,
            points: points,
            dateNumbers: window.dateNumbers.join('')
        };
        
        this.solutions.push(solution);
        this.updateStats(points, today);
        this.save();
    },
    
    updateStats(points, today) {
        // Update high score if current points are higher
        if (points > this.stats.highScore) {
            this.stats.highScore = points;
        }
        
        // Update streak based on last played date
        if (this.stats.lastPlayedDate) {
            const lastPlayed = new Date(this.stats.lastPlayedDate);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate - lastPlayed);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                this.stats.currentStreak++;
                if (this.stats.currentStreak > this.stats.bestStreak) {
                    this.stats.bestStreak = this.stats.currentStreak;
                }
            } else if (diffDays > 1) {
                // Streak broken
                this.stats.currentStreak = 1;
            }
        } else {
            // First time playing
            this.stats.currentStreak = 1;
            this.stats.bestStreak = 1;
        }
        
        this.stats.lastPlayedDate = today;
        this.stats.totalPoints += points;
        this.stats.averagePoints = this.stats.totalPoints / this.solutions.length;
    },
    
    resetStreak() {
        this.stats.currentStreak = 0;
        this.stats.lastPlayedDate = null;
        this.save();
    },
    
    getTodaysSolutions() {
        const today = new Date().toISOString().split('T')[0];
        return this.solutions.filter(solution => 
            solution.date.startsWith(today)
        );
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let isLeftSide = true;
    let currentNumberIndex = 0;
    
    // Initialize date data
    const today = new Date();
    window.dateNumbers = getDateNumbers(today);
    
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
        
        // Clear any existing timeouts
        if (messageElement.timeoutId) {
            clearTimeout(messageElement.timeoutId);
        }
        
        // Set the message content and type
        messageElement.textContent = message;
        messageElement.className = `error-message ${type}`;
        
        // Show the message with a slight delay to ensure the display:none is cleared
        requestAnimationFrame(() => {
            messageElement.style.display = 'block';
        });
        
        // Set up auto-hide after 5 seconds
        messageElement.timeoutId = setTimeout(() => {
            messageElement.style.display = 'none';
        }, 5000);
    }
    
    function hideMessage() {
        const messageElement = document.getElementById('error-message');
        if (messageElement.timeoutId) {
            clearTimeout(messageElement.timeoutId);
        }
        messageElement.style.display = 'none';
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
        const buttonText = sourceButton.textContent;
        
        // Check if it's a function operator (except factorial which goes after the number)
        const isFunction = ['abs', 'log'].includes(buttonText);
        
        // Create the main button
        const newButton = createButton(buttonText, buttonType);
        
        // If it's a function, also create and add the opening parenthesis
        if (isFunction) {
            const parenButton = createButton('(', 'operator');
            parenButton.setAttribute('data-type', 'grouping');
            
            // Add click handler for both buttons
            newButton.addEventListener('click', () => handleButtonRemoval(newButton, sourceButton, [parenButton]));
            parenButton.addEventListener('click', () => handleButtonRemoval(parenButton, null, [newButton]));
            
            // Add both buttons to the equation
            getActiveSide().appendChild(newButton);
            getActiveSide().appendChild(parenButton);
        } else {
            // Regular click handler for non-function buttons
            newButton.addEventListener('click', () => handleButtonRemoval(newButton, sourceButton));
            getActiveSide().appendChild(newButton);
        }
        
        updateCurrentValues();
    }
    
    // Helper function to handle button removal
    function handleButtonRemoval(buttonToRemove, sourceButton, relatedButtons = []) {
        const currentSide = getActiveSide();
        if (currentSide.lastElementChild === buttonToRemove || 
            relatedButtons.includes(currentSide.lastElementChild)) {
            
            // Remove all related buttons in reverse order
            if (relatedButtons.length > 0) {
                const allButtons = [buttonToRemove, ...relatedButtons];
                for (let i = allButtons.length - 1; i >= 0; i--) {
                    if (allButtons[i].parentNode === currentSide) {
                        allButtons[i].remove();
                    }
                }
            } else {
                buttonToRemove.remove();
            }
            
            // Re-enable source button if it's a number
            if (sourceButton && sourceButton.classList.contains('number')) {
                sourceButton.disabled = false;
                sourceButton.classList.remove('disabled');
                currentNumberIndex--;
            }
            
            updateCurrentValues();
        }
    }
    
    // === Initialization Functions ===
    function initializeUI() {
        initializeDateButtons();
        initializeOperatorButtons();
        initializeDataManagement();
        setupKeyboardControls();
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
            // Basic Operators (1 point)
            { 
                symbol: '+', 
                type: 'basic-1',
                tooltip: 'Addition\n2 + 3 = 5\nCombines two numbers together'
            },
            { 
                symbol: '-', 
                type: 'basic-1',
                tooltip: 'Subtraction\n5 - 3 = 2\nFinds the difference between numbers'
            },
            
            // Basic Operators (2 points)
            { 
                symbol: '*', 
                type: 'basic-2',
                tooltip: 'Multiplication\n4 × 5 = 20\nRepeated addition of a number'
            },
            { 
                symbol: '/', 
                type: 'basic-2',
                tooltip: 'Division\n10 ÷ 2 = 5\nSplits a number into equal parts'
            },
            { 
                symbol: '%', 
                type: 'basic-2',
                tooltip: 'Modulo\n7 mod 3 = 1\nFinds the remainder after division'
            },
            
            // Grouping
            { 
                symbol: '(', 
                type: 'grouping',
                tooltip: 'Opening Parenthesis\n2 × (3 + 4) = 14\nGroups operations together'
            },
            { 
                symbol: ')', 
                type: 'grouping',
                tooltip: 'Closing Parenthesis\n(2 + 3) × 4 = 20\nGroups operations together'
            },
            
            // Advanced Operators (3 points)
            { 
                symbol: '^', 
                type: 'advanced',
                tooltip: 'Exponent\n2^3 = 8\nRaises a number to a power'
            },
            { 
                symbol: '√', 
                type: 'advanced',
                tooltip: 'Square Root\n√16 = 4\nFinds the number that when squared equals input'
            },
            { 
                symbol: '|', 
                type: 'advanced',
                tooltip: 'Bitwise OR\nExample: 5|3 = 7\n\nConverts numbers to binary:\n5 = 101  (4 + 0 + 1)\n3 = 011  (0 + 2 + 1)\n     ↓   ↓   ↓\n7 = 111  (4 + 2 + 1)\n\nIf either bit is 1, result is 1\nLike combining two sets'
            },
            { 
                symbol: '&', 
                type: 'advanced',
                tooltip: 'Bitwise AND\nExample: 5&3 = 1\n\nConverts numbers to binary:\n5 = 101  (4 + 0 + 1)\n3 = 011  (0 + 2 + 1)\n     ↓   ↓   ↓\n1 = 001  (0 + 0 + 1)\n\nOnly if both bits are 1, result is 1\nLike finding what two sets share'
            },
            
            // Function Operators (4 points)
            { 
                symbol: 'abs', 
                type: 'function',
                tooltip: 'Absolute Value\nExample: abs(-5) = 5\n\nParenthesis added automatically\nRemoves the negative sign\nReturns how far a number is from zero'
            },
            { 
                symbol: 'log', 
                type: 'function',
                tooltip: 'Base-10 Logarithm\nExample: log(100) = 2\n\nParenthesis added automatically\nAnswers: "10 to what power gives this number?"\n\nlog(1000) = 3 because 10³ = 1000'
            },
            { 
                symbol: '!', 
                type: 'function',
                tooltip: 'Factorial\nExample: 5! = 120\n\nMultiplies all whole numbers from 1 to n:\n5! = 5 × 4 × 3 × 2 × 1 = 120\n3! = 3 × 2 × 1 = 6\n1! = 1\n0! = 1 (by definition)'
            }
        ];
        
        const container = document.getElementById('operator-buttons');
        operators.forEach(op => {
            const btn = createButton(op.symbol, 'operator');
            btn.setAttribute('data-type', op.type);
            btn.setAttribute('data-tooltip', op.tooltip);
            container.appendChild(btn);
        });
    }
    
    // === Event Listeners Setup ===
    function setupEventListeners() {
        setupSideClickListeners();
        setupNumberButtonListeners();
        setupOperatorButtonListeners();
        setupActionButtonListeners();
        setupKeyboardControls();
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
                if (parseInt(this.textContent) === window.dateNumbers[currentNumberIndex]) {
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
            gameData.resetStreak();
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
            gameData.addSolution(leftExpression, rightExpression, points);
        } else {
            showMessage('Incorrect. The left side does not equal the right side.');
            gameData.resetStreak();
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
        
        if (usedNumbers.length < window.dateNumbers.length) {
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

    // Add keyboard support
    function setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Number keys (0-9)
            if (/^\d$/.test(e.key)) {
                const numberButtons = document.querySelectorAll('#date-buttons .number');
                numberButtons.forEach(btn => {
                    if (btn.textContent === e.key && !btn.disabled) {
                        btn.click();
                    }
                });
            }
            
            // Operator keys
            const operatorMap = {
                '+': '+', '-': '-', '*': '*', '/': '/',
                '(': '(', ')': ')', '^': '^',
                '%': '%'
            };
            
            if (operatorMap[e.key]) {
                const operatorButtons = document.querySelectorAll('#operator-buttons .operator');
                operatorButtons.forEach(btn => {
                    if (btn.textContent === operatorMap[e.key]) {
                        btn.click();
                    }
                });
            }
            
            // Special keys
            if (e.key === 'Enter') {
                document.getElementById('check-button').click();
            }
            if (e.key === 'Escape') {
                document.getElementById('clear-button').click();
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                isLeftSide = !isLeftSide;
                updateActiveSide();
            }
        });
    }

    // Initialize data management
    function initializeDataManagement() {
        gameData.load();
        
        // Check if it's a new day
        const lastSolution = gameData.solutions[gameData.solutions.length - 1];
        if (lastSolution) {
            const lastDate = new Date(lastSolution.date).toISOString().split('T')[0];
            const today = new Date().toISOString().split('T')[0];
            if (lastDate !== today) {
                gameData.resetStreak();
            }
        }
    }
});