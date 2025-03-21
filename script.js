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

        // Add dummy data if no solutions exist
        if (this.solutions.length === 0) {
            // Yesterday's solutions
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            this.solutions.push({
                date: `${yesterdayStr}T10:30:00.000Z`,
                left: '1+2+3',
                right: '4+2',
                points: 4,
                dateNumbers: '1234'
            });
            
            this.solutions.push({
                date: `${yesterdayStr}T15:45:00.000Z`,
                left: '2*3',
                right: '6',
                points: 2,
                dateNumbers: '1234'
            });

            // 2 days ago solutions
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
            
            this.solutions.push({
                date: `${twoDaysAgoStr}T09:15:00.000Z`,
                left: '1*2*3',
                right: '6',
                points: 4,
                dateNumbers: '1234'
            });

            // 3 days ago solutions
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
            
            this.solutions.push({
                date: `${threeDaysAgoStr}T11:20:00.000Z`,
                left: '2^2',
                right: '4',
                points: 3,
                dateNumbers: '1234'
            });
            
            this.solutions.push({
                date: `${threeDaysAgoStr}T14:30:00.000Z`,
                left: 'sqrt(16)',
                right: '4',
                points: 3,
                dateNumbers: '1234'
            });

            // Update stats with dummy data
            this.stats.totalSolutions = this.solutions.length;
            this.stats.totalPoints = this.solutions.reduce((sum, s) => sum + s.points, 0);
            this.stats.highScore = Math.max(...this.solutions.map(s => s.points));
            this.stats.currentStreak = 1;
            this.stats.bestStreak = 3;
            this.stats.averagePoints = this.stats.totalPoints / this.stats.totalSolutions;
            this.stats.lastPlayedDate = yesterdayStr;

            // Save the dummy data
            this.save();
        }
        
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

// Menu and Modal Management
const modalContent = {
    'how-to-play': {
        title: 'How to Play',
        content: `
            <h3>Objective</h3>
            <p>Create mathematical expressions that equal each other using today's date numbers.</p>
            
            <h3>Rules</h3>
            <ul>
                <li>Use all numbers from today's date in order</li>
                <li>Create expressions on both sides of the equation</li>
                <li>Expressions must equal each other</li>
                <li>More complex operations earn more points</li>
            </ul>
            
            <h3>Scoring</h3>
            <ul>
                <li>Basic operations (+, -): 1 point</li>
                <li>Advanced operations (×, ÷, mod): 2 points</li>
                <li>Complex operations (^, √, |, &): 3 points</li>
                <li>Functions (abs, log, !): 4 points</li>
            </ul>
        `
    },
    'your-solutions': {
        title: 'Your Solutions',
        content: () => {
            const todaysSolutions = gameData.getTodaysSolutions();
            return `
                <div class="solutions-list">
                    ${todaysSolutions.length > 0 ? 
                        todaysSolutions.map((solution, index) => `
                            <div class="solution-item" data-solution-index="${index}">
                                <div class="solution-header">
                                    <div class="solution-points">
                                        <i class="fas fa-star"></i>
                                        ${solution.points} points
                                    </div>
                                    <button class="solution-share" aria-label="Share solution">
                                        <i class="fas fa-share-alt"></i>
                                    </button>
                                </div>
                                <div class="solution-equation">
                                    ${formatExpression(solution.left)} = ${formatExpression(solution.right)}
                                </div>
                            </div>
                        `).join('') :
                        '<p>No solutions yet. Start playing to see your solutions here!</p>'
                    }
                </div>
                <div class="modal-actions">
                    <button class="modal-btn primary" id="share-all-btn">
                        <i class="fas fa-share-alt"></i>
                        Share All Solutions
                    </button>
                    <button class="modal-btn danger" id="clear-solutions-btn">
                        <i class="fas fa-trash"></i>
                        Clear All Solutions
                    </button>
                </div>
            `;
        }
    },
    'history': {
        title: 'Solution History',
        content: () => {
            // Get current date and first day of current month
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const firstDay = new Date(currentYear, currentMonth, 1);
            
            // Get days in month and first day of week
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const firstDayOfWeek = firstDay.getDay();
            
            // Get all dates with solutions or attempts
            const datesWithData = new Set(
                gameData.solutions.map(solution => solution.date.split('T')[0])
            );
            
            // Generate calendar HTML
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            
            let calendarHTML = `
                <div class="calendar-header">
                    <button class="calendar-nav" id="prev-month">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3>${monthNames[currentMonth]} ${currentYear}</h3>
                    <button class="calendar-nav" id="next-month">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div class="calendar-days">
            `;
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
                calendarHTML += '<div class="calendar-day empty"></div>';
            }
            
            // Add days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, currentMonth, day);
                const dateStr = date.toISOString().split('T')[0];
                const hasSolutions = datesWithData.has(dateStr);
                const isToday = day === today.getDate() && 
                              currentMonth === today.getMonth() && 
                              currentYear === today.getFullYear();
                
                calendarHTML += `
                    <div class="calendar-day ${hasSolutions ? 'has-solutions' : ''} ${isToday ? 'today' : ''}"
                         data-date="${dateStr}">
                        <span class="day-number">${day}</span>
                        ${hasSolutions ? '<i class="fas fa-check-circle"></i>' : ''}
                    </div>
                `;
            }
            
            calendarHTML += `
                    </div>
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-color has-solutions"></div>
                        <span>Has Solutions</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color today"></div>
                        <span>Today</span>
                    </div>
                </div>
            `;
            
            return calendarHTML;
        }
    },
    'keyboard-shortcuts': {
        title: 'Keyboard Shortcuts',
        content: `
            <h3>Navigation</h3>
            <ul>
                <li><kbd>Tab</kbd> Switch between left and right sides</li>
                <li><kbd>Enter</kbd> Check solution</li>
                <li><kbd>Escape</kbd> Clear equation</li>
            </ul>
            
            <h3>Numbers</h3>
            <p>Use number keys (0-9) to input date numbers in order</p>
            
            <h3>Operators</h3>
            <ul>
                <li><kbd>+</kbd> Addition</li>
                <li><kbd>-</kbd> Subtraction</li>
                <li><kbd>*</kbd> Multiplication</li>
                <li><kbd>/</kbd> Division</li>
                <li><kbd>%</kbd> Modulo</li>
                <li><kbd>^</kbd> Exponent</li>
                <li><kbd>(</kbd> Opening parenthesis</li>
                <li><kbd>)</kbd> Closing parenthesis</li>
            </ul>
        `
    }
};

