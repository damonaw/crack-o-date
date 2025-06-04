// Custom functions to add to math.js scope
const customFunctions = {
    factorial: (n) => {
        if (n < 0) return NaN
        if (n === 0) return 1
        let result = 1
        for (let i = 2; i <= n; i++) result *= i
        return result
    }
}

// Initialize math.js with custom functions
math.import(customFunctions, { override: true })

/**
 * Safely evaluates a mathematical expression
 * @param {string} expression - The mathematical expression to evaluate
 * @returns {number|string} - The result of the evaluation or empty string if invalid
 */
export function safeEval(expression) {
    if (!expression) return ''
    
    try {
        // Check for incomplete expressions
        if (/[+\-x/%^]$/.test(expression) ||    // Ends with operator
            /\([^)]*$/.test(expression) ||      // Unclosed parenthesis
            /[+\-x/%^]\($/.test(expression) ||  // Operator followed by opening parenthesis
            /√$/.test(expression) ||            // Ends with square root symbol
            /√(?!\d|\()/.test(expression)) {    // Square root not followed by number or parenthesis
            return ''
        }

        // Convert custom symbols to math.js compatible format
        const cleaned = cleanExpression(expression)
        
        // Evaluate using math.js
        return math.evaluate(cleaned)
    } catch (error) {
        console.error('Error evaluating expression:', error)
        return ''
    }
}

/**
 * Cleans and converts custom mathematical notation to math.js compatible format
 * @param {string} expression - The expression to clean
 * @returns {string} - The cleaned expression
 */
function cleanExpression(expression) {
    return expression
        // Convert multiplication symbol
        .replace(/x/g, '*')
        // Convert square root symbol to sqrt
        .replace(/√(\d+)/g, 'sqrt($1)')
        .replace(/√\(/g, 'sqrt(')
        
        // Convert log to log10
        .replace(/log\(/g, 'log10(')
        
        // Convert factorial notation
        .replace(/(\d+)!/g, 'factorial($1)')
        .replace(/\(([^)]+)\)!/g, 'factorial($1)')
        
        // Convert exponentiation
        .replace(/(\d+)\^(\d+)/g, 'pow($1, $2)')
        
        // Handle implicit multiplication
        .replace(/\b(\d+)\s*\(/g, '$1*(')
        .replace(/\)\s*(\d+)/g, ')*$1')
        
        // Handle empty parentheses
        .replace(/\(\)/g, '0')
} 