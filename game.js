import { CONFIG, GameState } from './config.js';
import { utils } from './utils.js';
import { UI } from './ui.js';

export class Game {
    constructor() {
        this.state = new GameState();
        this.ui = new UI();
    }

    initialize() {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        
        document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('current-year').textContent = year;
        
        this.state.monthDigits = utils.splitNumberIntoDigits(month);
        this.state.dayDigits = utils.splitNumberIntoDigits(day);
        this.state.yearDigits = utils.splitNumberIntoDigits(year);
        this.state.dateNumbers = [...this.state.monthDigits, ...this.state.dayDigits, ...this.state.yearDigits];
        
        this.ui.createDateButtons(this.state.monthDigits, this.state.dayDigits, this.state.yearDigits);
        this.setupEventListeners();
        this.state.loadStats();
    }

    setupEventListeners() {
        // Number buttons
        document.getElementById('date-buttons').addEventListener('click', (e) => {
            const button = e.target.closest('.number');
            if (button) {
                this.handleNumberClick(button);
            }
        });

        // Operator buttons
        document.getElementById('operator-buttons').addEventListener('click', (e) => {
            const button = e.target.closest('.operator');
            if (button) {
                this.handleOperatorClick(button);
            }
        });

        // Clear button
        document.getElementById('clear-button').addEventListener('click', () => {
            this.ui.clearEquation();
        });

        // Check button
        document.getElementById('check-button').addEventListener('click', () => {
            this.checkEquation();
        });

        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            const description = this.state.setDifficulty(e.target.value);
            this.ui.updateDifficultyInfo(description);
        });

        // Side switching
        document.getElementById('left-side').addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                this.state.isLeftSide = true;
                this.ui.updateActiveSide(true);
            }
        });

        document.getElementById('right-side').addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn') && !e.target.closest('.btn')) {
                this.state.isLeftSide = false;
                this.ui.updateActiveSide(false);
            }
        });
    }

    handleNumberClick(button) {
        if (button.classList.contains('disabled')) return;
        
        const activeSide = this.state.isLeftSide ? 'left-side' : 'right-side';
        const buttonClone = button.cloneNode(true);
        buttonClone.classList.add('disabled');
        document.getElementById(activeSide).appendChild(buttonClone);
        
        button.classList.add('disabled');
        this.ui.updateCurrentValues();
    }

    handleOperatorClick(button) {
        const activeSide = this.state.isLeftSide ? 'left-side' : 'right-side';
        const buttonClone = button.cloneNode(true);
        buttonClone.textContent = button.dataset.operator;
        document.getElementById(activeSide).appendChild(buttonClone);
        this.ui.updateCurrentValues();
    }

    checkEquation() {
        const leftExpression = utils.getExpressionFromSide('left-side');
        const rightExpression = utils.getExpressionFromSide('right-side');
        
        const leftValue = utils.safeEval(leftExpression);
        const rightValue = utils.safeEval(rightExpression);
        
        if (leftValue === 'Error' || rightValue === 'Error') {
            this.ui.showError('Invalid equation!');
            return;
        }
        
        if (leftValue !== rightValue) {
            this.ui.showError('Equation is not balanced!');
            return;
        }

        // Get all numbers used in both expressions
        const usedNumbers = utils.getNumbersFromExpression(leftExpression + rightExpression);
        const settings = CONFIG.difficultySettings[this.state.currentDifficulty];

        // Check if all numbers are from today's date
        const validNumbers = usedNumbers.every(num => this.state.dateNumbers.includes(Number(num)));
        if (!validNumbers) {
            this.ui.showError('Only use numbers from today\'s date!');
            return;
        }

        // For medium and hard difficulties, check if all date numbers are used
        if (settings.requireAllNumbers) {
            const allNumbersUsed = this.state.dateNumbers.every(num => 
                usedNumbers.includes(num.toString())
            );
            if (!allNumbersUsed) {
                this.ui.showError('You must use all numbers from today\'s date!');
                return;
            }
        }

        // For hard difficulty, check if required operators are used
        if (this.state.currentDifficulty === 'hard') {
            const operators = (leftExpression + rightExpression).match(/[+\-*/]/g) || [];
            const uniqueOperators = new Set(operators);
            const hasRequiredOperators = ['+', '-', '*', '/'].every(op => uniqueOperators.has(op));
            if (!hasRequiredOperators) {
                this.ui.showError('Hard mode requires using +, -, *, and / operators!');
                return;
            }
        }
        
        const points = this.calculatePoints(leftExpression);
        this.saveSolution(leftExpression, rightExpression, points);
        this.state.updateStats(points);
        
        this.ui.showModal('Success!', `You found a solution worth ${points} points!`);
    }

    calculatePoints(expression) {
        const settings = CONFIG.difficultySettings[this.state.currentDifficulty];
        if (settings.fixedPoints) return settings.fixedPoints;
        
        let points = 1;
        const operators = expression.match(/[+\-*/().%^]/g) || [];
        
        // Count unique operators
        const uniqueOperators = new Set(operators);
        points += uniqueOperators.size;
        
        // Apply difficulty multiplier
        points *= settings.pointMultiplier;
        
        return points;
    }

    saveSolution(leftExpr, rightExpr, points) {
        const solutions = this.getSavedSolutions();
        solutions.push({
            left: leftExpr,
            right: rightExpr,
            points: points,
            difficulty: this.state.currentDifficulty,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem(CONFIG.storagePrefix + 'solutions', JSON.stringify(solutions));
    }

    getSavedSolutions() {
        const solutions = localStorage.getItem(CONFIG.storagePrefix + 'solutions');
        return solutions ? JSON.parse(solutions) : [];
    }
} 