// Format expression for display
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

function setupMenu() {
    const menuButton = document.querySelector('.menu-button');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.querySelector('.modal-close');

    // Create menu items
    const menuItems = document.createElement('div');
    menuItems.className = 'menu-items';
    menuItems.innerHTML = `
        <button class="menu-item" data-modal="how-to-play">
            <i class="fas fa-question-circle"></i> How to Play
        </button>
        <button class="menu-item" data-modal="your-solutions">
            <i class="fas fa-history"></i> Your Solutions
        </button>
        <button class="menu-item" data-modal="history">
            <i class="fas fa-calendar-alt"></i> History
        </button>
        <button class="menu-item" data-modal="keyboard-shortcuts">
            <i class="fas fa-keyboard"></i> Keyboard Shortcuts
        </button>
    `;

    // Add menu items to header
    const headerContent = document.querySelector('.header-content');
    headerContent.appendChild(menuItems);

    // Show/hide menu on button click
    menuButton.addEventListener('click', (e) => {
        console.log('Menu button clicked');
        menuItems.classList.toggle('active');
        e.stopPropagation(); // Prevent document click from immediately closing
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuButton.contains(e.target) && !menuItems.contains(e.target)) {
            menuItems.classList.remove('active');
        }
    });

    // Handle menu item clicks
    menuItems.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            console.log('Menu item clicked:', menuItem.dataset.modal);
            const modalType = menuItem.dataset.modal;
            showModal(modalType);
            menuItems.classList.remove('active');
            e.stopPropagation(); // Prevent event from bubbling
        }
    });

    // Handle modal close
    modalClose.addEventListener('click', () => {
        console.log('Modal close clicked');
        modal.classList.remove('active');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            console.log('Modal background clicked');
            modal.classList.remove('active');
        }
    });

    setupSolutionsModal();
}

