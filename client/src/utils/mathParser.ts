export interface ValidationResult {
  isValid: boolean;
  error?: string;
  leftValue?: number;
  rightValue?: number;
  score?: number;
  usedNumbers?: number[];
  missingNumbers?: number[];
  extraNumbers?: number[];
  orderErrors?: string[];
}

export interface OperatorScore {
  [key: string]: number;
}

export const OPERATOR_SCORES: OperatorScore = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '^': 3,
  'sqrt': 3,
  'abs': 3,
  'mod': 3,
  '%': 3
};

export class MathParser {
  private dateNumbers: number[];
  private usedNumbers: number[];
  private currentIndex: number;
  private score: number;

  constructor(dateNumbers: number[]) {
    this.dateNumbers = dateNumbers;
    this.usedNumbers = [];
    this.currentIndex = 0;
    this.score = 0;
  }

  validateEquation(equation: string): ValidationResult {
    try {
      // Reset state
      this.usedNumbers = [];
      this.currentIndex = 0;
      this.score = 0;

      // Split equation on '='
      const parts = equation.split('=');
      if (parts.length !== 2) {
        return { isValid: false, error: 'Equation must contain exactly one equals sign' };
      }

      const leftSide = parts[0].trim();
      const rightSide = parts[1].trim();

      // Parse both sides
      this.currentIndex = 0;
      const leftResult = this.parseExpression(leftSide);
      this.currentIndex = 0;
      const rightResult = this.parseExpression(rightSide);

      // Detailed validation checks
      const validationErrors = this.getDetailedValidationErrors();
      if (validationErrors.length > 0) {
        return { 
          isValid: false, 
          error: validationErrors.join('. '),
          leftValue: leftResult,
          rightValue: rightResult,
          usedNumbers: [...this.usedNumbers],
          missingNumbers: this.getMissingNumbers(),
          extraNumbers: this.getExtraNumbers(),
          orderErrors: this.getOrderErrors()
        };
      }

      // Check if both sides are equal
      if (Math.abs(leftResult - rightResult) > 1e-10) {
        return { 
          isValid: false, 
          error: `Equation is not balanced: ${leftResult} ≠ ${rightResult}`,
          leftValue: leftResult,
          rightValue: rightResult
        };
      }

      return {
        isValid: true,
        leftValue: leftResult,
        rightValue: rightResult,
        score: this.score,
        usedNumbers: [...this.usedNumbers]
      };

    } catch (error) {
      return { isValid: false, error: `Parse error: ${error}` };
    }
  }

  private parseExpression(expression: string): number {
    // Remove spaces and convert to lowercase for function names
    expression = expression.replace(/\s+/g, '');
    return this.parseAddSubtract(expression);
  }

  private parseAddSubtract(expression: string): number {
    let result = this.parseMultiplyDivide(expression);
    
    while (this.currentIndex < expression.length) {
      const char = expression[this.currentIndex];
      if (char === '+') {
        this.currentIndex++;
        this.score += OPERATOR_SCORES['+'];
        result += this.parseMultiplyDivide(expression);
      } else if (char === '-') {
        this.currentIndex++;
        this.score += OPERATOR_SCORES['-'];
        result -= this.parseMultiplyDivide(expression);
      } else {
        break;
      }
    }
    
    return result;
  }

  private parseMultiplyDivide(expression: string): number {
    let result = this.parsePower(expression);
    
    while (this.currentIndex < expression.length) {
      const char = expression[this.currentIndex];
      if (char === '*') {
        this.currentIndex++;
        this.score += OPERATOR_SCORES['*'];
        result *= this.parsePower(expression);
      } else if (char === '/') {
        this.currentIndex++;
        this.score += OPERATOR_SCORES['/'];
        const divisor = this.parsePower(expression);
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        result /= divisor;
      } else if (char === '%' || this.matchFunction(expression, 'mod')) {
        if (char === '%') {
          this.currentIndex++;
          this.score += OPERATOR_SCORES['%'];
        } else {
          this.currentIndex += 3; // 'mod'
          this.score += OPERATOR_SCORES['mod'];
        }
        const divisor = this.parsePower(expression);
        if (divisor === 0) {
          throw new Error('Modulo by zero');
        }
        result %= divisor;
      } else {
        break;
      }
    }
    
    return result;
  }

