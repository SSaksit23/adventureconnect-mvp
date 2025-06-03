// frontend/src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// frontend/src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// frontend/src/utils/formatters.js
import { format, formatDistance, formatRelative, isValid } from 'date-fns';

export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isValid(dateObj) ? format(dateObj, formatStr) : '';
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (!isValid(start) || !isValid(end)) return '';
  
  // Same year
  if (start.getFullYear() === end.getFullYear()) {
    // Same month
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')}-${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  }
  
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// frontend/src/utils/validators.js
export const validateEmail = (email) => {
  const re = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or WebP images.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }
  
  return { valid: true };
};

// frontend/src/utils/constants.js
export const ACTIVITY_TYPES = [
  'Adventure',
  'Cultural',
  'Culinary',
  'Wildlife',
  'Wellness',
  'Photography',
  'Hiking',
  'Water Sports',
  'Educational',
  'Eco-Tourism',
];

export const DIFFICULTY_LEVELS = [
  { value: 'Easy', label: 'Easy - Suitable for all fitness levels' },
  { value: 'Moderate', label: 'Moderate - Some physical activity required' },
  { value: 'Challenging', label: 'Challenging - Good fitness level required' },
  { value: 'Expert', label: 'Expert - High fitness level and experience required' },
];

export const BOOKING_STATUS = {
  INQUIRY: 'inquiry',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const TRIP_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PAUSED: 'paused',
};