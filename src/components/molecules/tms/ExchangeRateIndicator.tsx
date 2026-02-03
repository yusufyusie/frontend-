'use client';

import { useState, useEffect } from 'react';
import { Badge, Text, Group, Tooltip, Skeleton } from '@mantine/core';
import { DollarSign, RefreshCw } from 'lucide-react';
import { exchangeRateService as exchangeRatesService, ExchangeRate } from '@/services/exchange-rate.service';

export function ExchangeRateIndicator() {
    const [rate, setRate] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRate = async () => {
        try {
            setLoading(true);
            const data = await exchangeRatesService.getLatest();
            setRate(data);
        } catch (error) {
            console.error('Failed to fetch exchange rate:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRate();
        // Refresh every hour
        const interval = setInterval(fetchRate, 3600000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !rate) {
        return <Skeleton width={140} height={32} radius="xl" />;
    }

    if (!rate) return null;

    return (
        <Tooltip label={`Official NBE Rate (Effective: ${new Date(rate.validFrom).toLocaleDateString()})`} position="bottom" withArrow>
            <Badge
                variant="light"
                color="teal"
                size="lg"
                radius="xl"
                className="bg-brand-mint/10 border-brand-mint/20 px-4 h-10 hover:scale-105 transition-transform cursor-help"
                leftSection={<DollarSign size={14} className="text-brand-teal" />}
            >
                <Group gap={4}>
                    <Text size="xs" fw={800} className="text-brand-navy font-primary">1 USD =</Text>
                    <Text size="sm" fw={900} className="text-brand-teal font-primary">{Number(rate.rate).toFixed(4)}</Text>
                    <Text size="xs" fw={800} className="text-brand-navy font-primary">ETB</Text>
                </Group>
            </Badge>
        </Tooltip>
    );
}
