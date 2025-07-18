const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface SolutionData {
  equation: string;
  score: number;
  leftValue: number;
  rightValue: number;
  dateString: string;
  dateNumbers: number[];
  monthLength: number;
  dayLength: number;
  isRetroactive: boolean;
}

export interface Solution {
  id: number;
  user_id: number;
  puzzle_date_id: number;
  equation: string;
  score: number;
  left_value: number;
  right_value: number;
  is_retroactive: boolean;
  created_at: string;
  date_string: string;
  date_numbers: number[];
}

export interface UserStats {
  total_solutions: number;
  current_solutions: number;
  total_score: number;
  average_score: number;
  highest_score: number;
}

export class SolutionsService {
  private getRequestOptions(method: string = 'GET', body?: string): RequestInit {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include httpOnly cookies
      ...(body && { body })
    };
  }

  async submitSolution(solutionData: SolutionData): Promise<Solution> {
    const response = await fetch(`${API_BASE_URL}/solutions`, 
      this.getRequestOptions('POST', JSON.stringify(solutionData))
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit solution');
    }

    const data = await response.json();
    return data.solution;
  }

  async getUserSolutions(page: number = 1, limit: number = 10): Promise<{
    solutions: Solution[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/solutions?page=${page}&limit=${limit}`, 
      this.getRequestOptions()
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch solutions');
    }

    return await response.json();
  }

  async getUserStats(): Promise<UserStats> {
    const response = await fetch(`${API_BASE_URL}/solutions/stats`, 
      this.getRequestOptions()
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch statistics');
    }

    const data = await response.json();
    return data.stats;
  }
}

export const solutionsService = new SolutionsService();