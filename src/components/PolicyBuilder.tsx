'use client';

import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

export interface PolicyCondition {
    attribute: string;
    operator: string;
    value: string;
}

export interface PolicyRule {
    operator: 'AND' | 'OR' | 'NOT';
    conditions?: PolicyCondition[];
    rules?: PolicyRule[];
}

interface PolicyBuilderProps {
    value: PolicyRule;
    onChange: (rule: PolicyRule) => void;
    level?: number;
}

const ATTRIBUTES = [
    { value: 'user.role', label: 'User Role' },
    { value: 'user.email', label: 'User Email' },
    { value: 'user.department', label: 'User Department' },
    { value: 'resource.type', label: 'Resource Type' },
    { value: 'resource.owner', label: 'Resource Owner' },
    { value: 'action', label: 'Action' },
    { value: 'context.time', label: 'Time' },
    { value: 'context.ipAddress', label: 'IP Address' },
    { value: 'context.device', label: 'Device Type' },
];

const OPERATORS = [
    { value: 'equals', label: 'Equals' },
    { value: 'notEquals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not Contains' },
    { value: 'in', label: 'In' },
    { value: 'notIn', label: 'Not In' },
    { value: 'greaterThan', label: 'Greater Than' },
    { value: 'lessThan', label: 'Less Than' },
    { value: 'greaterThanOrEqual', label: 'Greater Than or Equal' },
    { value: 'lessThanOrEqual', label: 'Less Than or Equal' },
];

export function PolicyBuilder({ value, onChange, level = 0 }: PolicyBuilderProps) {
    const isMaxDepth = level >= 3; // Limit nesting to 3 levels

    const updateOperator = (operator: 'AND' | 'OR' | 'NOT') => {
        onChange({ ...value, operator });
    };

    const addCondition = () => {
        const newCondition: PolicyCondition = {
            attribute: 'user.role',
            operator: 'equals',
            value: '',
        };

        onChange({
            ...value,
            conditions: [...(value.conditions || []), newCondition],
        });
    };

    const updateCondition = (index: number, field: keyof PolicyCondition, newValue: string) => {
        const newConditions = [...(value.conditions || [])];
        newConditions[index] = { ...newConditions[index], [field]: newValue };
        onChange({ ...value, conditions: newConditions });
    };

    const removeCondition = (index: number) => {
        onChange({
            ...value,
            conditions: value.conditions?.filter((_, i) => i !== index),
        });
    };

    const addNestedRule = () => {
        const newRule: PolicyRule = {
            operator: 'AND',
            conditions: [],
        };

        onChange({
            ...value,
            rules: [...(value.rules || []), newRule],
        });
    };

    const updateNestedRule = (index: number, newRule: PolicyRule) => {
        const newRules = [...(value.rules || [])];
        newRules[index] = newRule;
        onChange({ ...value, rules: newRules });
    };

    const removeNestedRule = (index: number) => {
        onChange({
            ...value,
            rules: value.rules?.filter((_, i) => i !== index),
        });
    };

    const indentClass = level === 0 ? '' : 'ml-8';
    const borderColor = level % 2 === 0 ? 'border-primary-200' : 'border-secondary-200';
    const bgColor = level % 2 === 0 ? 'bg-primary-50/30' : 'bg-secondary-50/30';

    return (
        <div className={`${indentClass} space-y-4`}>
            <div className={`border-2 ${borderColor} ${bgColor} rounded-xl p-6 space-y-4`}>
                {/* Operator Selection */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Rule Operator:</label>
                    <div className="flex gap-2">
                        {(['AND', 'OR', 'NOT'] as const).map((op) => (
                            <button
                                key={op}
                                onClick={() => updateOperator(op)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${value.operator === op
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-300'
                                    }`}
                            >
                                {op}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conditions */}
                {value.conditions && value.conditions.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-700">Conditions:</h4>
                        {value.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <select
                                    value={condition.attribute}
                                    onChange={(e) => updateCondition(index, 'attribute', e.target.value)}
                                    className="select flex-1"
                                >
                                    {ATTRIBUTES.map((attr) => (
                                        <option key={attr.value} value={attr.value}>
                                            {attr.label}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={condition.operator}
                                    onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                    className="select flex-1"
                                >
                                    {OPERATORS.map((op) => (
                                        <option key={op.value} value={op.value}>
                                            {op.label}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                    placeholder="Value..."
                                    className="input flex-1"
                                />

                                <button
                                    onClick={() => removeCondition(index)}
                                    className="btn-sm btn-danger"
                                    title="Remove condition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                    <button onClick={addCondition} className="btn-sm btn-primary">
                        <Plus className="w-4 h-4" />
                        Add Condition
                    </button>

                    {!isMaxDepth && (
                        <button onClick={addNestedRule} className="btn-sm btn-secondary">
                            <Plus className="w-4 h-4" />
                            Add Nested Rule
                        </button>
                    )}
                </div>

                {/* Nested Rules */}
                {value.rules && value.rules.length > 0 && (
                    <div className="space-y-4 pt-4">
                        <h4 className="text-sm font-semibold text-gray-700">Nested Rules:</h4>
                        {value.rules.map((nestedRule, index) => (
                            <div key={index} className="relative">
                                <button
                                    onClick={() => removeNestedRule(index)}
                                    className="absolute -top-2 -right-2 z-10 bg-error-600 text-white rounded-full p-1.5 hover:bg-error-700 shadow-lg transition-all hover:scale-110"
                                    title="Remove nested rule"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <PolicyBuilder
                                    value={nestedRule}
                                    onChange={(newRule) => updateNestedRule(index, newRule)}
                                    level={level + 1}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
