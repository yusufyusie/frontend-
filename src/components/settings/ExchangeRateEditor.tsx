'use client';

import { useState, useEffect } from 'react';
import { financialsService, type ExchangeRate } from '@/services/financials.service';
import { Group, Stack, Text, Button, Badge, Paper, NumberInput, TextInput, Table, ScrollArea, Title } from '@mantine/core';
import { Save, Plus, Coins, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/components/Toast';

export function ExchangeRateEditor() {
    const [rates, setRates] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newRate, setNewRate] = useState({
        rate: 55,
        validFrom: new Date().toISOString().split('T')[0],
        fromCurrency: 'USD',
        toCurrency: 'ETB'
    });

    useEffect(() => {
        loadRates();
    }, []);

    const loadRates = async () => {
        try {
            setLoading(true);
            const res: any = await financialsService.getExchangeRates();
            setRates(res.data || res || []);
        } catch (error) {
            toast.error('Failed to load exchange rates');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRate = async () => {
        try {
            setSaving(true);
            await financialsService.createExchangeRate(newRate);
            toast.success('New exchange rate activated');
            loadRates();
        } catch (error) {
            toast.error('Failed to create rate');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Stack gap="xl">
            <Paper p="xl" radius="2rem" className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                <Group justify="space-between" mb="xl">
                    <Stack gap={0}>
                        <Group gap="xs">
                            <Coins size={20} className="text-[#0C7C92]" />
                            <Text size="sm" fw={900} className="text-[#16284F] uppercase tracking-widest">Active Rate Configuration</Text>
                        </Group>
                        <Text size="xs" c="dimmed" fw={600}>Set the current USD to ETB variation for financial calculations</Text>
                    </Stack>
                </Group>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <TextInput
                        label="From Currency"
                        value={newRate.fromCurrency}
                        disabled
                        radius="xl"
                        size="md"
                        styles={{ label: { fontWeight: 900, marginBottom: 8 } }}
                    />
                    <TextInput
                        label="To Currency"
                        value={newRate.toCurrency}
                        disabled
                        radius="xl"
                        size="md"
                        styles={{ label: { fontWeight: 900, marginBottom: 8 } }}
                    />
                    <NumberInput
                        label="Rate (1 USD = ? ETB)"
                        value={newRate.rate}
                        onChange={(val) => setNewRate({ ...newRate, rate: Number(val) || 0 })}
                        radius="xl"
                        size="md"
                        decimalScale={4}
                        styles={{ label: { fontWeight: 900, marginBottom: 8 } }}
                    />
                    <Button
                        onClick={handleCreateRate}
                        loading={saving}
                        bg="#0C7C92"
                        radius="xl"
                        size="md"
                        leftSection={<Save size={18} />}
                        className="shadow-lg shadow-teal-100"
                    >
                        Activate New Rate
                    </Button>
                </div>
            </Paper>

            <Paper p="xl" radius="2rem" className="bg-slate-50/50 border border-slate-100 min-h-[400px]">
                <Title order={4} mb="lg" className="text-[#16284F] font-black tracking-tight flex items-center gap-2">
                    <Clock size={20} />
                    Historical Variation Log
                </Title>

                <ScrollArea h={350}>
                    <Table verticalSpacing="md">
                        <thead>
                            <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-white">
                                <th className="rounded-l-xl">Status</th>
                                <th>Variation Rate</th>
                                <th>Effective Date</th>
                                <th>Terminated Date</th>
                                <th className="text-right rounded-r-xl">Ref ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((rate) => (
                                <tr key={rate.id} className="hover:bg-white transition-colors">
                                    <td>
                                        {rate.isActive ? (
                                            <Badge color="teal" variant="light" size="sm" radius="sm" fw={900} leftSection={<CheckCircle2 size={10} />}>Active</Badge>
                                        ) : (
                                            <Badge color="gray" variant="light" size="sm" radius="sm" fw={900} leftSection={<XCircle size={10} />}>Archived</Badge>
                                        )}
                                    </td>
                                    <td>
                                        <Text fw={900} className="text-[#16284F] tabular-nums">
                                            1 {rate.fromCurrency} = {rate.rate} {rate.toCurrency}
                                        </Text>
                                    </td>
                                    <td>
                                        <Text size="sm" fw={700} className="text-slate-600">
                                            {new Date(rate.validFrom).toLocaleDateString()}
                                        </Text>
                                    </td>
                                    <td>
                                        <Text size="sm" fw={700} className="text-slate-400">
                                            {rate.validTo ? new Date(rate.validTo).toLocaleDateString() : '—'}
                                        </Text>
                                    </td>
                                    <td className="text-right">
                                        <Text size="xs" fw={800} className="font-mono text-slate-400">#ER-{rate.id}</Text>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ScrollArea>
            </Paper>
        </Stack>
    );
}
