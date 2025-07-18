import React from 'react';
import 'katex/dist/katex.min.css';
import katex from 'katex';

interface MathDisplayProps {
  equation: string;
  className?: string;
}

const MathDisplay: React.FC<MathDisplayProps> = ({ equation, className = '' }) => {
  const formatEquationForKaTeX = (eq: string): string => {
    let result = eq;
    
    // Handle specific function patterns first
    result = result.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');
    result = result.replace(/abs\(([^)]+)\)/g, '\\left|$1\\right|');
    result = result.replace(/mod\(([^)]+)\)/g, '\\bmod($1)');
    
    // Handle operators
    result = result.replace(/\*/g, '\\cdot');
    result = result.replace(/\//g, '\\div');
    result = result.replace(/\bmod\b/g, '\\bmod');
    result = result.replace(/\^/g, '^');
    
    return result;
  };

  const renderMath = () => {
    try {
      const formattedEquation = formatEquationForKaTeX(equation);
      const html = katex.renderToString(formattedEquation, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#cc0000'
      });
      return { __html: html };
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return { __html: `<span class="katex-error">${equation}</span>` };
    }
  };

  return (
    <div 
      className={`math-display ${className}`}
      dangerouslySetInnerHTML={renderMath()}
    />
  );
};

export default MathDisplay;