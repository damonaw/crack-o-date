import React, { useState } from 'react';
import { parseDate, isDateToday } from '../utils/dateUtils';
import './DatePicker.css';

interface DatePickerProps {
  currentDate: string;
  onDateChange: (dateString: string, isRetroactive: boolean) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ currentDate, onDateChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    try {
      // Convert from YYYY-MM-DD to M/D/YYYY format
      const [year, month, day] = newDate.split('-');
      const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
      
      const parsedDate = parseDate(formattedDate);
      const isRetroactive = !isDateToday(parsedDate.originalDate);
      
      onDateChange(formattedDate, isRetroactive);
      setIsOpen(false);
    } catch (error) {
      console.error('Invalid date selected:', error);
    }
  };

  const formatDateForInput = (dateString: string): string => {
    try {
      const [month, day, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const formatDateForDisplay = (dateString: string): string => {
    try {
      const parsedDate = parseDate(dateString);
      return parsedDate.originalDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getTodayString = (): string => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  };

  const isCurrentDateToday = currentDate === getTodayString();

  return (
    <div className="date-picker">
      <button 
        className={`date-picker-button ${isCurrentDateToday ? 'today' : 'historical'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="date-text">
          {isCurrentDateToday ? '📅 Today' : '📅 ' + formatDateForDisplay(currentDate)}
        </span>
        {!isCurrentDateToday && <span className="historical-badge">Historical</span>}
      </button>
      
      {isOpen && (
        <div className="date-picker-dropdown">
          <div className="date-picker-header">
            <h3>Select Puzzle Date</h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          
          <div className="date-picker-content">
            <div className="quick-actions">
              <button 
                className="quick-action-btn today-btn"
                onClick={() => {
                  const today = getTodayString();
                  onDateChange(today, false);
                  setIsOpen(false);
                }}
              >
                Today's Puzzle
              </button>
            </div>
            
            <div className="date-input-section">
              <label htmlFor="date-input">Or choose any date:</label>
              <input
                id="date-input"
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="date-picker-note">
              <p>
                <strong>Note:</strong> Solutions for past dates will be marked as historical 
                and won't count toward your running average.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;