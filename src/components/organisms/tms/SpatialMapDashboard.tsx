'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Box, Paper, Group, Text, Title, Badge, Stack, Button, LoadingOverlay, Divider, ActionIcon, Tooltip as MantineTooltip } from '@mantine/core';
import { Map as MapIcon, Maximize2, Layers, MapPin, Building2, Info, ChevronLeft, Map as MapUiIcon } from 'lucide-react';
import { useMap } from 'react-leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then(mod => mod.Polygon), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(mod => mod.Tooltip), { ssr: false });

// Helper to handle map manipulation
const MapController = ({ center, zoom, bounds }: { center?: [number, number], zoom?: number, bounds?: any }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], animate: true });
        } else if (center && zoom) {
            map.setView(center, zoom, { animate: true });
        }
    }, [center, zoom, bounds, map]);
    return null;
};

interface SpatialMapDashboardProps {
    data: any[];
    onResourceClick?: (resource: any) => void;
}

export const SpatialMapDashboard = ({ data, onResourceClick }: SpatialMapDashboardProps) => {
    const [isClient, setIsClient] = useState(false);
    const [leaflet, setLeaflet] = useState<any>(null);
    const [mapType, setMapType] = useState<'streets' | 'satellite'>('satellite');
    const [viewContext, setViewContext] = useState<{
        level: 'WORLD' | 'ZONE' | 'BLOCK';
        activeItem: any | null;
        prevContexts: any[];
    }>({
        level: 'WORLD',
        activeItem: null,
        prevContexts: []
    });

    const [mapFocus, setMapFocus] = useState<{ center?: [number, number], zoom?: number, bounds?: any }>({});

    useEffect(() => {
        setIsClient(true);
        import('leaflet').then((L) => {
            setLeaflet(L);
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });
        });
    }, []);

    if (!isClient || !leaflet) {
        return (
            <Box h={700} pos="relative" className="bg-gradient-to-br from-slate-50 via-white to-slate-50 rounded-3xl border-2 border-white shadow-2xl overflow-hidden">
                <LoadingOverlay visible overlayProps={{ blur: 3 }} zIndex={1000} />
            </Box>
        );
    }

    // STRICT IT PARK COMPOUND BOUNDS
    const center: [number, number] = [8.9690, 38.8405];
    const bounds: [number, number][] = [
        [8.960, 38.832],
        [8.978, 38.848]
    ];

    // Flatten data but respect hierarchy for navigation
    const getVisibleMembers = () => {
        if (viewContext.level === 'WORLD') {
            return data.filter(item => (item.gpsLat && item.gpsLng) || item.gpsPolygon);
        }
        if (viewContext.activeItem) {
            const children = viewContext.activeItem.children?.filter((item: any) => (item.gpsLat && item.gpsLng) || item.gpsPolygon) || [];
            // Include parent for contextual boundary
            return [viewContext.activeItem, ...children];
        }
        return [];
    };

    const members = getVisibleMembers();

    // Global Stats (Keep them global for the Hub)
    const flattenAll = (items: any[]) => {
        let res: any[] = [];
        items.forEach(i => {
            res.push(i);
            if (i.children) res.push(...flattenAll(i.children));
        });
        return res;
    };
    const allResources = flattenAll(data);

    // Calculate comprehensive executive analytics
    const zones = allResources.filter(m => m.type === 'ZONE');
    const blocks = allResources.filter(m => m.type === 'BLOCK');
    const plots = allResources.filter(m => m.type === 'PLOT');
    const buildings = allResources.filter(m => m.type === 'BUILDING');

    const totalPlotArea = plots.reduce((acc, m) => acc + Number(m.area || 0), 0);
    const vacantPlotArea = plots.filter(p => !p.occupantName).reduce((acc, m) => acc + Number(m.area || 0), 0);
    const occupiedPlotArea = totalPlotArea - vacantPlotArea;

    const vacantPlots = plots.filter(p => !p.occupantName).length;
    const occupiedPlots = plots.length - vacantPlots;

    const stats = {
        zoneCount: zones.length,
        blockCount: blocks.length,
        plotCount: plots.length,
        buildingCount: buildings.length,
        totalArea: totalPlotArea,
        vacantArea: vacantPlotArea,
        occupiedArea: occupiedPlotArea,
        plotUtilization: plots.length > 0 ? (occupiedPlots / plots.length) * 100 : 0,
        areaOccupancy: totalPlotArea > 0 ? (occupiedPlotArea / totalPlotArea) * 100 : 0,
        vacantPlots,
        occupiedPlots,
    };

    // Parse polygon string
    const parsePolygon = (polyStr: string) => {
        try {
            const coords = JSON.parse(polyStr);
            return coords as [number, number][];
        } catch (e) {
            return null;
        }
    };

    // VIBRANT EXECUTIVE COLOR PALETTE
    const getPolygonStyle = (item: any) => {
        const isVacant = !item.occupantName;
        const isActiveParent = viewContext.activeItem?.id === item.id;

        // If it's a parent context, make it very subtle
        if (isActiveParent) {
            return {
                color: '#64748b',
                fillColor: 'transparent',
                fillOpacity: 0,
                weight: 1.5,
                dashArray: '10, 10'
            };
        }

        switch (item.type) {
            case 'ZONE':
                return {
                    color: '#f59e0b', // Amber/Gold
                    fillColor: '#fbbf24',
                    fillOpacity: 0.08,
                    weight: 2
                };
            case 'BLOCK':
                return {
                    color: '#0891b2', // Cyan/Teal
                    fillColor: '#22d3ee',
                    fillOpacity: 0.12,
                    weight: 2
                };
            case 'PLOT':
                return {
                    color: isVacant ? '#10b981' : '#8b5cf6', // Emerald / Violet
                    fillColor: isVacant ? '#10b981' : '#8b5cf6',
                    fillOpacity: 0.45,
                    weight: 2
                };
            default:
                return {
                    color: '#94a3b8',
                    fillColor: '#cbd5e1',
                    fillOpacity: 0.1,
                    weight: 1
                };
        }
    };

    const getStatusBadgeColor = (item: any) => {
        const isVacant = !item.occupantName;
        if (item.type === 'ZONE') return 'gray';
        if (item.type === 'BLOCK') return 'indigo';
        if (item.type === 'PLOT') return isVacant ? 'teal' : 'violet';
        return 'gray';
    };

    return (
        <Paper
            radius="2rem"
            shadow="2xl"
            className="overflow-hidden border-2 border-white/40 bg-slate-50"
            style={{ height: '700px', position: 'relative' }}
        >
            {/* MODERN EXECUTIVE DASHBOARD (COMPACT) */}
            <Box pos="absolute" top={16} left={16} style={{ zIndex: 1000, pointerEvents: 'none' }}>
                <Paper
                    p="md"
                    radius="1.5rem"
                    shadow="xl"
                    className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                    style={{ pointerEvents: 'auto', width: '330px' }}
                >
                    <Stack gap="sm">
                        {viewContext.level !== 'WORLD' && (
                            <Group gap={8} mb={-4}>
                                <ActionIcon
                                    variant="light"
                                    color="slate"
                                    radius="xl"
                                    size="sm"
                                    onClick={() => {
                                        const prev = viewContext.prevContexts.pop();
                                        setViewContext({
                                            level: prev?.level || 'WORLD',
                                            activeItem: prev?.activeItem || null,
                                            prevContexts: [...viewContext.prevContexts]
                                        });
                                        // Reset to default park view
                                        setMapFocus({ center: [8.9690, 38.8405], zoom: 17 });
                                    }}
                                >
                                    <ChevronLeft size={14} />
                                </ActionIcon>
                                <Text size="10px" fw={900} c="amber.7" tt="uppercase">Back to {viewContext.level === 'BLOCK' ? 'Zone' : 'Global View'}</Text>
                            </Group>
                        )}
                        <Group justify="space-between" align="center">
                            <Stack gap={2}>
                                <Text size="10px" fw={900} c="dimmed" tt="uppercase" lts={1.5} className="opacity-60">Intelligence Hub</Text>
                                <Title
                                    order={4}
                                    fw={900}
                                    style={{ letterSpacing: '-0.5px' }}
                                    className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent"
                                >
                                    {viewContext.activeItem ? viewContext.activeItem.name : 'IT Park Overall'}
                                </Title>
                            </Stack>
                            <Badge
                                variant="light"
                                color="teal"
                                size="sm"
                                radius="sm"
                                className="animate-pulse"
                            >
                                LIVE
                            </Badge>
                        </Group>

                        {/* COMPACT METRIC GRID */}
                        <div className="grid grid-cols-2 gap-2">
                            <Paper p="xs" radius="lg" className="bg-slate-50/50 border border-slate-100 hover:bg-white transition-all cursor-default">
                                <Stack gap={2}>
                                    <Text size="9px" fw={800} c="dimmed" tt="uppercase">Zones</Text>
                                    <Text size="lg" fw={900} c="slate.8">{stats.zoneCount}</Text>
                                </Stack>
                            </Paper>
                            <Paper p="xs" radius="lg" className="bg-indigo-50/30 border border-indigo-100/50 hover:bg-white transition-all cursor-default">
                                <Stack gap={2}>
                                    <Text size="9px" fw={800} c="indigo.6" tt="uppercase">Buildings</Text>
                                    <Text size="lg" fw={900} c="indigo.8">{stats.buildingCount}</Text>
                                </Stack>
                            </Paper>
                            <Paper p="xs" radius="lg" className="bg-violet-50/30 border border-violet-100/50 hover:bg-white transition-all cursor-default">
                                <Stack gap={2}>
                                    <Text size="9px" fw={800} c="violet.6" tt="uppercase">Utilization</Text>
                                    <Text size="lg" fw={900} c="violet.8">{stats.plotUtilization.toFixed(0)}%</Text>
                                </Stack>
                            </Paper>
                            <Paper p="xs" radius="lg" className="bg-teal-50/30 border border-teal-100/50 hover:bg-white transition-all cursor-default">
                                <Stack gap={2}>
                                    <Text size="9px" fw={800} c="teal.6" tt="uppercase">Free Space</Text>
                                    <Text size="lg" fw={900} c="teal.8">{stats.vacantPlots}</Text>
                                </Stack>
                            </Paper>
                        </div>

                        <Divider opacity={0.3} />

                        {/* SECONDARY METRICS */}
                        <Stack gap={4}>
                            <Group justify="space-between">
                                <Text size="10px" fw={800} c="dimmed">Occupied Area</Text>
                                <Text size="11px" fw={900} c="slate.7">{stats.occupiedArea.toLocaleString()} m²</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="10px" fw={800} c="dimmed">Total Land</Text>
                                <Text size="11px" fw={900} c="slate.7">{stats.totalArea.toLocaleString()} m²</Text>
                            </Group>
                            <Stack gap={4} mt={4}>
                                <div className="flex justify-between items-baseline">
                                    <Text size="9px" fw={900} c="dimmed" tt="uppercase">Occupancy Rate</Text>
                                    <Text size="11px" fw={900} c="indigo.7">{stats.areaOccupancy.toFixed(1)}%</Text>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 via-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.areaOccupancy}%` }}
                                    />
                                </div>
                            </Stack>
                        </Stack>

                        {/* INTEGRATED MINI LEGEND */}
                        <Divider opacity={0.3} />
                        <Group gap="xs">
                            <Group gap={4}>
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <Text size="9px" fw={800} c="dimmed">Zones</Text>
                            </Group>
                            <Group gap={4}>
                                <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                <Text size="9px" fw={800} c="dimmed">Blocks</Text>
                            </Group>
                            <Group gap={4}>
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <Text size="9px" fw={800} c="dimmed">Plots</Text>
                            </Group>
                        </Group>
                    </Stack>
                </Paper>
            </Box>

            {/* MINIMAL MAP CONTROLS */}
            <Box pos="absolute" bottom={16} right={16} style={{ zIndex: 1000, pointerEvents: 'none' }}>
                <Paper p={4} radius="xl" shadow="md" className="bg-white/80 backdrop-blur-md border border-white/50" style={{ pointerEvents: 'auto' }}>
                    <Button.Group>
                        <Button
                            variant={mapType === 'streets' ? 'filled' : 'subtle'}
                            size="compact-xs"
                            radius="xl"
                            onClick={() => setMapType('streets')}
                            color="slate"
                            styles={{ root: { fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' } }}
                        >
                            Map
                        </Button>
                        <Button
                            variant={mapType === 'satellite' ? 'filled' : 'subtle'}
                            size="compact-xs"
                            radius="xl"
                            onClick={() => setMapType('satellite')}
                            color="indigo"
                            styles={{ root: { fontSize: '9px', fontWeight: 900, textTransform: 'uppercase' } }}
                        >
                            Satellite
                        </Button>
                    </Button.Group>
                </Paper>
            </Box>

            {/* LEAFLET MAP */}
            <MapContainer
                center={center}
                zoom={17}
                maxBounds={bounds}
                style={{ height: '100%', width: '100%', borderRadius: '24px' }}
                zoomControl={false}
            >
                <MapController {...mapFocus} />
                {mapType === 'streets' ? (
                    <TileLayer
                        attribution='&copy; CARTO'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                ) : (
                    <TileLayer
                        attribution='&copy; Esri'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                )}

                {members.map((item: any) => {
                    const isPolygon = !!item.gpsPolygon;
                    const polygonCoords = isPolygon ? parsePolygon(item.gpsPolygon) : null;
                    const isVacant = !item.occupantName;

                    // Render Polygons
                    if (isPolygon && polygonCoords) {
                        const style = getPolygonStyle(item);
                        return (
                            <Polygon
                                key={`poly-${item.id}`}
                                positions={polygonCoords}
                                pathOptions={style}
                                eventHandlers={{
                                    click: (e) => {
                                        if (item.type === 'ZONE' || item.type === 'BLOCK') {
                                            // Drill Down
                                            setViewContext({
                                                level: item.type === 'ZONE' ? 'ZONE' : 'BLOCK',
                                                activeItem: item,
                                                prevContexts: [...viewContext.prevContexts, { level: viewContext.level, activeItem: viewContext.activeItem }]
                                            });
                                            // Calculate bounds to zoom
                                            if (e.target.getBounds) {
                                                setMapFocus({ bounds: e.target.getBounds() });
                                            }
                                        } else {
                                            onResourceClick?.(item);
                                        }
                                    }
                                }}
                            >
                                <Tooltip sticky>
                                    <Stack gap={4} p={4}>
                                        <Group gap={8}>
                                            <Badge size="xs" color={getStatusBadgeColor(item)} variant="filled">
                                                {item.type}
                                            </Badge>
                                            {!isVacant && item.type !== 'ZONE' && (
                                                <Badge size="xs" color="violet" variant="light">OCCUPIED</Badge>
                                            )}
                                            {isVacant && item.type !== 'ZONE' && (
                                                <Badge size="xs" color="teal" variant="light">FREE</Badge>
                                            )}
                                        </Group>
                                        <Text fw={900} size="sm">{item.name}</Text>
                                        {item.area && (
                                            <Text size="xs" c="dimmed">{Number(item.area).toLocaleString()} m²</Text>
                                        )}
                                        {!isVacant && item.occupantName && (
                                            <Text size="xs" fw={700} c="indigo">{item.occupantName}</Text>
                                        )}
                                    </Stack>
                                </Tooltip>
                            </Polygon>
                        );
                    }

                    // Render Building Markers
                    if (item.gpsLat && item.gpsLng && !isPolygon && item.type === 'BUILDING') {
                        const customIcon = leaflet.divIcon({
                            className: 'custom-div-icon',
                            html: `<div class="marker-pin building ${isVacant ? 'vacant' : ''}">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/></svg>
                                   </div>`,
                            iconSize: [32, 32],
                            iconAnchor: [16, 32]
                        });

                        return (
                            <Marker
                                key={`marker-${item.id}`}
                                position={[item.gpsLat, item.gpsLng]}
                                icon={customIcon}
                                eventHandlers={{ click: () => onResourceClick?.(item) }}
                            >
                                <Popup>
                                    <Stack gap={8}>
                                        <Group justify="space-between">
                                            <Title order={6}>{item.name}</Title>
                                            <Badge size="xs" color={isVacant ? 'teal' : 'indigo'}>
                                                {isVacant ? 'FREE' : 'OCCUPIED'}
                                            </Badge>
                                        </Group>
                                        <Text size="xs" c="dimmed">{item.code}</Text>
                                        {item.area && (
                                            <Text size="xs" fw={700}>{Number(item.area).toLocaleString()} m²</Text>
                                        )}
                                        {!isVacant && (
                                            <Text size="xs" fw={800} c="indigo">{item.occupantName}</Text>
                                        )}
                                    </Stack>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </Paper>
    );
};
