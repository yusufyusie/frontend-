'use client';

import { useEffect, useState } from 'react';
import { settingsService, type Configuration, type FeatureFlag } from '@/services/settings.service';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/components/Toast';
import { PermissionGate } from '@/components/PermissionGate';
import { Switch, NumberInput, TextInput, Textarea, Tooltip, ActionIcon, Group as MantineGroup, Stack as MantineStack, Text as MantineText, Paper as MantinePaper, Badge } from '@mantine/core';

import { SecurityPolicyEditor } from '@/components/settings/SecurityPolicyEditor';
import { PolicyEditor } from '@/components/settings/PolicyEditor';
import { ExchangeRateEditor } from '@/components/settings/ExchangeRateEditor';

import { Settings, Shield, ShieldCheck, Flag, Palette, RefreshCcw, Coins } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'security' | 'access' | 'features' | 'ui' | 'exchange'>('general');
    const [configs, setConfigs] = useState<Configuration[]>([]);
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [securityPolicy, setSecurityPolicy] = useState<any>(null);
    const [uiCustomizations, setUiCustomizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    /**
     * Synchronize all settings from backend data sources
     */
    const fetchData = async () => {
        try {
            setLoading(true);
            const [configData, flagData, securityData, uiData] = await Promise.all([
                settingsService.getConfigurations(),
                settingsService.getFeatureFlags(),
                settingsService.getSecurityPolicies(),
                settingsService.getUICustomizations(),
            ]);
            setConfigs(configData as any);
            setFlags(flagData);
            setSecurityPolicy(securityData[0]);
            setUiCustomizations(uiData);
        } catch (error: any) {
            toast.error('Failed to load settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Persist configuration changes
     */
    const handleUpdateConfig = async (key: string, value: any) => {
        try {
            setSaving(key);
            await settingsService.updateConfiguration(key, value);
            toast.success('Configuration updated');
            fetchData();
        } catch (error: any) {
            toast.error('Update failed: ' + error.message);
        } finally {
            setSaving(null);
        }
    };

    /**
     * Toggle feature flag state
     */
    const handleToggleFlag = async (flag: FeatureFlag) => {
        try {
            setSaving(`flag-${flag.id}`);
            await settingsService.toggleFeatureFlag(flag.id, !flag.enabled);
            toast.success(`${flag.name} ${!flag.enabled ? 'enabled' : 'disabled'}`);
            fetchData();
        } catch (error: any) {
            toast.error('Action failed: ' + error.message);
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">System Settings</h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Configure global parameters, security policies, and dynamic access controls.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="btn btn-secondary btn-sm flex items-center gap-2">
                        <RefreshCcw className="w-4 h-4" />
                        <span>Refresh Sync</span>
                    </button>
                </div>
            </header>

            <nav className="flex gap-2 border-b border-gray-100 overflow-x-auto pb-px scrollbar-hide">
                {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'security', label: 'Security', icon: Shield },
                    { id: 'access', label: 'Access', icon: ShieldCheck },
                    { id: 'features', label: 'Features', icon: Flag },
                    { id: 'ui', label: 'Theme', icon: Palette },
                    { id: 'exchange', label: 'Exchange Rates', icon: Coins },
                ].map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 md:px-6 py-3 font-semibold transition-all border-b-2 -mb-px whitespace-nowrap ${activeTab === tab.id
                                ? 'border-primary text-primary bg-primary/5'
                                : 'border-transparent text-gray-400 hover:text-primary hover:bg-gray-50'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm md:text-base">{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            <main className="min-h-[500px]">
                {activeTab === 'general' && (
                    <div className="grid gap-6">
                        {Object.entries(configs).map(([category, items]: [string, any]) => (
                            <div key={category} className="card overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{category}</h3>
                                </div>
                                <div className="divide-y divide-gray-50 px-6">
                                    {items.map((cfg: Configuration) => (
                                        <ConfigItem
                                            key={cfg.key}
                                            cfg={cfg}
                                            onUpdate={handleUpdateConfig}
                                            isSaving={saving === cfg.key}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="card p-8">
                        {securityPolicy ? (
                            <SecurityPolicyEditor
                                policy={securityPolicy}
                                onUpdate={fetchData}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-20 text-gray-500 italic">
                                <span>No security policy records found in database.</span>
                                <button className="mt-4 text-primary font-bold hover:underline" onClick={fetchData}>Retry Sync</button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'access' && (
                    <PolicyEditor />
                )}

                {activeTab === 'features' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {flags.map(flag => (
                            <div key={flag.id} className="card p-6 flex flex-col justify-between transition-all hover:shadow-lg border-t-4 border-t-transparent hover:border-t-primary">
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">{flag.name}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{flag.description}</p>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${flag.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {flag.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleFlag(flag)}
                                        disabled={saving === `flag-${flag.id}`}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${flag.enabled ? 'bg-primary' : 'bg-gray-200'
                                            }`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'ui' && (
                    <div className="card p-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {uiCustomizations.map(item => (
                                <div key={item.key} className="space-y-3 p-4 bg-gray-50/30 rounded-xl border border-gray-100/50">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.key.replace(/\./g, ' ')}</label>
                                        <span className="text-sm font-semibold text-gray-700">{item.description}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type={item.type === 'color' ? 'color' : (item.type === 'number' ? 'number' : 'text')}
                                            defaultValue={item.value}
                                            onBlur={(e) => handleUpdateConfig(item.key, e.target.value)}
                                            className={`flex-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm ${item.type === 'color' ? 'h-10 p-1 cursor-pointer' : ''}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'exchange' && (
                    <ExchangeRateEditor />
                )}
            </main>
        </div>
    );
}

function ConfigItem({ cfg, onUpdate, isSaving }: { cfg: Configuration, onUpdate: (k: string, v: any) => void, isSaving: boolean }) {
    const [val, setVal] = useState(cfg.value);

    const inputStyles = {
        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
        input: { borderRadius: '12px', borderColor: '#F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700 }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 group hover:bg-slate-50/50 px-4 -mx-4 rounded-2xl transition-all">
            <div className="flex-1">
                <MantineGroup gap="xs">
                    <label className="block text-sm font-black text-[#16284F] tracking-tight">{cfg.key}</label>
                    {!cfg.isEditable && (
                        <Badge size="xs" color="gray" variant="light" radius="sm">Read Only</Badge>
                    )}
                </MantineGroup>
                <p className="text-xs font-bold text-slate-500 mt-0.5 leading-relaxed">{cfg.description}</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                {cfg.type === 'boolean' ? (
                    <Switch
                        checked={val === true || val === 'true'}
                        onChange={(event) => {
                            const next = event.currentTarget.checked;
                            setVal(next);
                            onUpdate(cfg.key, next);
                        }}
                        disabled={!cfg.isEditable || isSaving}
                        color="#0C7C92"
                        size="md"
                        thumbIcon={isSaving ? <LoadingSpinner size="sm" /> : undefined}
                    />
                ) : cfg.type === 'number' ? (
                    <NumberInput
                        value={Number(val)}
                        onChange={(v) => setVal(v)}
                        onBlur={() => onUpdate(cfg.key, val)}
                        disabled={!cfg.isEditable || isSaving}
                        size="md"
                        radius="xl"
                        className="w-full md:w-32"
                        styles={inputStyles}
                        decimalScale={cfg.key.toLowerCase().includes('rate') ? 4 : 2}
                    />
                ) : cfg.type === 'json' ? (
                    <Textarea
                        value={typeof val === 'object' ? JSON.stringify(val, null, 2) : val}
                        onChange={(e) => setVal(e.target.value)}
                        onBlur={() => {
                            try {
                                const parsed = JSON.parse(val);
                                onUpdate(cfg.key, parsed);
                            } catch (e) {
                                toast.error('Invalid JSON format');
                            }
                        }}
                        disabled={!cfg.isEditable || isSaving}
                        size="sm"
                        radius="md"
                        autosize
                        minRows={2}
                        className="w-full md:w-64"
                        styles={inputStyles}
                    />
                ) : (
                    <TextInput
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        onBlur={() => onUpdate(cfg.key, val)}
                        disabled={!cfg.isEditable || isSaving}
                        size="md"
                        radius="xl"
                        className="w-full md:w-48"
                        styles={inputStyles}
                    />
                )}

                {isSaving && cfg.type !== 'boolean' && (
                    <div className="animate-spin text-[#0C7C92]"><RefreshCcw size={16} /></div>
                )}
            </div>
        </div>
    );
}

function PolicyRow({ label, value, type = 'text' }: { label: string, value: any, type?: 'text' | 'bool' }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
            <span className="text-sm font-medium text-gray-600">{label}</span>
            {type === 'bool' ? (
                <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
                    {value ? 'Required' : 'Optional'}
                </span>
            ) : (
                <span className="font-mono text-sm text-primary bg-primary/5 px-2 py-1 rounded">{value}</span>
            )}
        </div>
    );
}
