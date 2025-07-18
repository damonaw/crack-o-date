export interface DateNumbers {
  numbers: number[];
  dateString: string;
  originalDate: Date;
  isToday: boolean;
  monthLength: number;
  dayLength: number;
}

export function getCurrentDateNumbers(): DateNumbers {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  });
  
  return parseDate(dateString, true);
}

export function parseDate(dateString: string, isToday: boolean = false): DateNumbers {
  // Handle different date formats: M/D/YYYY, MM/DD/YYYY, etc.
  const parts = dateString.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected M/D/YYYY or MM/DD/YYYY');
  }
  
  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  // Validate date components
  if (month < 1 || month > 12) {
    throw new Error('Invalid month');
  }
  if (day < 1 || day > 31) {
    throw new Error('Invalid day');
  }
  if (year < 1000 || year > 9999) {
    throw new Error('Invalid year');
  }
  
  // Convert to individual digits
  const numbers: number[] = [];
  let monthLength = 0;
  let dayLength = 0;
  
  // Add month digits
  if (month < 10) {
    numbers.push(month);
    monthLength = 1;
  } else {
    numbers.push(Math.floor(month / 10), month % 10);
    monthLength = 2;
  }
  
  // Add day digits
  if (day < 10) {
    numbers.push(day);
    dayLength = 1;
  } else {
    numbers.push(Math.floor(day / 10), day % 10);
    dayLength = 2;
  }
  
  // Add year digits
  numbers.push(
    Math.floor(year / 1000),
    Math.floor((year % 1000) / 100),
    Math.floor((year % 100) / 10),
    year % 10
  );
  
  return {
    numbers,
    dateString,
    originalDate: new Date(year, month - 1, day),
    isToday,
    monthLength,
    dayLength
  };
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function isDateToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getDateFromNumbers(numbers: number[]): string {
  if (numbers.length < 6) {
    throw new Error('Invalid date numbers array');
  }
  
  // Reconstruct date from numbers
  // This is a simplified version - in practice, you'd need to know the original format
  const month = numbers.length >= 8 ? numbers[0] * 10 + numbers[1] : numbers[0];
  const day = numbers.length >= 8 ? numbers[2] * 10 + numbers[3] : numbers[1] * 10 + numbers[2];
  const yearStart = numbers.length >= 8 ? 4 : 3;
  const year = numbers[yearStart] * 1000 + numbers[yearStart + 1] * 100 + 
               numbers[yearStart + 2] * 10 + numbers[yearStart + 3];
  
  return `${month}/${day}/${year}`;
}