import React from 'react';
import SolutionHistory from '../components/SolutionHistory';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  // TODO: Replace with actual user data
  const mockSolutions = [
    {
      id: '1',
      date: '7/18/2025',
      equation: '7 - 1 + 8 = 2^0 + 2 * 5',
      score: 7,
      isRetroactive: false,
      leftValue: 14,
      rightValue: 11,
      timestamp: '2025-07-18T14:30:00Z'
    },
    {
      id: '2',
      date: '7/17/2025',
      equation: '7 + 1 - 7 = 2 * 0 * 2 * 5',
      score: 4,
      isRetroactive: true,
      leftValue: 1,
      rightValue: 0,
      timestamp: '2025-07-18T10:15:00Z'
    },
    {
      id: '3',
      date: '7/16/2025',
      equation: '7 * 1 + 6 = 2 + 0 + 2 * 5 + 1',
      score: 12,
      isRetroactive: false,
      leftValue: 13,
      rightValue: 13,
      timestamp: '2025-07-16T09:45:00Z'
    }
  ];

  const totalScore = mockSolutions.reduce((sum, solution) => sum + solution.score, 0);
  const currentSolutions = mockSolutions.filter(s => !s.isRetroactive);
  const averageScore = currentSolutions.length > 0 ? 
    currentSolutions.reduce((sum, s) => sum + s.score, 0) / currentSolutions.length : 0;

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <h1>Your Profile</h1>
          <a href="/" className="back-link">← Back to Game</a>
        </header>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Solutions</h3>
            <span className="stat-value">{mockSolutions.length}</span>
          </div>
          <div className="stat-card">
            <h3>Total Score</h3>
            <span className="stat-value">{totalScore}</span>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <span className="stat-value">{averageScore.toFixed(1)}</span>
          </div>
        </div>

        <SolutionHistory solutions={mockSolutions} />
      </div>
    </div>
  );
};

export default ProfilePage;