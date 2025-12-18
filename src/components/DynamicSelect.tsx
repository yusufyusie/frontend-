'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Search, ChevronDown } from 'lucide-react';

export interface SelectOption {
    value: string | number;
    label: string;
    description?: string;
    group?: string;
    disabled?: boolean;
}

interface DynamicSelectProps {
    options: SelectOption[];
    value?: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    label?: string;
    multiple?: boolean;
    searchable?: boolean;
    disabled?: boolean;
    error?: string;
    maxHeight?: number;
}

export function DynamicSelect({
    options,
    value = [],
    onChange,
    placeholder = 'Select...',
    label,
    multiple = true,
    searchable = true,
    disabled = false,
    error,
    maxHeight = 300,
}: DynamicSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen, searchable]);

    const filteredOptions = searchTerm
        ? options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            opt.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : options;

    const groupedOptions = filteredOptions.reduce((acc, option) => {
        const group = option.group || '__ungrouped__';
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
    }, {} as Record<string, SelectOption[]>);

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    const handleToggleOption = (optionValue: string | number) => {
        if (multiple) {
            if (value.includes(optionValue)) {
                onChange(value.filter(v => v !== optionValue));
            } else {
                onChange([...value, optionValue]);
            }
        } else {
            onChange([optionValue]);
            setIsOpen(false);
        }
    };

    const handleRemoveOption = (optionValue: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const handleSelectAll = () => {
        const allValues = filteredOptions
            .filter(opt => !opt.disabled)
            .map(opt => opt.value);
        onChange(allValues);
    };

    const handleDeselectAll = () => {
        onChange([]);
    };

    return (
        <div className="w-full relative" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            {/* Selected Items Display */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`min-h-[44px] px-3 py-2 border rounded-lg cursor-pointer transition-all ${disabled
                    ? 'bg-gray-100 cursor-not-allowed'
                    : isOpen
                        ? 'border-primary-500 ring-2 ring-blue-200'
                        : error
                            ? 'border-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
            >
                <div className="flex flex-wrap gap-2 items-center">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(option => (
                            <span
                                key={option.value}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-100 text-primary-800 text-sm rounded-md border border-blue-200"
                            >
                                <span className="font-medium">{option.label}</span>
                                {!disabled && (
                                    <button
                                        onClick={(e) => handleRemoveOption(option.value, e)}
                                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm py-1">{placeholder}</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-2xl">
                    {/* Search */}
                    {searchable && (
                        <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Select/Deselect All */}
                    {multiple && (
                        <div className="flex gap-2 p-3 border-b border-gray-200 bg-gray-50">
                            <button
                                onClick={handleSelectAll}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded border border-blue-200 transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleDeselectAll}
                                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                            >
                                Deselect All
                            </button>
                        </div>
                    )}

                    {/* Options List */}
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
                            <div key={group}>
                                {group !== '__ungrouped__' && (
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                                        {group}
                                    </div>
                                )}
                                {groupOptions.map(option => {
                                    const isSelected = value.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => !option.disabled && handleToggleOption(option.value)}
                                            disabled={option.disabled}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${option.disabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-primary-50 text-blue-900'
                                                    : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'border-gray-300'
                                                }`}>
                                                {isSelected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                    {option.label}
                                                </p>
                                                {option.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                        {option.description}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}

                        {filteredOptions.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <p className="text-sm">No options found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
