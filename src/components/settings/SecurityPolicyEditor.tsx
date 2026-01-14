'use client';

import { useState } from 'react';
import { settingsService } from '@/services/settings.service';
import { toast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface SecurityPolicyEditorProps {
    policy: any;
    onUpdate: () => void;
}

import { Shield, Key } from 'lucide-react';

export function SecurityPolicyEditor({ policy, onUpdate }: SecurityPolicyEditorProps) {
    const [formData, setFormData] = useState({ ...policy });
    const [saving, setSaving] = useState(false);

    /**
     * Handle input change
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await settingsService.updateSecurityPolicy(policy.id, formData);
            toast.success('Security policy updated successfully');
            onUpdate();
        } catch (error: any) {
            toast.error('Failed to update policy: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account security section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Account Security
                    </h3>
                    <div className="space-y-4 card p-4">
                        <InputGroup
                            label="Max Failed Attempts"
                            name="maxFailedAttempts"
                            type="number"
                            value={formData.maxFailedAttempts}
                            onChange={handleChange}
                            description="Number of attempts before lockout"
                        />
                        <InputGroup
                            label="Lockout Duration (min)"
                            name="lockoutDurationMinutes"
                            type="number"
                            value={formData.lockoutDurationMinutes}
                            onChange={handleChange}
                            description="Account lockout period"
                        />
                        <InputGroup
                            label="JWT Expiry"
                            name="jwtExpiresIn"
                            type="text"
                            value={formData.jwtExpiresIn}
                            onChange={handleChange}
                            description="Duration format: 1h, 7d, 24h"
                        />
                    </div>
                </section>

                {/* Password rules section */}
                <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        Password Rules
                    </h3>
                    <div className="space-y-4 card p-4">
                        <InputGroup
                            label="Min Password Length"
                            name="minPasswordLength"
                            type="number"
                            value={formData.minPasswordLength}
                            onChange={handleChange}
                        />
                        <CheckboxGroup
                            label="Require Uppercase"
                            name="requireUppercase"
                            checked={formData.requireUppercase}
                            onChange={handleChange}
                        />
                        <CheckboxGroup
                            label="Require Numbers"
                            name="requireNumbers"
                            checked={formData.requireNumbers}
                            onChange={handleChange}
                        />
                        <CheckboxGroup
                            label="Require Special Characters"
                            name="requireSpecialChars"
                            checked={formData.requireSpecialChars}
                            onChange={handleChange}
                        />
                    </div>
                </section>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary min-w-[140px]"
                >
                    {saving ? <LoadingSpinner size="sm" /> : 'Save Security Policy'}
                </button>
            </div>
        </form>
    );
}

function InputGroup({ label, name, type, value, onChange, description }: any) {
    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
    );
}

function CheckboxGroup({ label, name, checked, onChange }: any) {
    return (
        <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
        </label>
    );
}
