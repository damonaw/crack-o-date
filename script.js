class CrackODate {
    constructor() {
        this.todaysDate = new Date();
        this.dateDigits = [];
        this.usedDigits = new Set();
        this.score = 0;
        this.activeInput = null;
        this.leftSideElements = [];
        this.rightSideElements = [];
        this.darkMode = localStorage.getItem('darkMode') === 'true';
        this.advancedMode = localStorage.getItem('advancedMode') === 'true';
        this.roundStartedInAdvancedMode = false;
        
        this.init();
    }

    init() {
        this.initializeTheme();
        this.setupDateDigits();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateDisplay();
        this.updateModeDisplays();
    }

    initializeTheme() {
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    setupDateDigits(customDate = null) {
        // Format: M/D/YYYY (no leading zeros for single digits)
        // Use local date to avoid timezone issues
        const now = customDate || new Date();
        // Force local timezone interpretation
        const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
        const month = localDate.getMonth() + 1;
        const day = localDate.getDate();
        const year = localDate.getFullYear();
        
        // Store the current game date
        this.currentGameDate = localDate;
        
        // Update the calendar icon with correct date
        this.updateCalendarIcon(month, day);
        
        const dateString = `${month}${day}${year}`;
        this.dateDigits = dateString.split('').map(digit => parseInt(digit));
        
        this.renderDateDigits();
    }

    updateCalendarIcon(month, day) {
        // Create a dynamic calendar icon with today's date
        const header = document.querySelector('header h1');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthAbbr = monthNames[month - 1];
        
        // Create a styled calendar icon with the date
        header.innerHTML = `<span class="calendar-icon">
            <span class="calendar-month">${monthAbbr}</span>
            <span class="calendar-day">${day}</span>
        </span> Crack-O-Date`;
    }

    renderDateDigits() {
        const container = document.getElementById('dateDigits');
        container.innerHTML = '';
        
        // Use the current game date
        const localDate = this.currentGameDate || new Date();
        const month = localDate.getMonth() + 1;
        const day = localDate.getDate();
        const year = localDate.getFullYear();
        
        let digitIndex = 0;
        
        // Add month digits
        const monthStr = month.toString();
        for (let i = 0; i < monthStr.length; i++) {
            this.addDateDigit(container, monthStr[i], digitIndex);
            digitIndex++;
        }
        
        // Add separator
        this.addDateSeparator(container, '/');
        
        // Add day digits
        const dayStr = day.toString();
        for (let i = 0; i < dayStr.length; i++) {
            this.addDateDigit(container, dayStr[i], digitIndex);
            digitIndex++;
        }
        
        // Add separator
        this.addDateSeparator(container, '/');
        
        // Add year digits
        const yearStr = year.toString();
        for (let i = 0; i < yearStr.length; i++) {
            this.addDateDigit(container, yearStr[i], digitIndex);
            digitIndex++;
        }
        
        // Re-add drag listeners to operators since they're static
        this.setupOperatorDragListeners();
    }

    addDateDigit(container, digitValue, index) {
        const digitElement = document.createElement('div');
        digitElement.className = 'date-digit';
        digitElement.textContent = digitValue;
        digitElement.draggable = true;
        digitElement.dataset.value = digitValue;
        digitElement.dataset.index = index;
        digitElement.dataset.type = 'digit';
        
        container.appendChild(digitElement);
    }

    addDateSeparator(container, separator) {
        const separatorElement = document.createElement('div');
        separatorElement.className = 'date-separator';
        separatorElement.textContent = separator;
        separatorElement.style.cssText = `
            font-size: 1.5em;
            font-weight: bold;
            color: var(--text-tertiary);
            display: flex;
            align-items: center;
            padding: 0 5px;
            pointer-events: none;
        `;
        
        container.appendChild(separatorElement);
    }

    setupOperatorDragListeners() {
        document.querySelectorAll('.operator').forEach(op => {
            op.dataset.type = 'operator';
            op.addEventListener('dragstart', this.handleDragStart.bind(this));
            op.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    setupEventListeners() {
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAll());
        
        // Submit button
        document.getElementById('submitBtn').addEventListener('click', () => this.submitEquation());
        
        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleMenu());
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('header')) {
                this.closeMenu();
            }
        });
        
        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.darkMode = e.target.checked;
            this.updateDarkMode();
        });
        
        // Advanced mode toggle
        document.getElementById('advancedModeToggle').addEventListener('change', (e) => {
            this.advancedMode = e.target.checked;
            this.updateAdvancedMode();
        });
        
        // Menu item event listeners
        document.getElementById('scoringBtn').addEventListener('click', () => {
            this.showScoringModal();
            this.closeMenu();
        });
        
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showHowToPlayModal();
            this.closeMenu();
        });
        
        document.getElementById('operatorsBtn').addEventListener('click', () => {
            this.showOperatorsModal();
            this.closeMenu();
        });
        
        // Modal close event listeners
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Calendar icon click event listener
        document.addEventListener('click', (e) => {
            if (e.target.closest('.calendar-icon')) {
                this.showDatePicker();
            }
        });
        
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.closeModal();
            }
        });
        
        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // Click on equation sides to make them active
        document.getElementById('leftSide').addEventListener('click', (e) => {
            if (e.target.classList.contains('equation-element')) {
                this.removeElement(e.target);
            } else {
                this.setActiveInput('left');
            }
        });
        
        document.getElementById('rightSide').addEventListener('click', (e) => {
            if (e.target.classList.contains('equation-element')) {
                this.removeElement(e.target);
            } else {
                this.setActiveInput('right');
            }
        });
        
        // Click on digits and operators to add to active input
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('date-digit') && !e.target.classList.contains('used')) {
                if (this.activeInput) {
                    this.addToActiveInput(e.target.dataset.value, 'digit', e.target.dataset.index);
                }
            } else if (e.target.classList.contains('operator')) {
                if (this.activeInput) {
                    this.addToActiveInput(e.target.dataset.op, 'operator');
                }
            }
        });
    }

    toggleMenu() {
        const menu = document.getElementById('menuDropdown');
        menu.classList.toggle('show');
    }

    closeMenu() {
        const menu = document.getElementById('menuDropdown');
        menu.classList.remove('show');
    }

    updateDarkMode() {
        localStorage.setItem('darkMode', this.darkMode);
        
        if (this.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    updateAdvancedMode() {
        localStorage.setItem('advancedMode', this.advancedMode);
        this.updateResultDisplay();
    }

    updateModeDisplays() {
        // Update dark mode toggle
        document.getElementById('darkModeToggle').checked = this.darkMode;
        
        // Update advanced mode toggle
        document.getElementById('advancedModeToggle').checked = this.advancedMode;
    }

    updateResultDisplay() {
        const resultDisplay = document.querySelector('.result-display');
        if (this.advancedMode) {
            resultDisplay.classList.add('hidden');
        } else {
            resultDisplay.classList.remove('hidden');
        }
    }

    addToSide(side, value, type, index) {
        // Track if this is the first move in advanced mode
        if (this.advancedMode && this.leftSideElements.length === 0 && this.rightSideElements.length === 0) {
            this.roundStartedInAdvancedMode = true;
        }
        
        if (type === 'digit') {
            // Check if digit is already used
            if (this.usedDigits.has(parseInt(index))) {
                return;
            }
            this.usedDigits.add(parseInt(index));
            this.markDigitAsUsed(index);
        }
        
        const element = {
            value: value,
            type: type,
            index: index,
            id: Date.now() + Math.random()
        };
        
        if (side === 'left') {
            this.leftSideElements.push(element);
        } else {
            this.rightSideElements.push(element);
        }
        
        this.updateDisplay();
    }

    setupDragAndDrop() {
        // Add drag event listeners to all draggable elements
        this.addDragListeners();
        
        // Setup drop zones
        const leftSide = document.getElementById('leftSide');
        const rightSide = document.getElementById('rightSide');
        
        [leftSide, rightSide].forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
            zone.addEventListener('dragenter', this.handleDragEnter.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
        });
    }

    addDragListeners() {
        // Date digits
        document.querySelectorAll('.date-digit').forEach(digit => {
            digit.addEventListener('dragstart', this.handleDragStart.bind(this));
            digit.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Operators
        document.querySelectorAll('.operator').forEach(op => {
            op.addEventListener('dragstart', this.handleDragStart.bind(this));
            op.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
        
        // Equation elements (for rearranging)
        document.querySelectorAll('.equation-element').forEach(elem => {
            elem.addEventListener('dragstart', this.handleDragStart.bind(this));
            elem.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    handleDragStart(e) {
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        
        const dragData = {
            type: e.target.dataset.type,
            value: e.target.dataset.value || e.target.dataset.op,
            index: e.target.dataset.index,
            source: e.target.dataset.source || 'palette',
            id: e.target.dataset.id
        };
        
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetSide = e.target.dataset.side || e.target.closest('.equation-side').dataset.side;
        
        if (dragData.source === 'palette') {
            // Adding from palette
            if (dragData.type === 'digit') {
                this.addToSide(targetSide, dragData.value, dragData.type, dragData.index);
            } else {
                this.addToSide(targetSide, dragData.value, dragData.type);
            }
        } else {
            // Rearranging within equation
            this.moveElement(dragData, targetSide);
        }
    }

    setActiveInput(side) {
        // Remove active class from both sides
        document.getElementById('leftSide').classList.remove('active');
        document.getElementById('rightSide').classList.remove('active');
        
        // Add active class to selected side
        document.getElementById(side + 'Side').classList.add('active');
        this.activeInput = side;
    }

    addToActiveInput(value, type, index) {
        if (!this.activeInput) return;
        
        if (type === 'digit') {
            this.addToSide(this.activeInput, value, type, index);
        } else {
            this.addToSide(this.activeInput, value, type);
        }
    }

    removeElement(elementDiv) {
        const elementId = parseFloat(elementDiv.dataset.id);
        
        // Find and remove from appropriate side
        let removed = false;
        
        this.leftSideElements = this.leftSideElements.filter(elem => {
            if (elem.id === elementId) {
                if (elem.type === 'digit') {
                    this.usedDigits.delete(parseInt(elem.index));
                    this.markDigitAsAvailable(elem.index);
                }
                removed = true;
                return false;
            }
            return true;
        });
        
        if (!removed) {
            this.rightSideElements = this.rightSideElements.filter(elem => {
                if (elem.id === elementId) {
                    if (elem.type === 'digit') {
                        this.usedDigits.delete(parseInt(elem.index));
                        this.markDigitAsAvailable(elem.index);
                    }
                    return false;
                }
                return true;
            });
        }
        
        this.updateDisplay();
    }

    moveElement(dragData, targetSide) {
        // Find and remove the element from its current position
        const sourceElement = this.findElementById(dragData.id);
        if (!sourceElement) return;
        
        // Remove from source side
        this.removeElementById(dragData.id);
        
        // Add to target side
        this.addToSide(targetSide, sourceElement.value, sourceElement.type, sourceElement.index);
    }

    findElementById(id) {
        const allElements = [...this.leftSideElements, ...this.rightSideElements];
        return allElements.find(elem => elem.id === parseFloat(id));
    }

    removeElementById(id) {
        const elementId = parseFloat(id);
        
        // Remove from left side
        this.leftSideElements = this.leftSideElements.filter(elem => {
            if (elem.id === elementId) {
                if (elem.type === 'digit') {
                    this.usedDigits.delete(parseInt(elem.index));
                    this.markDigitAsAvailable(elem.index);
                }
                return false;
            }
            return true;
        });
        
        // Remove from right side
        this.rightSideElements = this.rightSideElements.filter(elem => {
            if (elem.id === elementId) {
                if (elem.type === 'digit') {
                    this.usedDigits.delete(parseInt(elem.index));
                    this.markDigitAsAvailable(elem.index);
                }
                return false;
            }
            return true;
        });
    }

    markDigitAsUsed(index) {
        const digit = document.querySelector(`[data-index="${index}"]`);
        if (digit) {
            digit.classList.add('used');
        }
    }

    markDigitAsAvailable(index) {
        const digit = document.querySelector(`[data-index="${index}"]`);
        if (digit) {
            digit.classList.remove('used');
        }
    }

    updateDisplay() {
        this.renderEquationSide('left', this.leftSideElements);
        this.renderEquationSide('right', this.rightSideElements);
        this.evaluateEquations();
        this.updateControls();
        this.updateResultDisplay();
    }

    renderEquationSide(side, elements) {
        const container = document.getElementById(side + 'Side');
        container.innerHTML = '';
        
        if (elements.length === 0) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.textContent = 'Drop numbers and operators here';
            container.appendChild(dropZone);
        } else {
            elements.forEach(element => {
                const elemDiv = document.createElement('div');
                elemDiv.className = 'equation-element';
                elemDiv.textContent = this.getDisplayValue(element.value);
                elemDiv.draggable = true;
                elemDiv.dataset.id = element.id;
                elemDiv.dataset.type = element.type;
                elemDiv.dataset.value = element.value;
                elemDiv.dataset.source = 'equation';
                
                // Add drag listeners
                elemDiv.addEventListener('dragstart', this.handleDragStart.bind(this));
                elemDiv.addEventListener('dragend', this.handleDragEnd.bind(this));
                
                container.appendChild(elemDiv);
            });
        }
    }

    getDisplayValue(value) {
        const displayMap = {
            '**': 'pow',
            '%': 'mod',
            '*': '×',
            'sqrt': '√',
            'abs': 'abs'
        };
        return displayMap[value] || value;
    }

    evaluateEquations() {
        const leftExpression = this.buildExpression(this.leftSideElements);
        const rightExpression = this.buildExpression(this.rightSideElements);
        
        let leftResult = 0;
        let rightResult = 0;
        
        try {
            leftResult = leftExpression ? this.safeEval(leftExpression) : 0;
        } catch (e) {
            leftResult = 'Error';
        }
        
        try {
            rightResult = rightExpression ? this.safeEval(rightExpression) : 0;
        } catch (e) {
            rightResult = 'Error';
        }
        
        // Update display
        document.getElementById('leftResult').textContent = leftResult;
        document.getElementById('rightResult').textContent = rightResult;
        
        const comparison = document.getElementById('comparison');
        
        if (leftResult !== 'Error' && rightResult !== 'Error' && leftResult === rightResult && leftResult !== 0) {
            comparison.textContent = '=';
            comparison.classList.add('equal');
        } else {
            comparison.textContent = '≠';
            comparison.classList.remove('equal');
        }
        
        this.currentLeftResult = leftResult;
        this.currentRightResult = rightResult;
    }

    buildExpression(elements) {
        if (elements.length === 0) return '';
        
        let expression = '';
        
        elements.forEach(element => {
            if (element.type === 'digit') {
                expression += element.value;
            } else if (element.type === 'operator') {
                if (element.value === 'abs') {
                    expression += 'Math.abs(';
                } else if (element.value === 'sqrt') {
                    expression += 'Math.sqrt(';
                } else if (element.value === '%') {
                    expression += ' % ';
                } else if (element.value === '**') {
                    expression += ' ** ';
                } else {
                    expression += element.value;
                }
            }
        });
        
        return expression;
    }

    safeEval(expression) {
        // Simple evaluation - in a real app, you'd want a proper expression parser
        // This is a basic implementation for demonstration
        try {
            // Replace some operators for JavaScript evaluation
            let jsExpression = expression;
            
            // Handle function calls like abs and sqrt
            // This is a simplified version - a real implementation would need proper parsing
            
            return Function(`"use strict"; return (${jsExpression})`)();
        } catch (e) {
            throw new Error('Invalid expression');
        }
    }

    updateControls() {
        const hasElements = this.leftSideElements.length > 0 || this.rightSideElements.length > 0;
        const areEqual = this.currentLeftResult === this.currentRightResult && 
                        this.currentLeftResult !== 0 && 
                        this.currentLeftResult !== 'Error' && 
                        this.currentRightResult !== 'Error';
        
        // New rule: all digits must be used and in order
        const allDigitsUsed = this.usedDigits.size === this.dateDigits.length;
        const usedInOrder = this.checkDigitsInOrder();
        const validSolution = areEqual && allDigitsUsed && usedInOrder;
        
        // Show error for out of order digits
        if (hasElements && allDigitsUsed && !usedInOrder) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = setTimeout(() => {
                this.showError('Numbers must be used in order!');
            }, 500);
        }
        
        document.getElementById('clearBtn').disabled = !hasElements;
        document.getElementById('submitBtn').disabled = !validSolution;
    }

    clearAll() {
        this.leftSideElements = [];
        this.rightSideElements = [];
        this.usedDigits.clear();
        this.activeInput = null;
        this.roundStartedInAdvancedMode = false;
        
        // Reset all digit availability
        document.querySelectorAll('.date-digit').forEach(digit => {
            digit.classList.remove('used');
        });
        
        // Remove active classes
        document.getElementById('leftSide').classList.remove('active');
        document.getElementById('rightSide').classList.remove('active');
        
        this.updateDisplay();
    }

    submitEquation() {
        if (this.currentLeftResult !== this.currentRightResult || 
            this.currentLeftResult === 0 || 
            this.currentLeftResult === 'Error') {
            return;
        }
        
        const points = this.calculatePoints();
        this.score += points;
        
        // Update score display
        document.getElementById('score').textContent = this.score;
        
        // Show success animation
        document.querySelector('.container').classList.add('success-animation');
        setTimeout(() => {
            document.querySelector('.container').classList.remove('success-animation');
        }, 500);
        
        // Show points earned
        this.showPointsEarned(points);
        
        // Clear the equation for next round
        this.clearAll();
    }

    calculatePoints() {
        let points = 1; // Base point for valid solution (all digits used in order, sides equal)
        
        // Add bonus points for operators used
        const operatorCount = this.countOperators();
        points += operatorCount;
        
        // Advanced mode bonus: extra point if the round was played entirely in advanced mode
        if (this.roundStartedInAdvancedMode) {
            points += 1;
        }
        
        return points;
    }

    checkDigitsInOrder() {
        // Get all digit elements from both sides in order
        const allElements = [...this.leftSideElements, ...this.rightSideElements];
        const digitElements = allElements.filter(elem => elem.type === 'digit');
        
        // Check if the indices are in ascending order
        let lastIndex = -1;
        for (let elem of digitElements) {
            const currentIndex = parseInt(elem.index);
            if (currentIndex <= lastIndex) {
                return false;
            }
            lastIndex = currentIndex;
        }
        
        return true;
    }

    countOperators() {
        const allElements = [...this.leftSideElements, ...this.rightSideElements];
        return allElements.filter(elem => elem.type === 'operator').length;
    }

    showPointsEarned(points) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #38a169;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        notification.textContent = `+${points} points!`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 2000);
    }

    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--equation-element-bg);
            color: white;
            padding: 16px 20px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 8px 24px rgba(66, 153, 225, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Trigger slide-in animation
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        // Create a temporary error notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--error-color);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 8px 24px rgba(229, 62, 62, 0.3);
            max-width: 300px;
            text-align: center;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    showModal(icon, title, content) {
        const modalTitle = document.getElementById('modalTitle');
        modalTitle.innerHTML = `
            <div class="modal-icon">${icon}</div>
            <span>${title}</span>
        `;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalOverlay').classList.add('show');
        
        // Trigger icon animation
        setTimeout(() => {
            const modalIcon = document.querySelector('.modal-icon');
            if (modalIcon) {
                modalIcon.querySelector('::before')?.style.setProperty('transform', 'translateX(100%)');
            }
        }, 100);
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('show');
    }

    showDatePicker() {
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        const content = `
            <h3>Select a Date to Play</h3>
            <p style="margin-bottom: 20px; color: var(--text-tertiary);">
                Choose any date in the past to play Crack-O-Date as if it were that day!
            </p>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <input type="date" id="datePicker" max="${maxDate}" 
                       style="padding: 10px; font-size: 16px; border: 2px solid var(--border-color); 
                              border-radius: 8px; background: var(--container-bg); color: var(--text-primary);">
                <div style="display: flex; gap: 10px;">
                    <button id="todayBtn" class="btn btn-secondary">Today</button>
                    <button id="selectDateBtn" class="btn btn-primary">Play This Date</button>
                </div>
            </div>
        `;
        
        this.showModal('📅 Date Picker', content);
        
        // Set up date picker event listeners
        setTimeout(() => {
            const datePicker = document.getElementById('datePicker');
            const todayBtn = document.getElementById('todayBtn');
            const selectDateBtn = document.getElementById('selectDateBtn');
            
            // Set default value to today
            datePicker.value = maxDate;
            
            todayBtn.addEventListener('click', () => {
                this.setGameDate(today);
                this.closeModal();
            });
            
            selectDateBtn.addEventListener('click', () => {
                if (datePicker.value) {
                    const selectedDate = new Date(datePicker.value + 'T00:00:00');
                    this.setGameDate(selectedDate);
                    this.closeModal();
                }
            });
        }, 100);
    }

    setGameDate(newDate) {
        // Clear current game state
        this.clearAll();
        
        // Reset score to 0 when changing dates
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        
        // Update date digits with new date
        this.setupDateDigits(newDate);
        
        // Show notification about date change
        const dateStr = newDate.toLocaleDateString();
        this.showNotification(`Now playing Crack-O-Date for ${dateStr}!`);
    }

    showScoringModal() {
        const content = `
            <h3>Scoring System</h3>
            <ul>
                <li><strong>1 point</strong> - Base point for creating a valid equation (all digits used in order, both sides equal)</li>
                <li><strong>+1 point per operator</strong> - Bonus points for each operator used in your equation</li>
                <li><strong>+1 point</strong> - Advanced mode bonus (if the entire round was played in advanced mode)</li>
            </ul>
            <p style="margin-top: 20px; color: var(--text-tertiary);">
                <strong>Example:</strong> If you create the equation "7 + 1 = 8" using 3 operators, you would earn 4 points total (1 base + 3 operators).
            </p>
        `;
        this.showModal('📊 Scoring', content);
    }

    showHowToPlayModal() {
        const content = `
            <h3>How to Play</h3>
            <ul>
                <li>Use ALL of today's date digits to create equal mathematical expressions</li>
                <li>Digits must be used in the order they appear in the date</li>
                <li>Drag and drop digits and operators to build equations</li>
                <li>Both sides of the equation must be equal to submit</li>
                <li>Click on equation sides to make them active for easy building</li>
                <li>Use Advanced Mode to hide live results for extra challenge</li>
            </ul>
            <p style="margin-top: 20px; color: var(--text-tertiary);">
                <strong>Goal:</strong> Create as many valid equations as possible to maximize your score!
            </p>
        `;
        this.showModal('❓ How to Play', content);
    }

    showOperatorsModal() {
        const content = `
            <h3>Available Operators</h3>
            <div class="examples-grid">
                <div class="example-item">
                    <strong>+</strong>
                    <code>Addition</code>
                </div>
                <div class="example-item">
                    <strong>-</strong>
                    <code>Subtraction</code>
                </div>
                <div class="example-item">
                    <strong>×</strong>
                    <code>Multiplication</code>
                </div>
                <div class="example-item">
                    <strong>/</strong>
                    <code>Division</code>
                </div>
                <div class="example-item">
                    <strong>mod</strong>
                    <code>Modulo (remainder)</code>
                </div>
                <div class="example-item">
                    <strong>pow</strong>
                    <code>Power (exponent)</code>
                </div>
                <div class="example-item">
                    <strong>abs</strong>
                    <code>Absolute value</code>
                </div>
                <div class="example-item">
                    <strong>√</strong>
                    <code>Square root</code>
                </div>
                <div class="example-item">
                    <strong>( )</strong>
                    <code>Parentheses</code>
                </div>
            </div>
            <p style="margin-top: 20px; color: var(--text-tertiary);">
                <strong>Note:</strong> Each operator used in your equation earns you an additional point!
            </p>
        `;
        this.showModal('🔧 Operators', content);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CrackODate();
});

// Add touch support for mobile devices
document.addEventListener('touchstart', function(e) {
    // Prevent default touch behavior on draggable elements
    if (e.target.draggable) {
        e.preventDefault();
    }
}, { passive: false });

// Simple touch drag implementation for mobile
let touchItem = null;
let touchOffset = { x: 0, y: 0 };

document.addEventListener('touchstart', function(e) {
    if (e.target.draggable) {
        touchItem = e.target;
        const touch = e.touches[0];
        const rect = touchItem.getBoundingClientRect();
        touchOffset.x = touch.clientX - rect.left;
        touchOffset.y = touch.clientY - rect.top;
        touchItem.style.position = 'fixed';
        touchItem.style.zIndex = '1000';
        touchItem.style.pointerEvents = 'none';
    }
});

document.addEventListener('touchmove', function(e) {
    if (touchItem) {
        e.preventDefault();
        const touch = e.touches[0];
        touchItem.style.left = (touch.clientX - touchOffset.x) + 'px';
        touchItem.style.top = (touch.clientY - touchOffset.y) + 'px';
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (touchItem) {
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // Reset styles
        touchItem.style.position = '';
        touchItem.style.zIndex = '';
        touchItem.style.pointerEvents = '';
        touchItem.style.left = '';
        touchItem.style.top = '';
        
        // Handle drop
        if (elementBelow && elementBelow.closest('.equation-side')) {
            const dropZone = elementBelow.closest('.equation-side');
            const dragData = {
                type: touchItem.dataset.type,
                value: touchItem.dataset.value || touchItem.dataset.op,
                index: touchItem.dataset.index,
                source: touchItem.dataset.source || 'palette'
            };
            
            // Simulate drop event
            const dropEvent = new CustomEvent('drop', {
                detail: { dragData, target: dropZone }
            });
            dropZone.dispatchEvent(dropEvent);
        }
        
        touchItem = null;
    }
});