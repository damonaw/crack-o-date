import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentDateNumbers, formatDateForDisplay, parseDate } from '../utils/dateUtils';
import { validateCrackODateSolution, ValidationResult } from '../utils/mathParser';
import { useAuth } from '../contexts/AuthContext';
import { solutionsService } from '../services/solutionsService';
import MathDisplay from '../components/MathDisplay';
import DatePicker from '../components/DatePicker';
import EquationBuilder from '../components/EquationBuilder';
import DarkModeToggle from '../components/DarkModeToggle';
import '../components/MathDisplay.css';
import '../components/DatePicker.css';
import '../components/EquationBuilder.css';
import '../components/DarkModeToggle.css';
import './GamePage.css';

const GamePage: React.FC = () => {
  const [dateNumbers, setDateNumbers] = useState<number[]>([]);
  const [displayDate, setDisplayDate] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [equation, setEquation] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthLength, setMonthLength] = useState(0);
  const [dayLength, setDayLength] = useState(0);
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [hasUsedEquals, setHasUsedEquals] = useState(false);
  const [isRetroactive, setIsRetroactive] = useState(false);
  const [isSavingSolution, setIsSavingSolution] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    const dateData = getCurrentDateNumbers();
    setDateNumbers(dateData.numbers);
    setCurrentDateString(dateData.dateString);
    setDisplayDate(formatDateForDisplay(dateData.originalDate));
    setMonthLength(dateData.monthLength);
    setDayLength(dateData.dayLength);
    setIsRetroactive(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = validateCrackODateSolution(dateNumbers, equation);
      setValidationResult(result);

      // If valid and user is logged in, save the solution
      if (result.isValid && user) {
        setIsSavingSolution(true);
        try {
          await solutionsService.submitSolution({
            equation,
            score: result.score!,
            leftValue: result.leftValue!,
            rightValue: result.rightValue!,
            dateString: currentDateString,
            dateNumbers,
            monthLength,
            dayLength,
            isRetroactive
          });
        } catch (saveError) {
          console.error('Error saving solution:', saveError);
          // Don't override the validation result, but maybe show a toast
        } finally {
          setIsSavingSolution(false);
        }
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: `Validation error: ${error}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setEquation('');
    setValidationResult(null);
    setUsedNumbers([]);
    setHasUsedEquals(false);
  };

  const handleEquationChange = (newEquation: string) => {
    setEquation(newEquation);
    setHasUsedEquals(newEquation.includes('='));
  };
  
  const handleDigitsChange = useCallback((digits: number[]) => {
    console.log('GamePage: received digits:', digits);
    console.log('GamePage: date numbers:', dateNumbers);
    
    // Check how many date numbers are used in correct order
    const usedNums: number[] = [];
    let digitIndex = 0;
    
    for (let dateIndex = 0; dateIndex < dateNumbers.length && digitIndex < digits.length; dateIndex++) {
      console.log(`Comparing digit[${digitIndex}]=${digits[digitIndex]} with dateNumber[${dateIndex}]=${dateNumbers[dateIndex]}`);
      if (digits[digitIndex] === dateNumbers[dateIndex]) {
        usedNums.push(dateNumbers[dateIndex]);
        digitIndex++;
      } else {
        break; // Stop at first mismatch
      }
    }
    
    console.log('GamePage: final usedNums:', usedNums);
    setUsedNumbers(usedNums);
  }, [dateNumbers]);

  const handleNumberClick = (number: number, index: number) => {
    // Only allow clicking if this is the next expected number
    if (index === usedNumbers.length) {
      setEquation(prev => prev + number);
      setUsedNumbers(prev => [...prev, number]);
    }
  };

  const handleOperatorClick = (operator: string) => {
    if (operator === ' = ') {
      setHasUsedEquals(true);
    }
    setEquation(prev => prev + operator);
  };

  const isNumberUsed = (index: number) => {
    return index < usedNumbers.length;
  };

  const isNumberNextAvailable = (index: number) => {
    return index === usedNumbers.length;
  };

  const handleDateChange = (newDateString: string, newIsRetroactive: boolean) => {
    try {
      const dateData = parseDate(newDateString);
      setDateNumbers(dateData.numbers);
      setCurrentDateString(newDateString);
      setDisplayDate(formatDateForDisplay(dateData.originalDate));
      setMonthLength(dateData.monthLength);
      setDayLength(dateData.dayLength);
      setIsRetroactive(newIsRetroactive);

      // Clear current equation and validation
      setEquation('');
      setValidationResult(null);
      setUsedNumbers([]);
      setHasUsedEquals(false);
    } catch (error) {
      console.error('Error parsing date:', error);
    }
  };

  return (
    <div className="game-page">
      <header className="game-header">
        <div className="header-top">
          {/* TODO: Update so that when crack-o-date cannot be shown all on the same line the username, profile button and logout button are moved down below the title. */}
          <h1>Crack-O-Date</h1>
          <div className="header-actions">
            <DarkModeToggle />
            {user ? (
              <div className="user-menu">
                <span className="username">Hello, {user.username}!</span>
                <Link to="/profile" className="profile-link">Profile</Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="login-link">Login</Link>
            )}
          </div>
        </div>

        <div className="header-bottom">
          <DatePicker
            currentDate={currentDateString}
            onDateChange={handleDateChange}
          />
          <p className="date-display">{displayDate}</p>
          {isRetroactive && (
            <div className="retroactive-warning">
              ⚠️ Historical puzzle - won't count toward your average
            </div>
          )}
        </div>
      </header>

      <main className="game-content">
        <div className="puzzle-info">
          <h2>Today's Numbers</h2>
          <div className="numbers-display">
            {dateNumbers.map((num, index) => (
              <React.Fragment key={index}>
                <button
                  className={`number-box clickable ${isNumberUsed(index) ? 'used' : ''} ${isNumberNextAvailable(index) ? 'next-available' : ''}`}
                  onClick={() => handleNumberClick(num, index)}
                  disabled={!isNumberNextAvailable(index)}
                >
                  {num}
                </button>
                {/* Add date delimiters at correct positions */}
                {index === monthLength - 1 && <span className="date-delimiter">/</span>}
                {index === monthLength + dayLength - 1 && <span className="date-delimiter">/</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="instructions">
            Create an equation using all numbers in order. Both sides must be equal!
          </p>
        </div>

        <div className="operators-panel">
          <h2>Mathematical Operators</h2>
          <div className="operators-row">
            <button className="operator-btn basic" onClick={() => handleOperatorClick(' + ')}>+</button>
            <button className="operator-btn basic" onClick={() => handleOperatorClick(' - ')}>-</button>
            <button className="operator-btn intermediate" onClick={() => handleOperatorClick(' * ')}>×</button>
            <button className="operator-btn intermediate" onClick={() => handleOperatorClick(' / ')}>÷</button>
            <button className="operator-btn advanced" onClick={() => handleOperatorClick(' ^ ')}>^</button>
            <button className="operator-btn advanced" onClick={() => handleOperatorClick('sqrt(')}>√</button>
            <button className="operator-btn advanced" onClick={() => handleOperatorClick('abs(')}>|x|</button>
            <button className="operator-btn advanced" onClick={() => handleOperatorClick(' mod ')}>mod</button>
            <button className="operator-btn punctuation" onClick={() => handleOperatorClick('(')}>(</button>
            <button className="operator-btn punctuation" onClick={() => handleOperatorClick(')')}>)</button>
            <button
              className={`operator-btn equals ${hasUsedEquals ? 'used' : ''}`}
              onClick={() => handleOperatorClick(' = ')}
              disabled={hasUsedEquals}
            >
              =
            </button>
          </div>
        </div>

        <form className="equation-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="equation">Your Equation:</label>
            <EquationBuilder
              equation={equation}
              onChange={handleEquationChange}
              onClear={handleClear}
              onDigitsChange={handleDigitsChange}
            />
            {/* Fallback text input for manual editing */}
            <details className="manual-input-toggle">
              <summary>Manual text input (advanced)</summary>
              <div className="manual-input-content">
                <input
                  type="text"
                  id="equation"
                  value={equation}
                  onChange={(e) => handleEquationChange(e.target.value)}
                  placeholder="e.g., 7 - 1 + 8 = 2^0 + 2 * 5"
                  className="equation-input"
                />
              </div>
            </details>
          </div>

          <div className="button-group">
            <button
              type="submit"
              disabled={!equation.trim() || isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Validating...' : 'Check Solution'}
            </button>
          </div>
        </form>

        {validationResult && (
          <div className={`result-panel ${validationResult.isValid ? 'valid' : 'invalid'}`}>
            {validationResult.isValid ? (
              <div className="success-result">
                <h3>🎉 Correct!</h3>
                <MathDisplay
                  equation={equation}
                  className="success"
                />
                <div className="solution-details">
                  <p>Left side: {validationResult.leftValue}</p>
                  <p>Right side: {validationResult.rightValue}</p>
                  <p className="score-display">Score: {validationResult.score} points</p>
                  {user && (
                    <p className="save-status">
                      {isSavingSolution ? '💾 Saving solution...' : '✅ Solution saved!'}
                    </p>
                  )}
                  {!user && (
                    <p className="login-prompt">
                      <Link to="/login">Login</Link> to save your solutions!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="error-result">
                <h3>❌ Not quite right</h3>
                <p className="error-message">{validationResult.error}</p>
                {validationResult.leftValue !== undefined && validationResult.rightValue !== undefined && (
                  <p className="calculation-values">
                    Left side = {validationResult.leftValue}, Right side = {validationResult.rightValue}
                  </p>
                )}
                {validationResult.usedNumbers && validationResult.usedNumbers.length > 0 && (
                  <p className="used-numbers">
                    Numbers used: [{validationResult.usedNumbers.join(', ')}]
                  </p>
                )}
                {validationResult.missingNumbers && validationResult.missingNumbers.length > 0 && (
                  <p className="missing-numbers">
                    Still need: [{validationResult.missingNumbers.join(', ')}]
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default GamePage;