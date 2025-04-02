import '@testing-library/jest-dom';

// Mock the Date object to have consistent testing
const mockDate = new Date('2024-04-01');
global.Date = class extends Date {
  constructor() {
    return mockDate;
  }
}; 