'use client';

import { InputHTMLAttributes } from 'react';

/**
 * Props for the FormInput component
 */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    description?: string;
    required?: boolean;
}

/**
 * Standardized form input component with label, error handling, and description support
 */
export function FormInput({ label, error, description, required, className = '', ...props }: FormInputProps) {
    return (
        <div className="mb-4">
            <div className="flex flex-col mb-1.5 space-y-0.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    {label}
                    {required && <span className="text-red-500 ml-1 font-bold">*</span>}
                </label>
                {description && (
                    <p className="text-[10px] text-gray-400 font-medium italic ml-1 leading-tight">
                        {description}
                    </p>
                )}
            </div>
            <input
                {...props}
                className={`
                    w-full px-4 py-2.5 rounded-xl border border-gray-200 
                    focus:border-primary focus:ring-4 focus:ring-primary/10 
                    transition-all duration-200 outline-none text-sm font-medium
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}
                    ${props.disabled ? 'bg-gray-50/50 text-gray-400 cursor-not-allowed border-gray-100' : 'text-gray-700'}
                    ${className}
                `}
            />
            {error && (
                <p className="mt-1.5 ml-1 text-[10px] font-bold text-red-500 uppercase tracking-wide animate-pulse">
                    {error}
                </p>
            )}
        </div>
    );
}
