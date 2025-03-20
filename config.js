// Game configuration
export const CONFIG = {
    storagePrefix: 'crack-o-date-',
    difficultySettings: {
        easy: {
            requireAllNumbers: false,
            pointMultiplier: 0,
            fixedPoints: 1,
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
    }
};

// Game state management
export class GameState {
    constructor() {
        this.currentDifficulty = 'medium';
        this.isLeftSide = true;
        this.currentNumberIndex = 0;
        this.totalPoints = 0;
        this.solutionsCount = 0;
        this.highestPoints = 0;
        this.dateNumbers = [];
        this.monthDigits = [];
        this.dayDigits = [];
        this.yearDigits = [];
    }

    loadStats() {
        this.totalPoints = parseInt(localStorage.getItem(CONFIG.storagePrefix + 'totalPoints')) || 0;
        this.solutionsCount = parseInt(localStorage.getItem(CONFIG.storagePrefix + 'solutionsCount')) || 0;
        this.highestPoints = parseInt(localStorage.getItem(CONFIG.storagePrefix + 'highestPoints')) || 0;
    }

    saveStats() {
        localStorage.setItem(CONFIG.storagePrefix + 'totalPoints', this.totalPoints);
        localStorage.setItem(CONFIG.storagePrefix + 'solutionsCount', this.solutionsCount);
        localStorage.setItem(CONFIG.storagePrefix + 'highestPoints', this.highestPoints);
    }

    updateStats(points) {
        this.totalPoints += points;
        this.solutionsCount++;
        this.highestPoints = Math.max(this.highestPoints, points);
        this.saveStats();
    }

    setDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        return CONFIG.difficultySettings[difficulty].description;
    }
} 