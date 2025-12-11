'use client';

import { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    required?: boolean;
}

export function FormInput({ label, error, required, className = '', ...props }: FormInputProps) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                {...props}
                className={`
                    w-full px-4 py-2.5 rounded-lg border border-gray-300 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                    transition-all duration-200 outline-none
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
                    ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                    ${className}
                `}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
