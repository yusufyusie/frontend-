/**
 * Utility functions for data formatting
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
    const d = new Date(date);

    if (includeTime) {
        return d.toLocaleString();
    }

    return d.toLocaleDateString();
}

/**
 * Format a date to time only
 */
export function formatTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString();
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 30) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(camelCase: string): string {
    const result = camelCase.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Format file size in bytes to human readable
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Format array to comma-separated string
 */
export function formatList(items: string[], conjunction: string = 'and'): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const lastItem = items[items.length - 1];
    const otherItems = items.slice(0, -1).join(', ');
    return `${otherItems}, ${conjunction} ${lastItem}`;
}
