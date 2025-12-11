'use client';

import { useState } from 'react';

interface Option {
    id: number;
    name: string;
    description?: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selectedIds: number[];
    onChange: (selectedIds: number[]) => void;
    placeholder?: string;
}

export function MultiSelect({ label, options, selectedIds, onChange, placeholder = 'Select items...' }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOptions = options.filter(opt => selectedIds.includes(opt.id));

    const toggleOption = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

            {/* Selected Items Display */}
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedOptions.length === 0 ? (
                    <span className="text-sm text-gray-400">{placeholder}</span>
                ) : (
                    selectedOptions.map(option => (
                        <span
                            key={option.id}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm"
                        >
                            {option.name}
                            <button
                                onClick={() => toggleOption(option.id)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Search and Select */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search and select..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                />

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => {
                                setIsOpen(false);
                                setSearchTerm('');
                            }}
                        />

                        {/* Options Dropdown */}
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-gray-500">No options found</div>
                            ) : (
                                filteredOptions.map(option => (
                                    <div
                                        key={option.id}
                                        onClick={() => toggleOption(option.id)}
                                        className={`
                                            px-4 py-3 cursor-pointer transition-colors
                                            hover:bg-blue-50
                                            ${selectedIds.includes(option.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                                        `}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900">{option.name}</div>
                                                {option.description && (
                                                    <div className="text-sm text-gray-500">{option.description}</div>
                                                )}
                                            </div>
                                            {selectedIds.includes(option.id) && (
                                                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
