import { Platform } from 'react-native';

/**
 * Returns a color based on the order status
 * @param status The order status
 * @param colors Optional theme colors object
 * @returns A color string (hex, rgb, or named color)
 */
export const getStatusColor = (status: string, colors?: any): string => {
  // Default colors if theme colors aren't provided
  const defaultColors = {
    primary: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    success: '#10b981',
    muted: '#6b7280',
  };

  // Use theme colors if provided, otherwise use defaults
  const colorSet = colors || defaultColors;

  switch (status.toLowerCase()) {
    case 'pending':
      return colorSet.warning;
    case 'accepted':
      return colorSet.info;
    case 'preparing':
    case 'being prepared':
      return colorSet.info;
    case 'ready':
    case 'ready for pickup':
      return colorSet.primary;
    case 'in transit':
    case 'out for delivery':
      return colorSet.info;
    case 'delivered':
    case 'completed':
      return colorSet.success;
    case 'cancelled':
    case 'rejected':
      return colorSet.error;
    default:
      return colorSet.muted;
  }
};

/**
 * Formats a status string to be more readable
 * @param status The order status
 * @returns A formatted status string
 */
export const formatStatus = (status: string): string => {
  if (!status) return '';
  
  // Convert to title case and handle special cases
  const formatted = status
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    
  return formatted;
};

/**
 * Formats a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Format: "Jan 1, 2023 at 12:00 PM"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + 
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a date to show how long ago it was
 * @param dateString ISO date string
 * @returns Time ago string (e.g., "2 hours ago")
 */
export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Less than a minute
  if (seconds < 60) {
    return 'just now';
  }
  
  // Less than an hour
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as regular date for older dates
  return formatDate(dateString);
};

// Placeholder for status icon function
// Components can implement their own version based on the icons they use
export const getStatusIcon = (status: string) => {
  // This would return the appropriate icon component based on status
  return null;
};