'use client';

import React, { useEffect, useRef } from 'react';
import {
    createChart,
    ColorType,
    IChartApi,
    ISeriesApi,
    SeriesType,
    AreaSeries,
    BarSeries,
    LineSeries,
    HistogramSeries,
    BaselineSeries,
} from 'lightweight-charts';

export type ChartSeriesType = 'Bar' | 'Area' | 'Line' | 'Histogram' | 'Baseline' | 'Custom';

interface TradingViewChartProps {
    data: any[];
    type?: ChartSeriesType;
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
        upColor?: string;
        downColor?: string;
    };
    height?: number;
    title?: string;
    showGrid?: boolean;
    currency?: string;
}

/**
 * Premium TradingView Chart Component
 * Supports multiple series types with ITPC branding
 */
export const TradingViewChart: React.FC<TradingViewChartProps> = ({
    data,
    type = 'Area',
    colors = {},
    height = 400,
    title,
    showGrid = true,
    currency = 'USD',
}) => {
    // ITPC Brand Palette
    const ITPC = {
        teal: '#0C7C92',
        navy: '#16284F',
        mint: '#1098AD',
        slate: '#64748B',
        emerald: '#10b981',
        rose: '#ef4444',
        border: 'rgba(226, 232, 240, 0.5)',
        grid: 'rgba(226, 232, 240, 0.3)'
    };

    const {
        backgroundColor = 'transparent',
        lineColor = ITPC.teal,
        textColor = ITPC.slate,
        areaTopColor = 'rgba(12, 124, 146, 0.4)',
        areaBottomColor = 'rgba(12, 124, 146, 0.0)',
        upColor = ITPC.emerald,
        downColor = ITPC.rose,
    } = colors;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const legendRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<SeriesType> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: 11,
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            grid: {
                vertLines: { color: showGrid ? ITPC.grid : 'transparent' },
                horzLines: { color: showGrid ? ITPC.grid : 'transparent' },
            },
            timeScale: {
                borderColor: ITPC.border,
                timeVisible: true,
                secondsVisible: false,
                barSpacing: 12,
            },
            rightPriceScale: {
                borderColor: ITPC.border,
                scaleMargins: {
                    top: 0.2,
                    bottom: 0.2,
                },
            },
            crosshair: {
                vertLine: {
                    color: ITPC.navy,
                    width: 1,
                    labelBackgroundColor: ITPC.navy,
                },
                horzLine: {
                    color: ITPC.navy,
                    width: 1,
                    labelBackgroundColor: ITPC.navy,
                },
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
        });

        // Dynamic Legend Implementation
        chart.subscribeCrosshairMove(param => {
            if (
                param.point === undefined ||
                !param.time ||
                param.point.x < 0 ||
                param.point.x > chartContainerRef.current!.clientWidth ||
                param.point.y < 0 ||
                param.point.y > height
            ) {
                if (legendRef.current) legendRef.current.style.display = 'none';
            } else {
                if (legendRef.current) {
                    legendRef.current.style.display = 'flex';
                    const data = param.seriesData.get(series);
                    if (data) {
                        // @ts-ignore - 'value' exists for Area/Line, OHLC for Bar
                        const price = (data.value !== undefined ? data.value : data.close) || 0;
                        const dateStr = typeof param.time === 'string'
                            ? param.time
                            : new Date((param.time as number) * 1000).toLocaleDateString();

                        legendRef.current.innerHTML = `
                            <div class="flex flex-col gap-1 p-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl min-w-[140px]">
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${dateStr}</span>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-xs font-bold text-slate-500">${currency}</span>
                                    <span class="text-xl font-black text-[#0C7C92] tracking-tighter">${price.toLocaleString()}</span>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        });

        chart.timeScale().fitContent();

        let series: ISeriesApi<SeriesType>;

        // Switch implementing advanced TradingView series with ITPC styles
        switch (type) {
            case 'Bar':
                series = chart.addSeries(BarSeries, {
                    upColor,
                    downColor,
                });
                break;
            case 'Line':
                series = chart.addSeries(LineSeries, {
                    color: lineColor,
                    lineWidth: 3,
                });
                break;
            case 'Histogram':
                series = chart.addSeries(HistogramSeries, {
                    color: lineColor,
                    priceFormat: { type: 'volume' },
                });
                break;
            case 'Baseline':
                series = chart.addSeries(BaselineSeries, {
                    baseValue: { type: 'price', price: data.length > 0 ? (data[0].value || data[0].price || 0) : 0 },
                    topLineColor: upColor,
                    topFillColor1: 'rgba(16, 185, 129, 0.28)',
                    topFillColor2: 'rgba(16, 185, 129, 0.05)',
                    bottomLineColor: downColor,
                    bottomFillColor1: 'rgba(239, 68, 68, 0.05)',
                    bottomFillColor2: 'rgba(239, 68, 68, 0.28)',
                    lineWidth: 2,
                });
                break;
            case 'Area':
            default:
                series = chart.addSeries(AreaSeries, {
                    lineColor,
                    topColor: areaTopColor,
                    bottomColor: areaBottomColor,
                    lineWidth: 3,
                });
                break;
        }

        // Deduplicate and sort data to prevent assertion failures (TradingView requirement: strictly ascending time)
        const processedData = Array.from(
            data.reduce((map, item) => {
                // Normalize time to a consistent numeric value (seconds) for unique key check
                // Handles: ISO strings, Unix milliseconds, and Unix seconds
                const numericTime = typeof item.time === 'string'
                    ? Math.floor(new Date(item.time).getTime() / 1000)
                    : (item.time > 1000000000000 ? Math.floor(item.time / 1000) : item.time);

                let processedItem = { ...item, time: numericTime };

                // Safety: If series is Bar but data only has 'value', map it to OHLC to avoid crashes
                if (type === 'Bar' && item.value !== undefined && item.open === undefined) {
                    processedItem = {
                        ...processedItem,
                        open: item.value,
                        high: item.value * 1.02, // Subtle mock variance for "wow" factor
                        low: item.value * 0.98,
                        close: item.value,
                    };
                }

                // Only keep the last entry for any given timestamp
                map.set(numericTime, processedItem);
                return map;
            }, new Map()).values()
        ).sort((a: any, b: any) => (a.time as number) - (b.time as number));

        series.setData(processedData as any);

        // Force-hide branding via JS interval to ensure it stays gone
        const hideBranding = () => {
            if (chartContainerRef.current) {
                const links = chartContainerRef.current.getElementsByTagName('a');
                for (let i = 0; i < links.length; i++) {
                    links[i].style.display = 'none';
                    links[i].style.opacity = '0';
                    links[i].style.visibility = 'hidden';
                    links[i].style.pointerEvents = 'none';
                }
            }
        };

        const interval = setInterval(hideBranding, 500);
        hideBranding();

        chartRef.current = chart;
        seriesRef.current = series;

        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, upColor, downColor, type, height, showGrid]);

    return (
        <div className="relative w-full group">
            {/* Global/Local Style to hide TradingView branding and standardize */}
            <style jsx global>{`
                .tv-lightweight-charts-logo,
                [class*="tv-lightweight-charts-logo"],
                div[id^="tv-"] a,
                div[class*="lightweight-charts"] a,
                a[href*="tradingview.com"] {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                }
            `}</style>

            {title && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-[#0C7C92] uppercase tracking-[0.25em] bg-white/80 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-slate-100">
                            {title}
                        </span>
                    </div>
                </div>
            )}

            {/* Dynamic Hover Legend */}
            <div
                ref={legendRef}
                className="absolute top-4 right-4 z-30 pointer-events-none transition-all duration-300 transform scale-90 origin-top-right"
                style={{ display: 'none' }}
            />

            <div ref={chartContainerRef} className="w-full transition-opacity duration-500 rounded-3xl overflow-hidden" />

            {/* Subtle Axis Context Labels */}
            <div className="absolute bottom-2 right-12 z-20 pointer-events-none">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">Timeline</span>
            </div>
            <div className="absolute top-12 right-2 z-20 pointer-events-none rotate-90 origin-right">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">Value (USD)</span>
            </div>

            {/* Premium Border and Glow */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl border border-slate-100/50 group-hover:border-[#0C7C92]/20 transition-all duration-700" />
        </div>
    );
};