function showModal(type) {
    try {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        if (!modalContent[type]) {
            console.error('Modal type not found:', type);
            return;
        }

        // Always reset the title first
        modalTitle.textContent = modalContent[type].title;
        
        const content = typeof modalContent[type].content === 'function' 
            ? modalContent[type].content()
            : modalContent[type].content;
            
        if (type === 'your-solutions') {
            const solutions = gameData.getTodaysSolutions();
            console.log('Today\'s solutions:', solutions);
        }
        
        modalBody.innerHTML = content;
        modal.classList.add('active');
    } catch (error) {
        console.error('Error showing modal:', error);
    }
}

function setupSolutionsModal() {
    const modalBody = document.getElementById('modal-body');

    // Handle individual solution sharing for today's solutions
    modalBody.addEventListener('click', (e) => {
        const solutionItem = e.target.closest('.solution-item');
        const shareButton = e.target.closest('.solution-share');
        
        if (shareButton && solutionItem) {
            // Check if we're in history view or today's solutions
            const date = solutionItem.dataset.date;
            const solutions = date ? 
                gameData.solutions.filter(s => s.date.startsWith(date)) :
                gameData.getTodaysSolutions();
            
            const index = parseInt(solutionItem.dataset.solutionIndex);
            
            if (!solutions || index >= solutions.length) {
                console.error('Invalid solution index or no solutions available');
                showMessage('Unable to share solution at this time', 'error');
                return;
            }
            
            const solution = solutions[index];
            if (!solution || !solution.left || !solution.right) {
                console.error('Invalid solution format:', solution);
                showMessage('Unable to share solution at this time', 'error');
                return;
            }
            
            shareSolution(solution);
            e.stopPropagation();
        }
    });

    // Handle share all button
    modalBody.addEventListener('click', (e) => {
        if (e.target.closest('#share-all-btn')) {
            const solutionsList = modalBody.querySelector('.solutions-list');
            const date = solutionsList?.dataset.date;
            const solutions = date ? 
                gameData.solutions.filter(s => s.date.startsWith(date)) :
                gameData.getTodaysSolutions();
            
            if (solutions && solutions.length > 0) {
                shareAllSolutions(solutions);
            } else {
                showMessage('No solutions available to share', 'error');
            }
            e.stopPropagation();
        }
    });
}

function shareSolution(solution) {
    if (!solution || !solution.left || !solution.right) {
        console.error('Invalid solution object:', solution);
        showMessage('Unable to share solution at this time', 'error');
        return;
    }
    
    const shareText = formatSolutionForSharing(solution);
    copyToClipboard(shareText);
    showMessage('Solution copied to clipboard!', 'success');
}

function shareAllSolutions(solutions) {
    const shareText = solutions.map(formatSolutionForSharing).join('\n\n');
    copyToClipboard(shareText);
    showMessage('All solutions copied to clipboard!', 'success');
}

function formatSolutionForSharing(solution) {
    if (!solution || !solution.left || !solution.right) {
        console.error('Invalid solution format in formatting:', solution);
        return 'Error formatting solution';
    }
    
    const left = solution.left.replace(/[+\-*/%^√!|&]|abs|log/g, '□');
    const right = solution.right.replace(/[+\-*/%^√!|&]|abs|log/g, '□');
    return `${left} = ${right}\n${solution.points} points`;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
        showMessage('Failed to copy to clipboard', 'error');
    });
}

function showConfirmationDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'confirmation-dialog';
    dialog.innerHTML = `
        <h3>Clear Today's Solutions?</h3>
        <p>Are you sure you want to clear all your solutions for today? This action cannot be undone.</p>
        <div class="confirmation-actions">
            <button class="modal-btn danger" id="confirm-clear">Yes, Clear Today's</button>
            <button class="modal-btn" id="cancel-clear">Cancel</button>
        </div>
    `;

    // Append to body instead of modal
    document.body.appendChild(dialog);

    dialog.querySelector('#confirm-clear').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        gameData.solutions = gameData.solutions.filter(solution => 
            !solution.date.startsWith(today)
        );
        gameData.save();
        dialog.remove();
        showModal('your-solutions');
        showMessage('Today\'s solutions cleared!', 'success');
    });

    dialog.querySelector('#cancel-clear').addEventListener('click', () => {
        dialog.remove();
    });
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

