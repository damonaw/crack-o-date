import { Game } from './game.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.initialize();
});