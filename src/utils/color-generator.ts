/**
 * Dynamic color generator for permission groups
 * Generates consistent, visually pleasing colors based on group names
 */

/**
 * Generate a hash from a string
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Generate a dynamic color scheme for a group
 * Returns Tailwind-compatible gradient classes
 */
export function generateGroupColor(groupName: string): {
    gradient: string;
    bg: string;
    text: string;
    border: string;
} {
    const hash = hashString(groupName);

    // Use golden ratio for better distribution
    const hue = (hash * 137.508) % 360;

    // Ensure good saturation and lightness for vibrant colors
    const saturation = 65 + (hash % 20); // 65-85%
    const lightness = 55 + (hash % 10);  // 55-65%

    // Generate complementary hue for gradient
    const hue2 = (hue + 30) % 360;

    return {
        gradient: `linear-gradient(135deg, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${hue2}, ${saturation}%, ${lightness - 5}%))`,
        bg: `hsl(${hue}, ${saturation - 50}%, 95%)`,
        text: `hsl(${hue}, ${saturation}%, 35%)`,
        border: `hsl(${hue}, ${saturation - 20}%, 75%)`,
    };
}

/**
 * Generate inline styles for gradient backgrounds
 */
export function getGradientStyle(groupName: string): React.CSSProperties {
    const colors = generateGroupColor(groupName);
    return {
        background: colors.gradient,
    };
}

/**
 * Get text color class for a group
 */
export function getTextColor(groupName: string): string {
    const colors = generateGroupColor(groupName);
    return colors.text;
}

/**
 * Get background color for a group
 */
export function getBgColor(groupName: string): string {
    const colors = generateGroupColor(groupName);
    return colors.bg;
}

/**
 * Get border color for a group
 */
export function getBorderColor(groupName: string): string {
    const colors = generateGroupColor(groupName);
    return colors.border;
}
