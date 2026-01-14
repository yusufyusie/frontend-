'use client';

import { useState, useEffect } from 'react';
import { settingsService } from '@/services/settings.service';
import { toast } from '@/components/Toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

import { Info, Plus } from 'lucide-react';

export function PolicyEditor() {
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        fetchPolicies();
    }, []);

    /**
     * Fetch all access policies from API
     */
    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const data = await settingsService.getPolicies();
            setPolicies(data);
        } catch (error: any) {
            toast.error('Failed to load policies: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle policy activation status
     */
    const handleToggleActive = async (policy: any) => {
        try {
            setSaving(policy.id);
            await settingsService.updatePolicy(policy.id, { isActive: !policy.isActive });
            toast.success(`Policy ${policy.isActive ? 'disabled' : 'enabled'}`);
            fetchPolicies();
        } catch (error: any) {
            toast.error('Failed to toggle policy: ' + error.message);
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><LoadingSpinner size="md" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">Access Policies (PBAC)</h3>
                <button className="btn btn-primary btn-sm flex items-center gap-2" onClick={() => toast.info('Advanced Rule Builder coming soon')}>
                    <Plus className="w-4 h-4" />
                    New Policy
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {policies.length === 0 ? (
                    <div className="card p-10 text-center text-gray-500 italic">
                        No custom policies defined. System defaults apply.
                    </div>
                ) : (
                    policies.map(policy => (
                        <div key={policy.id} className={`card p-5 border-l-4 transition-all hover:shadow-md ${policy.isActive ? (policy.effect === 'DENY' ? 'border-red-500' : 'border-green-500') : 'border-gray-300'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-1 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${policy.effect === 'DENY' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {policy.effect}
                                        </span>
                                        <h4 className="font-bold text-gray-900">{policy.name}</h4>
                                        {policy.isSystem && <span className="badge badge-info text-[10px] font-bold">System</span>}
                                    </div>
                                    <p className="text-sm text-gray-600">{policy.description}</p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {policy.conditions?.map((cond: any) => (
                                            <span key={cond.id} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs border border-gray-200">
                                                <span className="font-bold text-gray-500 mr-1">{cond.type}:</span>
                                                {cond.key && <span className="mr-1">{cond.key}</span>}
                                                <span className="text-primary font-mono lowercase mr-1">{cond.operator}</span>
                                                <span className="text-gray-900">{cond.value}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:border-l md:pl-4">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</div>
                                        <div className="font-mono text-sm text-gray-900">{policy.priority}</div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleActive(policy)}
                                        disabled={saving === policy.id}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${policy.isActive ? 'bg-primary' : 'bg-gray-200'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${policy.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>
                    <strong>Policy Processing:</strong> Policies are evaluated in order of <strong>Priority</strong> (highest first).
                    A <strong>DENY</strong> policy match results in immediate access rejection. If no policies match,
                    the system defaults to its base security configuration.
                </p>
            </div>
        </div>
    );
}
