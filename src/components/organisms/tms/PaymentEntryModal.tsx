'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Stack, TextInput, NumberInput, Textarea, Group, Text, Title, Select, Paper, Box, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { DollarSign, Calendar, CreditCard, Hash, FileText } from 'lucide-react';
import { leasesService } from '@/services/leases.service';
import { toast } from '@/components/Toast';

interface PaymentEntryModalProps {
    opened: boolean;
    onClose: () => void;
    leaseId: number;
    scheduleId?: number;
    amountDue?: number;
    period?: string; // e.g. "January 2026"
    onSuccess?: () => void;
}

export function PaymentEntryModal({ opened, onClose, leaseId, scheduleId, amountDue, period, onSuccess }: PaymentEntryModalProps) {
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<number | string>(amountDue || 0);
    const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
    const [reference, setReference] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        if (amountDue) setAmount(amountDue);
    }, [amountDue]);

    const handleSubmit = async () => {
        if (!paymentDate || !amount || !reference) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await leasesService.recordPayment(leaseId, {
                scheduleId,
                amount: Number(amount),
                paymentDate: paymentDate.toISOString(),
                reference,
                remarks
            });
            toast.success('Payment recorded successfully');
            onSuccess?.();
            onClose();
        } catch (e) {
            toast.error('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={
                <Stack gap={0}>
                    <Title order={3} className="text-brand-navy font-primary">Record Payment</Title>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts="1px">Form D: Financial Entry</Text>
                </Stack>
            }
            size="lg"
            radius="2rem"
            padding="xl"
        >
            <Stack gap="xl">
                {period && (
                    <Paper p="md" radius="lg" bg="blue.0" withBorder className="border-blue-100">
                        <Group justify="space-between">
                            <Stack gap={2}>
                                <Text size="xs" fw={900} c="blue.8" tt="uppercase">Billing Period</Text>
                                <Text fw={800} className="text-brand-navy">{period}</Text>
                            </Stack>
                            <Stack gap={2} ta="right">
                                <Text size="xs" fw={900} c="blue.8" tt="uppercase">Outstanding</Text>
                                <Text fw={900} className="text-brand-navy text-xl">${amountDue?.toLocaleString()}</Text>
                            </Stack>
                        </Group>
                    </Paper>
                )}

                <Stack gap="md">
                    <NumberInput
                        label="Payment Amount"
                        description="Actual amount received in transaction"
                        placeholder="0.00"
                        leftSection={<DollarSign size={16} />}
                        value={amount}
                        onChange={setAmount}
                        radius="md"
                        size="md"
                        styles={{ input: { fontWeight: 900 } }}
                        required
                    />

                    <Group grow>
                        <DateInput
                            label="Payment Date"
                            description="Date on bank slip / receipt"
                            value={paymentDate}
                            onChange={setPaymentDate}
                            radius="md"
                            size="md"
                            leftSection={<Calendar size={16} />}
                            required
                        />
                        <TextInput
                            label="Reference Number"
                            description="Bank Ref, Check #, or Receipt ID"
                            placeholder="TXN-XXXXXX"
                            value={reference}
                            onChange={(e) => setReference(e.currentTarget.value)}
                            radius="md"
                            size="md"
                            leftSection={<Hash size={16} />}
                            required
                        />
                    </Group>

                    <Textarea
                        label="Payment Remarks"
                        placeholder="Optional details about the transaction..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.currentTarget.value)}
                        radius="md"
                        minRows={3}
                    />
                </Stack>

                <Divider variant="dashed" />

                <Group grow>
                    <Button variant="subtle" radius="xl" size="lg" color="gray" onClick={onClose} className="font-bold">
                        Discard
                    </Button>
                    <Button
                        radius="xl"
                        size="lg"
                        bg="#16284F"
                        loading={loading}
                        onClick={handleSubmit}
                        leftSection={<CreditCard size={18} />}
                        className="shadow-xl font-bold"
                    >
                        Confirm Entry
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
