/**
 * React Hook for accessing system configuration values
 * 
 * Usage:
 * const { fiscalStartMonth, vatRate, loading } = useSystemConfig('fiscal', 'financial');
 */

import { useState, useEffect } from 'react';
import { systemConfigService } from '../services/system-config.service';

export function useSystemConfig(...categories: string[]) {
    const [configs, setConfigs] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadConfigs = async () => {
            setLoading(true);
            setError(null);

            try {
                const results = await Promise.all(
                    categories.map(category => systemConfigService.getByCategory(category))
                );

                const merged = results.reduce((acc: Record<string, any>, result: any, index: number) => {
                    const categoryData = result.data || result;
                    return { ...acc, ...categoryData };
                }, {});

                setConfigs(merged);
            } catch (err: any) {
                setError(err.message || 'Failed to load system configuration');
                console.error('useSystemConfig error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categories.length > 0) {
            loadConfigs();
        }
    }, [categories.join(',')]);

    return {
        ...configs,
        loading,
        error,
        refresh: () => {
            // Re-trigger useEffect
            setLoading(true);
        }
    };
}

/**
 * React Hook for accessing current exchange rate
 * 
 * Usage:
 * const { rate, loading } = useExchangeRate('USD', 'ETB');
 */

import { exchangeRateService } from '../services/exchange-rate.service';

export function useExchangeRate(fromCurrency: string = 'USD', toCurrency: string = 'ETB') {
    const [rate, setRate] = useState<number | null>(null);
    const [validFrom, setValidFrom] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadRate = async () => {
            setLoading(true);
            setError(null);

            try {
                const result = await exchangeRateService.getCurrent(fromCurrency, toCurrency);
                setRate(result.rate);
                setValidFrom(result.validFrom);
            } catch (err: any) {
                setError(err.message || 'Failed to load exchange rate');
                console.error('useExchangeRate error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadRate();
    }, [fromCurrency, toCurrency]);

    return {
        rate,
        validFrom,
        loading,
        error,
    };
}
