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

        series.setData(data);

        chartRef.current = chart;
        seriesRef.current = series;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, upColor, downColor, type, height, showGrid]);

    return (
        <div className="relative w-full group">
            {title && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white/60 backdrop-blur-md px-2 py-0.5 rounded shadow-sm border border-slate-100">
                            {title}
                        </span>
                        <div className="h-0.5 w-8 bg-[#0C7C92] rounded-full" />
                    </div>
                </div>
            )}
            <div ref={chartContainerRef} className="w-full transition-opacity duration-500" />

            {/* Glossy Overlay effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    );
};
