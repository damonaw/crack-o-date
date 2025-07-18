import React from 'react';
import MathDisplay from './MathDisplay';
import './SolutionHistory.css';

interface Solution {
  id: string;
  date: string;
  equation: string;
  score: number;
  isRetroactive: boolean;
  leftValue: number;
  rightValue: number;
  timestamp: string;
}

interface SolutionHistoryProps {
  solutions: Solution[];
  className?: string;
}

const SolutionHistory: React.FC<SolutionHistoryProps> = ({ solutions, className = '' }) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 15) return 'excellent';
    if (score >= 10) return 'good';
    if (score >= 5) return 'average';
    return 'basic';
  };

  return (
    <div className={`solution-history ${className}`}>
      <h2>Solution History</h2>
      {solutions.length === 0 ? (
        <div className="no-solutions">
          <p>No solutions yet. Start solving today's puzzle!</p>
        </div>
      ) : (
        <div className="solutions-grid">
          {solutions.map((solution) => (
            <div key={solution.id} className={`solution-card ${solution.isRetroactive ? 'retroactive' : ''}`}>
              <div className="solution-header">
                <h3 className="solution-date">{formatDate(solution.date)}</h3>
                <div className="solution-meta">
                  <span className={`score-badge ${getScoreColor(solution.score)}`}>
                    {solution.score} pts
                  </span>
                  <span className="solution-time">{formatTime(solution.timestamp)}</span>
                </div>
              </div>
              
              <div className="solution-equation">
                <MathDisplay 
                  equation={solution.equation} 
                  className="success"
                />
              </div>
              
              <div className="solution-verification">
                <div className="verification-row">
                  <span className="verification-label">Left side:</span>
                  <span className="verification-value">{solution.leftValue}</span>
                </div>
                <div className="verification-row">
                  <span className="verification-label">Right side:</span>
                  <span className="verification-value">{solution.rightValue}</span>
                </div>
                <div className="verification-row">
                  <span className="verification-label">Result:</span>
                  <span className="verification-success">✓ Equal</span>
                </div>
              </div>
              
              {solution.isRetroactive && (
                <div className="retroactive-notice">
                  <span className="retroactive-icon">⚠️</span>
                  <span>Solved after the puzzle date</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SolutionHistory;