import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { solutionsService, UserStats } from '../services/solutionsService';
import SolutionHistory from '../components/SolutionHistory';
import './ProfilePage.css';

interface ProfileSolution {
  id: string;
  date: string;
  equation: string;
  score: number;
  isRetroactive: boolean;
  leftValue: number;
  rightValue: number;
  timestamp: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<ProfileSolution[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch user solutions and stats in parallel
        const [solutionsResponse, userStats] = await Promise.all([
          solutionsService.getUserSolutions(1, 50), // Get first 50 solutions
          solutionsService.getUserStats()
        ]);

        // Transform solutions to match ProfileSolution interface
        const transformedSolutions: ProfileSolution[] = solutionsResponse.solutions.map(solution => ({
          id: solution.id.toString(),
          date: solution.date_string,
          equation: solution.equation,
          score: solution.score,
          isRetroactive: solution.is_retroactive,
          leftValue: solution.left_value,
          rightValue: solution.right_value,
          timestamp: solution.created_at
        }));

        setSolutions(transformedSolutions);
        setStats(userStats);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="login-required">
            <h2>Login Required</h2>
            <p>Please log in to view your profile and solution history.</p>
            <a href="/" className="back-link">← Back to Game</a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <header className="profile-header">
            <h1>Your Profile</h1>
            <a href="/" className="back-link">← Back to Game</a>
          </header>
          <div className="loading-state">
            <p>Loading your profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <header className="profile-header">
            <h1>Your Profile</h1>
            <a href="/" className="back-link">← Back to Game</a>
          </header>
          <div className="error-state">
            <h3>Error Loading Profile</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <h1>Your Profile</h1>
          <a href="/" className="back-link">← Back to Game</a>
        </header>

        <div className="user-info">
          <h2>Welcome back, {user.username}!</h2>
          <p className="user-email">{user.email}</p>
        </div>

        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Solutions</h3>
            <span className="stat-value">{stats?.total_solutions || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Current Solutions</h3>
            <span className="stat-value">{stats?.current_solutions || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Total Score</h3>
            <span className="stat-value">{stats?.total_score || 0}</span>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <span className="stat-value">{stats?.average_score ? stats.average_score.toFixed(1) : '0.0'}</span>
          </div>
          <div className="stat-card">
            <h3>Highest Score</h3>
            <span className="stat-value">{stats?.highest_score || 0}</span>
          </div>
        </div>

        <SolutionHistory solutions={solutions} />
      </div>
    </div>
  );
};

export default ProfilePage;