function setupHistoryModal() {
    const modal = document.getElementById('modal');
    const modalBody = modal.querySelector('.modal-body');
    let currentDate = new Date();

    // Handle calendar day clicks
    modalBody.addEventListener('click', (e) => {
        const calendarDay = e.target.closest('.calendar-day');
        if (calendarDay && !calendarDay.classList.contains('empty')) {
            const date = calendarDay.dataset.date;
            const solutions = gameData.solutions.filter(s => s.date.startsWith(date));
            
            // Update existing modal title
            const modalTitle = document.getElementById('modal-title');
            modalTitle.textContent = `Solutions for ${new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`;
            
            modalBody.innerHTML = `
                <div class="solutions-list" data-date="${date}">
                    ${solutions.length > 0 ? 
                        solutions.map((solution, index) => `
                            <div class="solution-item" data-solution-index="${index}" data-date="${date}">
                                <div class="solution-header">
                                    <div class="solution-points">
                                        <i class="fas fa-star"></i>
                                        ${solution.points} points
                                    </div>
                                    ${solution.left && solution.right ? `
                                        <button class="solution-share" aria-label="Share solution">
                                            <i class="fas fa-share-alt"></i>
                                        </button>
                                    ` : ''}
                                </div>
                                <div class="solution-equation">
                                    ${formatExpression(solution.left)} = ${formatExpression(solution.right)}
                                </div>
                            </div>
                        `).join('') :
                        '<p>No solutions found for this date.</p>'
                    }
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" id="back-to-history">
                        <i class="fas fa-arrow-left"></i>
                        Back to Calendar
                    </button>
                    ${solutions.length > 0 ? `
                        <button class="modal-btn primary" id="share-all-btn">
                            <i class="fas fa-share-alt"></i>
                            Share All Solutions
                        </button>
                    ` : ''}
                </div>
            `;
        }
        
        // Handle back to calendar button
        if (e.target.closest('#back-to-history')) {
            const modalTitle = modal.querySelector('#modal-title');
            modalTitle.textContent = 'Solution History';
            showModal('history');
        }
    });

    // Handle solution sharing in history view
    modalBody.addEventListener('click', (e) => {
        const solutionItem = e.target.closest('.solution-item');
        const shareButton = e.target.closest('.solution-share');
        
        if (shareButton && solutionItem) {
            const index = parseInt(solutionItem.dataset.solutionIndex);
            const date = solutionItem.dataset.date;
            const solutions = gameData.solutions.filter(s => s.date.startsWith(date));
            
            if (!solutions || index >= solutions.length) {
                console.error('Invalid solution index or no solutions available');
                showMessage('Unable to share solution at this time', 'error');
                return;
            }
            
            const solution = solutions[index];
            if (!solution || !solution.left || !solution.right) {
                console.error('Invalid solution format:', solution);
                showMessage('Unable to share solution at this time', 'error');
                return;
            }
            
            shareSolution(solution);
            e.stopPropagation();
        }

        // Handle share all button in history view
        if (e.target.closest('#share-all-btn')) {
            const solutionsList = modalBody.querySelector('.solutions-list');
            const date = solutionsList.dataset.date;
            const solutions = gameData.solutions.filter(s => s.date.startsWith(date));
            
            if (solutions && solutions.length > 0) {
                shareAllSolutions(solutions);
            } else {
                showMessage('No solutions available to share', 'error');
            }
            e.stopPropagation();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Set header date
    document.getElementById('header-date').textContent = formatDate(new Date());
    
    // Setup menu and modal
    setupMenu();
    
    // Game state
    let isLeftSide = true;
    let currentNumberIndex = 0;
    
    // Initialize date data
    const today = new Date();
    window.dateNumbers = getDateNumbers(today);
    
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
            .join('');
    }
    
    function safeEval(expression) {
        if (!expression) return '';
        try {
            // Check for incomplete expressions
            if (/[+\-*/%^]$/.test(expression) ||    // Ends with operator
                /\([^)]*$/.test(expression) ||      // Unclosed parenthesis
                /[+\-*/%^]\($/.test(expression) ||  // Operator followed by opening parenthesis
                /√$/.test(expression) ||            // Ends with square root symbol
                /√(?!\d|\()/.test(expression) ||    // Square root not followed by number or parenthesis
                /[|&]$/.test(expression) ||         // Ends with bitwise operator
                /[|&](?!\d|\()/.test(expression)) { // Bitwise operator not followed by number or parenthesis
                return '';
            }
            const cleaned = cleanExpression(expression);
            
            // Include factorial function in evaluation scope
            const result = Function(`
                'use strict';
                function factorial(n) {
                    if (n < 0) return NaN;
                    if (n === 0) return 1;
                    let result = 1;
                    for (let i = 2; i <= n; i++) result *= i;
                    return result;
                }
                return (${cleaned});
            `)();
            
            return result;
        } catch (error) {
            return '';
        }
    }
    
    function cleanExpression(expression) {
        let result = expression
            // Convert square root symbol to Math.sqrt with proper parentheses
            .replace(/√(\d+)/g, 'Math.sqrt($1)')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/Math\.sqrt(?!\()/g, 'Math.sqrt(')
            
            // Handle basic arithmetic with parentheses
            .replace(/(\d+)\s*%\s*(\d+)/g, '($1%$2)')
            // Handle implicit multiplication between numbers and parentheses
            .replace(/(\d+)\s*\(/g, '$1*(')
            .replace(/\)\s*(\d+)/g, ')*$1')
            .replace(/-\s*\(/g, '-1*(')
            
            // Handle multiplication between numbers and functions
            .replace(/(\d+)(log|abs|sqrt)/g, '$1*$2')
            
            // Handle functions with their arguments in parentheses
            .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
            .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
            
            // Handle factorial after a number or parenthesized expression
            .replace(/(\d+)!/g, 'factorial($1)')
            .replace(/\(([^)]+)\)!/g, 'factorial($1)')
            
            // Handle functions followed by numbers or opening parenthesis
            .replace(/(\d+)!(\d+|\()/g, 'factorial($1)*$2')
            
            // Handle operators inside parentheses
            .replace(/\(([^)]*)(\d+)\s*%\s*(\d+)([^)]*)\)/g, '($1($2%$3)$4)')
            .replace(/\(([^)]*)(\d+)\s*\^\s*(\d+)([^)]*)\)/g, '($1Math.pow($2,$3)$4)')
            .replace(/\(([^)]*)(\d+)\s*&\s*(\d+)([^)]*)\)/g, '($1($2&$3)$4)')
            .replace(/\(([^)]*)(\d+)\s*\|\s*(\d+)([^)]*)\)/g, '($1($2|$3)$4)')
            
            // Handle standalone operators
            .replace(/(\d+)\s*&\s*(\d+)/g, '($1&$2)')
            .replace(/(\d+)\s*\|\s*(\d+)/g, '($1|$2)')
            .replace(/(\d+)\^(\d+)/g, 'Math.pow($1, $2)')
            
            // Handle empty parentheses
            .replace(/\(\)/g, '0')
            
            // Ensure all Math.sqrt calls have proper closing parentheses
            .replace(/Math\.sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');
            
        return result;
    }
    
    // === UI Update Functions ===
    function updateCurrentValues() {
        const leftSide = document.getElementById('left-side');
        const rightSide = document.getElementById('right-side');
        const leftExpression = getExpressionFromSide(leftSide);
        const rightExpression = getExpressionFromSide(rightSide);
        
        const leftValue = safeEval(leftExpression);
        const rightValue = safeEval(rightExpression);
        
        document.getElementById('left-value').textContent = leftValue !== '' ? leftValue : '?';
        document.getElementById('right-value').textContent = rightValue !== '' ? rightValue : '?';
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
        const isFunction = ['abs', 'log', '√'].includes(buttonText);
        
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
                type: 'function',
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

    setupHistoryModal();
});

function handleOperatorClick(event) {
    const operator = event.target.textContent;
    const input = document.getElementById('calculator-input');
    const cursorPos = input.selectionStart;
    const currentValue = input.value;
    
    let newValue;
    if (['log', 'abs', '√'].includes(operator)) {
        // Add opening parenthesis for functions
        newValue = currentValue.slice(0, cursorPos) + operator + '(' + currentValue.slice(cursorPos);
        input.value = newValue;
        input.setSelectionRange(cursorPos + operator.length + 1, cursorPos + operator.length + 1);
    } else {
        // Handle other operators normally
        newValue = currentValue.slice(0, cursorPos) + operator + currentValue.slice(cursorPos);
        input.value = newValue;
        input.setSelectionRange(cursorPos + operator.length, cursorPos + operator.length);
    }
    
    updatePoints();
    input.focus();
}