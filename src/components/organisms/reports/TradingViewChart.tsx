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
    LineSeries
} from 'lightweight-charts';

interface TradingViewChartProps {
    data: any[];
    type?: 'area' | 'line' | 'bar';
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
    height?: number;
    title?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
    data,
    type = 'area',
    colors = {},
    height = 400,
    title
}) => {
    const {
        backgroundColor = 'transparent',
        lineColor = '#0C7C92',
        textColor = '#64748B',
        areaTopColor = 'rgba(12, 124, 146, 0.4)',
        areaBottomColor = 'rgba(12, 124, 146, 0.0)',
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
                fontFamily: 'Inter, sans-serif',
            },
            width: chartContainerRef.current.clientWidth,
            height: height,
            grid: {
                vertLines: { color: 'rgba(226, 232, 240, 0.4)' },
                horzLines: { color: 'rgba(226, 232, 240, 0.4)' },
            },
            timeScale: {
                borderColor: 'rgba(226, 232, 240, 0.8)',
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        chart.timeScale().fitContent();

        let series: ISeriesApi<SeriesType>;

        if (type === 'area') {
            series = chart.addSeries(AreaSeries, {
                lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
                lineWidth: 2,
            });
        } else if (type === 'bar') {
            series = chart.addSeries(BarSeries, {
                upColor: '#10b981',
                downColor: '#ef4444',
            });
        } else {
            series = chart.addSeries(LineSeries, {
                color: lineColor,
                lineWidth: 2,
            });
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
    }, [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor, type, height]);

    return (
        <div className="relative w-full">
            {title && (
                <div className="absolute top-4 left-4 z-10">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                        {title}
                    </span>
                </div>
            )}
            <div ref={chartContainerRef} className="w-full" />
        </div>
    );
};