  private parsePower(expression: string): number {
    let result = this.parseUnary(expression);
    
    if (this.currentIndex < expression.length && expression[this.currentIndex] === '^') {
      this.currentIndex++;
      this.score += OPERATOR_SCORES['^'];
      const exponent = this.parseUnary(expression);
      result = Math.pow(result, exponent);
    }
    
    return result;
  }

  private parseUnary(expression: string): number {
    if (this.currentIndex >= expression.length) {
      throw new Error('Unexpected end of expression');
    }

    // Handle functions
    if (this.matchFunction(expression, 'sqrt')) {
      this.currentIndex += 4; // 'sqrt'
      this.score += OPERATOR_SCORES['sqrt'];
      const value = this.parseUnary(expression);
      if (value < 0) {
        throw new Error('Square root of negative number');
      }
      return Math.sqrt(value);
    }

    if (this.matchFunction(expression, 'abs')) {
      this.currentIndex += 3; // 'abs'
      this.score += OPERATOR_SCORES['abs'];
      const value = this.parseUnary(expression);
      return Math.abs(value);
    }

    // Handle parentheses
    if (expression[this.currentIndex] === '(') {
      this.currentIndex++;
      const result = this.parseAddSubtract(expression);
      if (this.currentIndex >= expression.length || expression[this.currentIndex] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.currentIndex++;
      return result;
    }

    // Handle numbers
    return this.parseNumber(expression);
  }

  private parseNumber(expression: string): number {
    let numStr = '';
    let hasDecimal = false;
    
    while (this.currentIndex < expression.length) {
      const char = expression[this.currentIndex];
      if (char >= '0' && char <= '9') {
        numStr += char;
        this.currentIndex++;
      } else if (char === '.' && !hasDecimal) {
        hasDecimal = true;
        numStr += char;
        this.currentIndex++;
      } else {
        break;
      }
    }
    
    if (numStr === '') {
      throw new Error('Expected number');
    }
    
    const num = parseFloat(numStr);
    
    // Check if this contains date numbers (split multi-digit numbers into individual digits)
    if (!hasDecimal && /^\d+$/.test(numStr)) {
      // Split the number string into individual digits
      for (const digitChar of numStr) {
        const digit = parseInt(digitChar, 10);
        const expectedIndex = this.usedNumbers.length;
        if (expectedIndex < this.dateNumbers.length && this.dateNumbers[expectedIndex] === digit) {
          this.usedNumbers.push(digit);
        }
      }
    }
    
    return num;
  }

  private matchFunction(expression: string, funcName: string): boolean {
    return expression.substring(this.currentIndex, this.currentIndex + funcName.length).toLowerCase() === funcName;
  }

  private getDetailedValidationErrors(): string[] {
    const errors: string[] = [];
    
    // Check if all numbers were used
    if (this.usedNumbers.length !== this.dateNumbers.length) {
      const missing = this.getMissingNumbers();
      const extra = this.getExtraNumbers();
      
      if (missing.length > 0) {
        errors.push(`Missing numbers: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        errors.push(`Extra numbers found: ${extra.join(', ')}`);
      }
      if (this.usedNumbers.length === 0) {
        errors.push('No date numbers were used in the equation');
      }
    }

    // Check if numbers were used in order
    const orderErrors = this.getOrderErrors();
    if (orderErrors.length > 0) {
      errors.push(...orderErrors);
    }

    return errors;
  }

  private getMissingNumbers(): number[] {
    const missing: number[] = [];
    for (let i = 0; i < this.dateNumbers.length; i++) {
      if (i >= this.usedNumbers.length || this.usedNumbers[i] !== this.dateNumbers[i]) {
        missing.push(this.dateNumbers[i]);
      }
    }
    return missing;
  }

  private getExtraNumbers(): number[] {
    return this.usedNumbers.slice(this.dateNumbers.length);
  }

  private getOrderErrors(): string[] {
    const errors: string[] = [];
    for (let i = 0; i < Math.min(this.usedNumbers.length, this.dateNumbers.length); i++) {
      if (this.usedNumbers[i] !== this.dateNumbers[i]) {
        errors.push(`Position ${i + 1}: expected ${this.dateNumbers[i]} but found ${this.usedNumbers[i]}`);
      }
    }
    return errors;
  }
}

export function validateCrackODateSolution(dateNumbers: number[], equation: string): ValidationResult {
  const parser = new MathParser(dateNumbers);
  return parser.validateEquation(equation);
}