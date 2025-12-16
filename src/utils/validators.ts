/**
 * Utility functions for form validation
 */

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

/**
 * Validate required fields
 */
export function validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
        return `${fieldName} is required`;
    }
    return null;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    return null;
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
    if (value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value.length > maxLength) {
        return `${fieldName} must not exceed ${maxLength} characters`;
    }
    return null;
}

/**
 * Validate number range
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): string | null {
    if (value < min || value > max) {
        return `${fieldName} must be between ${min} and ${max}`;
    }
    return null;
}

/**
 * Validate pattern (regex)
 */
export function validatePattern(value: string, pattern: RegExp, message: string): string | null {
    if (!pattern.test(value)) {
        return message;
    }
    return null;
}

/**
 * Generic form validator
 */
export function validateForm<T extends Record<string, any>>(
    data: T,
    rules: Partial<Record<keyof T, (value: any) => string | null>>
): ValidationResult {
    const errors: Record<string, string> = {};

    for (const field in rules) {
        const validator = rules[field];
        if (validator) {
            const error = validator(data[field]);
            if (error) {
                errors[field] = error;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

/**
 * Compose multiple validators
 */
export function composeValidators(
    ...validators: Array<(value: any) => string | null>
): (value: any) => string | null {
    return (value: any) => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) {
                return error;
            }
        }
        return null;
    };
}
