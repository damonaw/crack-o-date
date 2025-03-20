// Utility functions for the game
export const utils = {
    splitNumberIntoDigits(number) {
        return number.toString().split('').map(Number);
    },

    safeEval(expression) {
        if (!expression) return '';

        try {
            // Sanitize the expression
            const sanitizedExpression = expression
                .replace(/[^0-9+\-*/().%^ ]/g, '') // Only allow valid characters
                .replace(/\s+/g, '') // Remove all whitespace
                .replace(/(\d+)\s*%\s*(\d+)/g, '($1%$2)')
                .replace(/(\d+)\s*\(/g, '$1*(')
                .replace(/\)\s*(\d+)/g, ')*$1')
                .replace(/-\s*\(/g, '-1*(')
                .replace(/([+\-*/])([+\-*/])/g, '$1'); // Remove consecutive operators

            // Use Function for safer evaluation than eval
            const result = Function(`'use strict'; return (${sanitizedExpression})`)();
            
            // Handle floating point precision
            if (typeof result === 'number' && !Number.isInteger(result)) {
                return Number(result.toFixed(2));
            }
            
            return result;
        } catch (error) {
            console.error('Expression evaluation error:', error, expression);
            return 'Error';
        }
    },

    formatExpression(expression) {
        if (!expression) return '';
        
        return expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/%/g, ' mod ')
            .replace(/\(/g, '<span class="paren">(</span>')
            .replace(/\)/g, '<span class="paren">)</span>')
            .replace(/\^/g, '<sup>')
            .replace(/(\d+)<sup>(\d+)/g, '$1<sup>$2</sup>');
    },

    getExpressionFromSide(sideId) {
        const buttons = Array.from(document.querySelectorAll(`#${sideId} button`));
        let expression = '';
        
        buttons.forEach((btn, index) => {
            const value = btn.textContent.trim();
            
            // Add space around operators except parentheses
            if (/[+\-*/%^]/.test(value)) {
                expression += ` ${value} `;
            } else {
                expression += value;
            }
        });
        
        return expression
            .replace(/\s+/g, ' ')  // Normalize spaces
            .trim()                // Remove leading/trailing spaces
            .replace(/\^/g, '**'); // Convert ^ to ** for exponentiation
    },

    getNumbersFromExpression(expression) {
        if (!expression) return [];
        // Extract all numbers from the expression, handling multi-digit numbers
        const numbers = expression.match(/\d+/g) || [];
        // Convert to array of unique numbers
        return [...new Set(numbers)];
    }
}; 