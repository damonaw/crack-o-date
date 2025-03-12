document.addEventListener('DOMContentLoaded', function() {
    // Game variables
    let currentDifficulty = 'medium';
    let isLeftSide = true;
    let currentNumberIndex = 0;
    let totalPoints = 0;
    let solutionsCount = 0;
    let highestPoints = 0;
    
    // Game settings
    const difficultySettings = {
        easy: {
            requireAllNumbers: false,
            pointMultiplier: 0,
            fixedPoints: 1, // Easy mode now always gives exactly 1 point
            description: 'Easy: Can use any date numbers in any order, 1 point per solution.'
        },
        medium: {
            requireAllNumbers: true,
            pointMultiplier: 1,
            description: 'Medium: Must use all date digits in order, points based on operators used.'
        },
        hard: {
            requireAllNumbers: true,
            pointMultiplier: 2,
            description: 'Hard: Must use all date digits in order and use +, -, *, and / operators, double points!'
        }
    };
    
    // Local storage keys prefix
    const storagePrefix = 'crack-o-date-';
    
    // Display the current date
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-based
    const year = today.getFullYear();
    const dateString = `${month}/${day}/${year}`;
    
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Display current year in footer
    document.getElementById('current-year').textContent = year;
    
    // Parse date into individual digits
    function splitNumberIntoDigits(number) {
        return number.toString().split('').map(Number);
    }
    
    const monthDigits = splitNumberIntoDigits(month);
    const dayDigits = splitNumberIntoDigits(day);
    const yearDigits = splitNumberIntoDigits(year);
    const dateNumbers = [...monthDigits, ...dayDigits, ...yearDigits];
    
    // Create date number buttons
    const dateButtonsContainer = document.getElementById('date-buttons');
    
    // Add month digits
    monthDigits.forEach(digit => {
        const button = document.createElement('button');
        button.textContent = digit;
        button.classList.add('btn', 'number');
        dateButtonsContainer.appendChild(button);
    });
    
    // Add separator
    const separator1 = document.createElement('span');
    separator1.textContent = '/';
    dateButtonsContainer.appendChild(separator1);
    
    // Add day digits
    dayDigits.forEach(digit => {
        const button = document.createElement('button');
        button.textContent = digit;
        button.classList.add('btn', 'number');
        dateButtonsContainer.appendChild(button);
    });
    
    // Add separator
    const separator2 = document.createElement('span');
    separator2.textContent = '/';
    dateButtonsContainer.appendChild(separator2);
    
    // Add year digits
    yearDigits.forEach(digit => {
        const button = document.createElement('button');
        button.textContent = digit;
        button.classList.add('btn', 'number');
        dateButtonsContainer.appendChild(button);
    });
    
    // Safely evaluate expressions
    function safeEval(expression) {
        if (!expression) return '';
        
        try {
            // Make sure % is interpreted as modulus and not percent
            // Replace isolated % operators with JavaScript's modulo syntax
            const cleanedExpression = expression.replace(/(\d+)\s*%\s*(\d+)/g, '($1%$2)');
            
            // Use Function for safer evaluation than eval
            return Function(`'use strict'; return (${cleanedExpression})`)();
        } catch (error) {
            console.error('Expression evaluation error:', error, expression);
            return 'Error';
        }
    }
    
    // Format expression for display
    function formatExpression(expression) {
        if (!expression) return '';
        
        return expression
            .replace(/\*/g, '×') // Multiplication sign
            .replace(/\//g, '÷') // Division sign
            .replace(/\^/g, '<sup>') // Start superscript for powers
            .replace(/(\d+)<sup>(\d+)/g, '$1<sup>$2</sup>'); // Close superscript tags
    }
    
    // Update the current value displays
    function updateCurrentValues() {
        // Get the left side expression
        const leftExpression = Array.from(
            document.querySelectorAll('#left-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**'); // Replace ^ with ** for exponentiation
        
        // Get the right side expression
        const rightExpression = Array.from(
            document.querySelectorAll('#right-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
        
        // Evaluate both sides and update displayed values
        document.getElementById('left-value').textContent = safeEval(leftExpression) || '?';
        document.getElementById('right-value').textContent = safeEval(rightExpression) || '?';
        
        // Update equals sign
        updateEqualsSign();
    }
    
    // Update equals sign
    function updateEqualsSign() {
        const leftExpression = Array.from(
            document.querySelectorAll('#left-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
        
        const rightExpression = Array.from(
            document.querySelectorAll('#right-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
        
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        
        if (
            leftExpression === '' || 
            rightExpression === '' || 
            leftValue === 'Error' || 
            rightValue === 'Error' ||
            leftValue !== rightValue
        ) {
            document.getElementById('equals-sign').textContent = '≠';
        } else {
            document.getElementById('equals-sign').textContent = '=';
        }
    }
    
    // Show error message
    function showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
    
    // Hide error message
    function hideError() {
        document.getElementById('error-message').style.display = 'none';
    }
    
    // Show modal
    function showModal(title, body) {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = body;
        
        modal.classList.add('show');
        
        return new Promise((resolve) => {
            const closeModal = () => {
                modal.classList.remove('show');
                resolve();
            };
            
            // Close button
            document.querySelector('#modal .close').onclick = closeModal;
                        
            // Click outside to close
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // ESC key to close
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
            }, { once: true });
        });
    }
    
    // Update which side is active
    function updateActiveSide() {
        const leftSide = document.getElementById('left-side');
        const rightSide = document.getElementById('right-side');
        
        if (isLeftSide) {
            leftSide.classList.add('active');
            rightSide.classList.remove('active');
        } else {
            leftSide.classList.remove('active');
            rightSide.classList.add('active');
        }
    }
    
    // Calculate points for an expression
    function calculatePoints(expression) {
        let points = 0;
        
        for (const char of expression) {
            if (char === '+' || char === '-') points += 1;
            else if (char === '*' || char === '/' || char === '%') points += 2;
            else if (char === '^') points += 3;
        }
        
        return points;
    }
    
    // Save the user's solutions locally
    function saveSolution(leftExpr, rightExpr, points) {
        const storageKey = `${storagePrefix}solutions-${dateString}`;
        try {
            // Get existing solutions
            let solutions = getSavedSolutions();

            // Create a unique solution ID
            const solutionId = `${leftExpr}=${rightExpr}`;

            // Check if solution already exists
            if (!solutions.some(sol => sol.id === solutionId)) {
                solutions.push({
                    id: solutionId,
                    left: leftExpr,
                    right: rightExpr,
                    points: points,
                    timestamp: Date.now(),
                    difficulty: currentDifficulty
                });

                // Save back to local storage
                localStorage.setItem(storageKey, JSON.stringify(solutions));

                // Update stats
                updateTotalPoints(points);
                updateSolutionsCount(1);

                // Update highest points if needed
                if (points > highestPoints) {
                    updateHighestPoints(points);
                }

                return true; // New solution saved
            }

            return false; // Solution already exists
        } catch (error) {
            console.warn('Failed to save solution to local storage:', error);
            return false;
        }
    }

    // Get saved solutions from local storage
    function getSavedSolutions() {
        const storageKey = `${storagePrefix}solutions-${dateString}`;
        try {
            const savedSolutions = localStorage.getItem(storageKey);
            return savedSolutions ? JSON.parse(savedSolutions) : [];
        } catch (error) {
            console.warn('Failed to get solutions from local storage:', error);
            return [];
        }
    }
    
    // Local storage functions
    function getSavedSolutions() {
        const storageKey = `${storagePrefix}solutions-${dateString}`;
        try {
            const savedSolutions = localStorage.getItem(storageKey);
            return savedSolutions ? JSON.parse(savedSolutions) : [];
        } catch (error) {
            console.warn('Failed to get solutions from local storage:', error);
            return [];
        }
    }
    
    function saveSolution(leftExpr, rightExpr, points) {
        const storageKey = `${storagePrefix}solutions-${dateString}`;
        try {
            // Get existing solutions
            let solutions = getSavedSolutions();
            
            // Create a unique solution ID
            const solutionId = `${leftExpr}=${rightExpr}`;
            
            // Check if solution already exists
            if (!solutions.some(sol => sol.id === solutionId)) {
                solutions.push({
                    id: solutionId,
                    left: leftExpr,
                    right: rightExpr,
                    points: points,
                    timestamp: Date.now(),
                    difficulty: currentDifficulty
                });
                
                // Save back to local storage
                localStorage.setItem(storageKey, JSON.stringify(solutions));
                
                // Update stats
                updateTotalPoints(points);
                updateSolutionsCount(1);
                
                // Update highest points if needed
                if (points > highestPoints) {
                    updateHighestPoints(points);
                }
                
                return true; // New solution saved
            }
            
            return false; // Solution already exists
        } catch (error) {
            console.warn('Failed to save solution to local storage:', error);
            return false;
        }
    }
    
    function updateTotalPoints(newPoints) {
        const storageKey = `${storagePrefix}total-points-${dateString}`;
        totalPoints += newPoints;
        localStorage.setItem(storageKey, totalPoints.toString());
    }
    
    function updateSolutionsCount(increment) {
        const storageKey = `${storagePrefix}solutions-count-${dateString}`;
        solutionsCount += increment;
        localStorage.setItem(storageKey, solutionsCount.toString());
    }
    
    function updateHighestPoints(points) {
        const storageKey = `${storagePrefix}highest-points-${dateString}`;
        highestPoints = points;
        localStorage.setItem(storageKey, highestPoints.toString());
    }
    
    // Load stats from local storage
    function loadStats() {
        try {
            // Load total points
            const pointsKey = `${storagePrefix}total-points-${dateString}`;
            const savedPoints = localStorage.getItem(pointsKey);
            totalPoints = savedPoints ? parseInt(savedPoints) : 0;
            
            // Load solutions count
            const countKey = `${storagePrefix}solutions-count-${dateString}`;
            const savedCount = localStorage.getItem(countKey);
            solutionsCount = savedCount ? parseInt(savedCount) : 0;
            
            // Load highest points
            const highestKey = `${storagePrefix}highest-points-${dateString}`;
            const savedHighest = localStorage.getItem(highestKey);
            highestPoints = savedHighest ? parseInt(savedHighest) : 0;
        } catch (error) {
            console.warn('Failed to load stats:', error);
        }
    }
    
    // Add event listeners for equation sides
    const leftSide = document.getElementById('left-side');
    const rightSide = document.getElementById('right-side');
    
    leftSide.addEventListener('click', function() {
        isLeftSide = true;
        updateActiveSide();
    });
    
    rightSide.addEventListener('click', function() {
        isLeftSide = false;
        updateActiveSide();
    });
    
    // Add event listeners to number buttons
    const numberButtons = document.querySelectorAll('#date-buttons .number');
    numberButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // Easy mode lets you use any number in any order
            // Medium/Hard modes require using numbers in order
            if (currentDifficulty === 'easy' || parseInt(button.textContent) === dateNumbers[currentNumberIndex]) {
                hideError();
                
                const newButton = document.createElement('button');
                newButton.textContent = button.textContent;
                newButton.classList.add('btn', 'number');
                
                // Add click handler to allow removal if it's the last button
                newButton.addEventListener('click', function() {
                    const currentSide = isLeftSide ? leftSide : rightSide;
                    
                    if (currentSide.lastElementChild === this) {
                        newButton.remove();
                        button.disabled = false;
                        button.classList.remove('disabled');
                        
                        if (currentDifficulty !== 'easy') {
                            currentNumberIndex--;
                        }
                        
                        updateCurrentValues();
                    }
                });
                
                // Add to the active side
                if (isLeftSide) {
                    leftSide.appendChild(newButton);
                } else {
                    rightSide.appendChild(newButton);
                }
                
                // Disable the original button
                button.disabled = true;
                button.classList.add('disabled');
                
                // Update the number index for ordered selection
                if (currentDifficulty !== 'easy') {
                    currentNumberIndex++;
                }
                
                updateCurrentValues();
            } else {
                showError('Please use numbers in the order they appear in the date.');
            }
        });
    });
    
    // Add event listeners to operator buttons
    const operatorButtons = document.querySelectorAll('#operator-buttons .operator');
    operatorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newButton = document.createElement('button');
            newButton.textContent = button.textContent;
            newButton.classList.add('btn', 'operator');
            
            // Add click handler to allow removal if it's the last button
            newButton.addEventListener('click', function() {
                const currentSide = isLeftSide ? leftSide : rightSide;
                
                if (currentSide.lastElementChild === this) {
                    this.remove();
                    updateCurrentValues();
                }
            });
            
            // Add to the active side
            if (isLeftSide) {
                leftSide.appendChild(newButton);
            } else {
                rightSide.appendChild(newButton);
            }
            
            updateCurrentValues();
        });
    });
    
    // Clear button functionality
    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', function() {
        // Clear both sides
        leftSide.innerHTML = '';
        rightSide.innerHTML = '';
        
        // Reset number selection
        currentNumberIndex = 0;
        
        // Re-enable all number buttons
        numberButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('disabled');
        });
        
        // Reset to left side
        isLeftSide = true;
        updateActiveSide();
        updateCurrentValues();
        hideError();
    });
    
    // Check button functionality
    const checkButton = document.getElementById('check-button');
    checkButton.addEventListener('click', function() {
        // Get expressions from both sides
        const leftExpression = Array.from(
            document.querySelectorAll('#left-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
        
        const rightExpression = Array.from(
            document.querySelectorAll('#right-side button')
        )
            .map(btn => btn.textContent)
            .join('')
            .replace(/\^/g, '**');
        
        // Calculate values
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        
        // Get used numbers
        const usedNumbers = Array.from(
            document.querySelectorAll('#left-side button, #right-side button')
        )
            .map(btn => btn.textContent)
            .filter(val => /^\d+$/.test(val))
            .join('');
        
        // Check if all date numbers were used when required
        const allDateNumbers = dateNumbers.map(num => num.toString()).join('');
        const allNumbersUsed = !difficultySettings[currentDifficulty].requireAllNumbers || 
                             (difficultySettings[currentDifficulty].requireAllNumbers && usedNumbers.length >= allDateNumbers.length);
        
        // Check for required operators in hard mode
        let hasRequiredOperators = true;
        if (currentDifficulty === 'hard') {
            const combinedExpression = leftExpression + rightExpression;
            const hasAddition = combinedExpression.includes('+');
            const hasSubtraction = combinedExpression.includes('-');
            const hasMultiplication = combinedExpression.includes('*');
            const hasDivision = combinedExpression.includes('/');
            hasRequiredOperators = hasAddition && hasSubtraction && hasMultiplication && hasDivision;
        }
        
        // Validate the solution
        if (leftExpression === '' || rightExpression === '') {
            showError('Please add numbers and operators to both sides of the equation.');
        } else if (leftValue === 'Error' || rightValue === 'Error') {
            showError('Invalid expression. Please check your equation.');
        } else if (!allNumbersUsed) {
            showError('You must use all numbers from the date.');
        } else if (!hasRequiredOperators && currentDifficulty === 'hard') {
            showError('Hard mode requires using at least one +, one -, one *, and one / operator.');
        } else if (leftValue === rightValue) {
            // Valid solution!
            hideError();
            
            // Calculate points based on difficulty
            let points;
            if (currentDifficulty === 'easy') {
                points = difficultySettings[currentDifficulty].fixedPoints; // Always 1 point for easy mode
            } else {
                // Calculate points based on operators used
                points = calculatePoints(leftExpression) + calculatePoints(rightExpression);
                points = Math.floor(points * difficultySettings[currentDifficulty].pointMultiplier);
            }
            
            // Save the solution
            if (saveSolution(leftExpression, rightExpression, points)) {
                // Display successful solution
                showModal('Correct Solution!', `
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <i class="fas fa-check-circle" style="color: #2ecc71; font-size: 3rem;"></i>
                    </div>
                    <p>Your equation is correct!</p>
                    <div class="solution-display">
                        ${formatExpression(leftExpression.replace(/\*\*/g, '^'))} = ${formatExpression(rightExpression.replace(/\*\*/g, '^'))}
                    </div>
                    <p>Points earned: <span class="badge badge-${currentDifficulty}">${points}</span></p>
                `);
            } else {
                showError('You already found this solution!');
            }
        } else {
            showError('Incorrect. The left side does not equal the right side.');
        }
    });
    
    // Difficulty selector functionality
    const difficultySelect = document.getElementById('difficulty');
    difficultySelect.addEventListener('change', function() {
        currentDifficulty = this.value;
        document.getElementById('difficulty-info').textContent = difficultySettings[currentDifficulty].description;

        // Save preference
        localStorage.setItem(`${storagePrefix}difficulty`, currentDifficulty);

        // Reset the game when difficulty changes
        clearButton.click();
    });

    // Load saved difficulty if available
    const savedDifficulty = localStorage.getItem(`${storagePrefix}difficulty`);
    if (savedDifficulty && difficultySettings[savedDifficulty]) {
        currentDifficulty = savedDifficulty;
        difficultySelect.value = currentDifficulty;
        document.getElementById('difficulty-info').textContent = difficultySettings[currentDifficulty].description;
    }
    
    // Add keyboard support
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        
        // Number keys
        if (!isNaN(parseInt(key))) {
            // Find matching number button that's not disabled
            const numberButton = Array.from(numberButtons).find(btn => 
                !btn.disabled && btn.textContent === key
            );
            
            if (numberButton) {
                if (currentDifficulty === 'easy' || parseInt(key) === dateNumbers[currentNumberIndex]) {
                    numberButton.click();
                    return;
                }
            }
        }
        
        // Operator keys
        if (['+', '-', '*', '/', '%', '(', ')', '^'].includes(key)) {
            const operatorButton = Array.from(operatorButtons).find(btn => 
                btn.textContent === key
            );
            
            if (operatorButton) {
                operatorButton.click();
                return;
            }
        }
        
        // Tab key to switch sides
        if (key === 'Tab') {
            event.preventDefault();
            isLeftSide = !isLeftSide;
            updateActiveSide();
        }
        
        // Enter key to check
        if (key === 'Enter') {
            checkButton.click();
        }
        
        // Backspace to remove last element
        if (key === 'Backspace') {
            const activeSide = isLeftSide ? leftSide : rightSide;
            if (activeSide.lastElementChild) {
                activeSide.lastElementChild.click();
            }
        }
        
        // Escape to clear
        if (key === 'Escape') {
            clearButton.click();
        }
    });
    
    // Navigation links functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Extract the section name from the link text
            const linkText = this.textContent.trim();
            const section = linkText.includes('Rules') ? 'rules' : 
                           linkText.includes('Solutions') ? 'solutions' :
                           linkText.includes('Shortcuts') ? 'shortcuts' : 'play';
            
            if (section === 'rules') {
                showModal('Game Rules', `
                    <div class="rules-container">
                        <div class="rules-section">
                            <h3><i class="fas fa-dice"></i> How to Play</h3>
                            <p>Create equations where both sides are equal using today's date digits and operators.</p>
                        </div>
                        
                        <div class="rules-section">
                            <h3><i class="fas fa-level-up-alt"></i> Difficulty Levels</h3>
                            <ul class="rules-list">
                                <li><span class="badge badge-easy">Easy</span> Use any date digits in any order <br>
                                <small>1 point per correct solution</small></li>
                                <li><span class="badge badge-medium">Medium</span> Must use all date digits in order <br>
                                <small>Points based on operators used</small></li>
                                <li><span class="badge badge-hard">Hard</span> Must use all date digits in order with +, -, *, and / <br>
                                <small>Double points!</small></li>
                            </ul>
                        </div>
                        
                        <div class="rules-section">
                            <h3><i class="fas fa-calculator"></i> Operator Points</h3>
                            <ul class="rules-list compact">
                                <li><strong>+</strong> or <strong>-</strong> : 1 point each</li>
                                <li><strong>×</strong>, <strong>÷</strong> or <strong>%</strong> : 2 points each</li>
                                <li><strong>^</strong> (power) : 3 points each</li>
                            </ul>
                        </div>
                    </div>
                `);
            } else if (section === 'solutions') {
                // Get solutions from local storage
                const solutions = getSavedSolutions();
                
                // Create formatted solutions HTML
                const solutionsHTML = solutions.length > 0 
                    ? solutions
                        .sort((a, b) => b.points - a.points)
                        .map(solution => {
                            const leftFormatted = formatExpression(solution.left.replace(/\*\*/g, '^'));
                            const rightFormatted = formatExpression(solution.right.replace(/\*\*/g, '^'));
                            
                            return `
                                <div class="solution-item">
                                    <span class="badge badge-${solution.difficulty}">${solution.difficulty}</span>
                                    <div class="solution-equation">
                                        ${leftFormatted} = ${rightFormatted}
                                    </div>
                                    <strong class="solution-points">${solution.points} pts</strong>
                                </div>
                            `;
                        })
                        .join('')
                    : '<p class="no-solutions">No solutions found yet. Start solving!</p>';
                
                showModal('Your Solutions', `
                    <div class="solutions-stats">
                        <div class="stat-item">
                            <i class="fas fa-star"></i>
                            <span class="stat-value">${totalPoints}</span>
                            <span class="stat-label">Total Points</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-check-circle"></i>
                            <span class="stat-value">${solutionsCount}</span>
                            <span class="stat-label">Solutions</span>
                        </div>
                    </div>
                    
                    <div class="solutions-list-container">
                        <h3>Your Equations</h3>
                        <div class="solutions-list">
                            ${solutionsHTML}
                        </div>
                    </div>
                `);
            } else if (section === 'shortcuts') {
                showModal('Keyboard Shortcuts', `
                    <div class="shortcuts-container">
                        <div class="shortcuts-section">
                            <h3><i class="fas fa-keyboard"></i> Input Shortcuts</h3>
                            <ul class="shortcuts-list">
                                <lable>Add date digits</lable>
                                <li><kbd>0</kbd>-<kbd>9</kbd></li>
                                <lable>Add operators</lable>
                                <li><kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd> <kbd>%</kbd> <kbd>(</kbd> <kbd>)</kbd> <kbd>^</kbd></li>
                            </ul>
                        </div>
                        
                        <div class="shortcuts-section">
                            <h3><i class="fas fa-mouse-pointer"></i> Navigation Shortcuts</h3>
                            <ul class="shortcuts-list">
                                <label>Switch between left/right side</label>
                                <li><kbd>Tab</kbd></li>
                                <label>Check equation</label>
                                <li><kbd>Enter</kbd></li>
                                <label>Remove last element</label>
                                <li><kbd>Backspace</kbd></li>
                                <label>Clear equation</label>
                                <li><kbd>Esc</kbd></li>
                            </ul>
                        </div>
                    </div>
                `);
            }
        });
    });
    
    // Initialize
    updateActiveSide();
    updateCurrentValues();
    hideError();
    loadStats();
});