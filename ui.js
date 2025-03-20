import { utils } from './utils.js';
import { CONFIG } from './config.js';

export class UI {
    constructor() {
        this.errorTimeout = null;
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.getElementById('modal-body');
        this.setupModalListeners();
    }

    setupModalListeners() {
        // Close modal when clicking the close button
        document.querySelector('.close').addEventListener('click', () => this.hideModal());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                this.hideModal();
            }
        });

        // Handle navigation links
        document.querySelectorAll('.nav-link[data-modal]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const modalType = e.currentTarget.dataset.modal;
                this.showModalContent(modalType);
            });
        });
    }

    showModalContent(type) {
        const template = document.getElementById(`${type}-content`);
        if (!template) return;

        const content = template.content.cloneNode(true);
        this.modalTitle.textContent = this.getModalTitle(type);
        this.modalBody.innerHTML = '';
        this.modalBody.appendChild(content);

        if (type === 'solutions') {
            this.updateSolutionsList();
            // Add event listener for delete button
            const deleteButton = this.modalBody.querySelector('#delete-solutions');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    this.showConfirmDeleteModal();
                });
            }
        }

        this.showModal();
    }

    getModalTitle(type) {
        const titles = {
            rules: 'Game Rules',
            solutions: 'Your Solutions',
            shortcuts: 'Keyboard Shortcuts'
        };
        return titles[type] || 'Modal';
    }

    showModal() {
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal() {
        this.modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    updateSolutionsList() {
        const solutionsList = document.getElementById('solutions-list');
        const solutions = JSON.parse(localStorage.getItem(CONFIG.storagePrefix + 'solutions') || '[]');
        
        if (solutions.length === 0) {
            solutionsList.innerHTML = '<p class="no-solutions">No solutions yet. Start playing to see your solutions here!</p>';
            return;
        }

        solutionsList.innerHTML = solutions.map((solution, index) => `
            <div class="solution-item" data-index="${index}">
                <div class="solution-equation">
                    ${this.formatExpression(solution.left)} = ${this.formatExpression(solution.right)}
                </div>
                <div class="solution-details">
                    <span class="solution-points">${solution.points} points</span>
                    <span class="solution-difficulty">${solution.difficulty}</span>
                    <span class="solution-date">${new Date(solution.timestamp).toLocaleDateString()}</span>
                    <button class="btn share-btn" aria-label="Share solution">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add click handlers for sharing
        solutionsList.querySelectorAll('.solution-item').forEach((item, index) => {
            const shareBtn = item.querySelector('.share-btn');
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const solution = solutions[index];
                this.shareSolution(solution);
            });
        });
    }

    shareSolution(solution) {
        // Create an obfuscated version of the solution
        const obfuscated = btoa(JSON.stringify({
            l: solution.left,
            r: solution.right,
            p: solution.points,
            d: solution.difficulty,
            t: new Date(solution.timestamp).toLocaleDateString()
        }));

        // Create share text
        const shareText = `🧮 Crack-O-Date Solution!\n🎯 ${solution.points} points (${solution.difficulty})\n🔍 ${obfuscated}`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            this.showCopiedTooltip(event.target);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }

    showCopiedTooltip(target) {
        const tooltip = document.createElement('div');
        tooltip.className = 'copied-tooltip';
        tooltip.textContent = 'Copied to clipboard!';
        document.body.appendChild(tooltip);

        // Position the tooltip
        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;

        // Remove after animation
        setTimeout(() => {
            tooltip.remove();
        }, 2000);
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Clear any existing timeout
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }
        
        // Set new timeout
        this.errorTimeout = setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    updateActiveSide(isLeftSide) {
        const leftSide = document.getElementById('left-side');
        const rightSide = document.getElementById('right-side');
        
        // Remove active class from both sides
        leftSide.classList.remove('active');
        rightSide.classList.remove('active');
        
        // Add active class to the selected side
        if (isLeftSide) {
            leftSide.classList.add('active');
            leftSide.style.cursor = 'default';
            rightSide.style.cursor = 'pointer';
            rightSide.title = 'Click to activate right side';
            leftSide.setAttribute('data-active', 'true');
            rightSide.setAttribute('data-active', 'false');
        } else {
            rightSide.classList.add('active');
            rightSide.style.cursor = 'default';
            leftSide.style.cursor = 'pointer';
            leftSide.title = 'Click to activate left side';
            rightSide.setAttribute('data-active', 'true');
            leftSide.setAttribute('data-active', 'false');
        }
    }

    updateCurrentValues() {
        const leftExpression = utils.getExpressionFromSide('left-side');
        const rightExpression = utils.getExpressionFromSide('right-side');
        
        const leftValue = utils.safeEval(leftExpression);
        const rightValue = utils.safeEval(rightExpression);
        
        document.getElementById('left-value').textContent = leftValue || '?';
        document.getElementById('right-value').textContent = rightValue || '?';
        
        this.updateEqualsSign();
    }

    updateEqualsSign() {
        const leftExpression = utils.getExpressionFromSide('left-side');
        const rightExpression = utils.getExpressionFromSide('right-side');
        
        const leftValue = utils.safeEval(leftExpression);
        const rightValue = utils.safeEval(rightExpression);
        
        document.getElementById('equals-sign').textContent = 
            (leftExpression === '' || rightExpression === '' || 
             leftValue === 'Error' || rightValue === 'Error' ||
             leftValue !== rightValue) ? '≠' : '=';
    }

    createDateButtons(monthDigits, dayDigits, yearDigits) {
        const dateButtonsContainer = document.getElementById('date-buttons');
        dateButtonsContainer.innerHTML = ''; // Clear existing buttons
        
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
    }

    clearEquation() {
        // Clear both sides
        document.getElementById('left-side').innerHTML = '';
        document.getElementById('right-side').innerHTML = '';
        
        // Re-enable all number buttons
        document.querySelectorAll('.number').forEach(btn => {
            btn.classList.remove('disabled');
        });
        
        // Update the display
        this.updateCurrentValues();
    }

    updateDifficultyInfo(description) {
        document.getElementById('difficulty-info').textContent = description;
    }

    formatExpression(expr) {
        if (!expr) return '';
        try {
            // Replace operators with their symbols
            return expr
                .replace(/\*/g, '×')
                .replace(/\//g, '÷')
                .replace(/\^/g, '^')
                .replace(/\+/g, '+')
                .replace(/\-/g, '−')
                .replace(/%/g, '%')
                .replace(/\(/g, '(')
                .replace(/\)/g, ')')
                .trim();
        } catch (error) {
            console.error('Error formatting expression:', error);
            return expr;
        }
    }

    showConfirmDeleteModal() {
        const template = document.getElementById('confirm-delete-content');
        if (!template) return;

        const content = template.content.cloneNode(true);
        const confirmModal = document.createElement('div');
        confirmModal.className = 'confirm-modal';
        confirmModal.appendChild(content);

        // Add event listeners for buttons
        const cancelButton = confirmModal.querySelector('.cancel-delete');
        const confirmButton = confirmModal.querySelector('.confirm-delete');

        cancelButton.addEventListener('click', () => {
            confirmModal.remove();
        });

        confirmButton.addEventListener('click', () => {
            localStorage.removeItem(CONFIG.storagePrefix + 'solutions');
            localStorage.setItem(CONFIG.storagePrefix + 'totalPoints', '0');
            localStorage.setItem(CONFIG.storagePrefix + 'solutionsCount', '0');
            localStorage.setItem(CONFIG.storagePrefix + 'highestPoints', '0');
            this.updateSolutionsList();
            confirmModal.remove();
        });

        document.body.appendChild(confirmModal);
    }
} 