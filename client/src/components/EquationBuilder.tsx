import React from 'react';
import './EquationBuilder.css';

interface EquationToken {
  value: string;
  type: 'number' | 'operator' | 'function' | 'punctuation' | 'equals' | 'space' | 'function-call' | 'parentheses-group';
  id: string;
  children?: EquationToken[];
}

interface EquationBuilderProps {
  equation: string;
  onChange: (equation: string) => void;
  onClear: () => void;
  onDigitsChange?: (digits: number[]) => void;
}

const EquationBuilder: React.FC<EquationBuilderProps> = ({ equation, onChange, onClear, onDigitsChange }) => {
  // Parse equation string into tokens with nested function calls and implicit multiplication
  const parseEquation = (eq: string): EquationToken[] => {
    if (!eq.trim()) return [];
    
    let tokenId = 0;
    
    const parseSegment = (str: string, startIndex: number = 0): { tokens: EquationToken[], endIndex: number } => {
      const tokens: EquationToken[] = [];
      let i = startIndex;
      
      while (i < str.length) {
        const char = str[i];
        
        if (char === ' ') {
          // Skip spaces
          i++;
        } else if (/\d/.test(char)) {
          // Handle numbers - keep consecutive digits as multi-digit numbers
          let number = '';
          while (i < str.length && /\d/.test(str[i])) {
            number += str[i];
            i++;
          }
          
          // Create token for the number
          tokens.push(createToken(number, tokenId++));
          
          // Check for implicit multiplication (number followed by opening paren or function)
          // Skip spaces to check what comes next
          let nextIndex = i;
          while (nextIndex < str.length && str[nextIndex] === ' ') {
            nextIndex++;
          }
          
          if (nextIndex < str.length) {
            const nextChar = str[nextIndex];
            const isFollowedByParen = nextChar === '(';
            const isFollowedByFunction = (nextChar === 's' && str.substring(nextIndex, nextIndex + 4) === 'sqrt') ||
                                        (nextChar === 'a' && str.substring(nextIndex, nextIndex + 3) === 'abs');
            
            if (isFollowedByParen || isFollowedByFunction) {
              // Insert implicit multiplication
              tokens.push(createToken('*', tokenId++));
            }
          }
        } else if ((char === 's' && str.substring(i, i + 4) === 'sqrt') || 
                   (char === 'a' && str.substring(i, i + 3) === 'abs')) {
          // Handle function calls
          const isAbs = char === 'a';
          const funcName = isAbs ? 'abs' : 'sqrt';
          i += isAbs ? 3 : 4;
          
          if (str[i] === '(') {
            i++; // Skip opening paren
            // Parse the content inside parentheses
            const result = parseSegment(str, i);
            
            // Create function call token with children
            tokens.push({
              value: funcName,
              type: 'function-call',
              id: `token-${tokenId++}`,
              children: result.tokens
            });
            
            i = result.endIndex + 1; // Skip closing paren
          }
        } else if (char === '(') {
          // Handle standalone parentheses groups
          i++; // Skip opening paren
          const result = parseSegment(str, i);
          
          // Create parentheses group token with children
          tokens.push({
            value: '()',
            type: 'parentheses-group',
            id: `token-${tokenId++}`,
            children: result.tokens
          });
          
          i = result.endIndex + 1; // Skip closing paren
        } else if (char === ')') {
          // End of this segment
          return { tokens, endIndex: i };
        } else if (char === '-') {
          // Handle minus signs - both binary and unary
          tokens.push(createToken('-', tokenId++));
          i++;
        } else if (char === 'm' && str.substring(i, i + 3) === 'mod') {
          tokens.push(createToken('mod', tokenId++));
          i += 3;
        } else {
          // Handle single character operators and punctuation
          tokens.push(createToken(char, tokenId++));
          i++;
        }
      }
      
      return { tokens, endIndex: i };
    };
    
    return parseSegment(eq).tokens;
  };
  
  const createToken = (value: string, id: number): EquationToken => {
    const tokenId = `token-${id}`;
    
    if (/^\d+$/.test(value)) {
      return { value, type: 'number', id: tokenId };
    } else if (value === '=') {
      return { value, type: 'equals', id: tokenId };
    } else if ('+-*/^'.includes(value)) {
      return { value: value === '*' ? '×' : value === '/' ? '÷' : value, type: 'operator', id: tokenId };
    } else if ('()'.includes(value)) {
      return { value, type: 'punctuation', id: tokenId };
    } else if (['sqrt', 'abs', 'mod'].some(fn => value.includes(fn))) {
      return { value, type: 'function', id: tokenId };
    } else {
      return { value, type: 'operator', id: tokenId };
    }
  };
  
  const tokens = parseEquation(equation);
  
  // Extract individual digits from tokens for number tracking
  const extractDigitsFromTokens = (tokenList: EquationToken[]): number[] => {
    const digits: number[] = [];
    
    const processToken = (token: EquationToken) => {
      if (token.type === 'number') {
        // Split multi-digit numbers into individual digits
        for (const digitChar of token.value) {
          if (/\d/.test(digitChar)) {
            digits.push(parseInt(digitChar, 10));
          }
        }
      } else if (token.children) {
        // Process nested tokens (function calls, parentheses groups)
        token.children.forEach(processToken);
      }
    };
    
    tokenList.forEach(processToken);
    return digits;
  };
  
  // Notify parent component of digit changes
  React.useEffect(() => {
    if (onDigitsChange) {
      const digits = extractDigitsFromTokens(tokens);
      console.log('EquationBuilder: tokens:', tokens);
      console.log('EquationBuilder: extracted digits from tokens:', digits);
      onDigitsChange(digits);
    }
  }, [tokens, onDigitsChange]);
  
  const removeToken = (tokenId: string) => {
    const filterTokens = (tokenList: EquationToken[]): EquationToken[] => {
      return tokenList.filter(token => token.id !== tokenId).map(token => ({
        ...token,
        children: token.children ? filterTokens(token.children) : undefined
      }));
    };
    
    const tokenElements = filterTokens(tokens);
    const newEquation = reconstructEquation(tokenElements);
    onChange(newEquation);
  };

  const reconstructEquation = (tokenList: EquationToken[]): string => {
    return tokenList.map(token => {
      if (token.type === 'function-call') {
        const innerContent = reconstructEquation(token.children || []);
        return `${token.value}(${innerContent})`;
      }
      if (token.type === 'parentheses-group') {
        const innerContent = reconstructEquation(token.children || []);
        return `(${innerContent})`;
      }
      if (token.value === '×') return '*';
      if (token.value === '÷') return '/';
      return token.value;
    }).join('').trim();
  };
  
  const getTokenClassName = (token: EquationToken): string => {
    const baseClass = 'equation-token';
    
    switch (token.type) {
      case 'number':
        const isMultiDigit = token.value.length > 1;
        return `${baseClass} token-number ${isMultiDigit ? 'multi-digit' : 'single-digit'}`;
      case 'operator':
        if ('+-'.includes(token.value)) return `${baseClass} token-operator-basic`;
        if ('×÷'.includes(token.value)) return `${baseClass} token-operator-intermediate`;
        if ('^'.includes(token.value)) return `${baseClass} token-operator-advanced`;
        return `${baseClass} token-operator`;
      case 'function':
        if (token.value.includes('sqrt')) return `${baseClass} token-function-sqrt`;
        if (token.value.includes('abs')) return `${baseClass} token-function-abs`;
        if (token.value.includes('mod')) return `${baseClass} token-function-mod`;
        return `${baseClass} token-function-advanced`;
      case 'function-call':
        if (token.value === 'sqrt') return `${baseClass} token-function-call-sqrt`;
        if (token.value === 'abs') return `${baseClass} token-function-call-abs`;
        if (token.value === 'mod') return `${baseClass} token-function-call-mod`;
        return `${baseClass} token-function-call`;
      case 'parentheses-group':
        return `${baseClass} token-parentheses-group`;
      case 'punctuation':
        return `${baseClass} token-punctuation`;
      case 'equals':
        return `${baseClass} token-equals`;
      default:
        return baseClass;
    }
  };
  
  const getTokenDisplayValue = (token: EquationToken): string => {
    if (token.type === 'function') {
      if (token.value.includes('sqrt')) return token.value.replace('sqrt', '√');
      if (token.value.includes('abs')) return token.value; // Keep as abs(...)
      if (token.value.includes('mod')) return 'mod';
    }
    if (token.type === 'function-call') {
      return token.value === 'sqrt' ? '√' : token.value;
    }
    return token.value;
  };

  const renderToken = (token: EquationToken): JSX.Element => {
    if (token.type === 'function-call') {
      return (
        <div
          key={token.id}
          className={getTokenClassName(token)}
          onClick={(e) => {
            e.stopPropagation();
            removeToken(token.id);
          }}
          title="Click to remove function"
        >
          <span className="function-name">{getTokenDisplayValue(token)}</span>
          <span className="function-paren-large">(</span>
          <div className="function-content" onClick={(e) => e.stopPropagation()}>
            {token.children?.map(child => renderToken(child))}
          </div>
          <span className="function-paren-large">)</span>
          <span className="token-remove">×</span>
        </div>
      );
    }

    if (token.type === 'parentheses-group') {
      return (
        <div
          key={token.id}
          className={getTokenClassName(token)}
          onClick={(e) => {
            e.stopPropagation();
            removeToken(token.id);
          }}
          title="Click to remove parentheses group"
        >
          <span className="paren-large">(</span>
          <div className="paren-content" onClick={(e) => e.stopPropagation()}>
            {token.children?.map(child => renderToken(child))}
          </div>
          <span className="paren-large">)</span>
          <span className="token-remove">×</span>
        </div>
      );
    }

    return (
      <div
        key={token.id}
        className={getTokenClassName(token)}
        onClick={(e) => {
          e.stopPropagation();
          removeToken(token.id);
        }}
        title="Click to remove"
      >
        {getTokenDisplayValue(token)}
        <span className="token-remove">×</span>
      </div>
    );
  };
  
  return (
    <div className="equation-builder">
      <div className="equation-display">
        <div className="equation-tokens">
          {tokens.length === 0 ? (
            <div className="equation-placeholder">
              Click numbers and operators to build your equation
            </div>
          ) : (
            tokens.map(token => renderToken(token))
          )}
        </div>
      </div>
      <div className="equation-actions">
        <button
          type="button"
          onClick={onClear}
          className="clear-equation-btn"
          title="Clear all tokens"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

export default EquationBuilder;