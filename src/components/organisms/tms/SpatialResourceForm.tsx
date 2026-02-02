import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Box, LoadingOverlay, Title, NumberInput, Paper, Text, Checkbox, Badge } from '@mantine/core';
import { Save, Map, Layers, MapPin, Building2, DoorOpen, HardDrive, Info } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';
import { AtomicLookupSelector } from '@/components/molecules/tms/AtomicLookupSelector';

interface Props {
    initialData?: Partial<any>;
    onSubmit: (data: Partial<any>) => Promise<void>;
    isLoading?: boolean;
    onValidityChange?: (isValid: boolean) => void;
}

export const SpatialResourceForm = ({ initialData, onSubmit, isLoading, onValidityChange }: Props) => {
    const [formData, setFormData] = useState<Partial<any>>({
        type: 'ZONE',
        code: '',
        name: '',
        isActive: true,
        ...initialData
    });

    // Sync form data when initialData changes (critical for modal reuse)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    // Unified Dynamic Lookups state
    const [lookups, setLookups] = useState<Record<string, SystemLookup[]>>({});
    const [catConfigs, setCatConfigs] = useState<Record<string, any>>({});

    useEffect(() => {
        const loadLookups = async () => {
            try {


                // 1. Fetch Discovery Registry (CAT_CONFIG) to get labels and categories dynamically
                const catRes = await lookupsService.getCategories();
                const allCats = (catRes as any).data || catRes || [];


                // Map configs for easy label access
                const configMap: Record<string, any> = {};
                allCats.forEach((c: any) => { configMap[c.value] = c; });
                setCatConfigs(configMap);


                // 2. Fetch data for all spatial categories registered in DB
                const spatialCodes = allCats
                    .filter((c: any) => c.isSpatial || c.metadata?.isSpatial)
                    .map((c: any) => c.value as string);



                const dataResults = await Promise.all(
                    spatialCodes.map((code: string) => lookupsService.getByCategory(code))
                );

                const lookupMap: Record<string, SystemLookup[]> = {};
                spatialCodes.forEach((code: string, idx: number) => {
                    const items = (dataResults[idx] as any).data || dataResults[idx] || [];
                    lookupMap[code] = items;

                });

                setLookups(lookupMap);

            } catch (error) {
                console.error('Error loading spatial lookups:', error);
            }
        };
        loadLookups();
    }, []);

    // Validation
    useEffect(() => {
        const isValid = Boolean(
            formData.type &&
            formData.code &&
            formData.name &&
            (formData.type !== 'BUILDING' || (formData.floors && formData.floors > 0)) &&
            (formData.type !== 'ROOM' || formData.area)
        );
        onValidityChange?.(isValid);
    }, [formData, onValidityChange]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const getEntityIcon = () => {
        switch (formData.type) {
            case 'ZONE': return <Map size={24} className="text-white" />;
            case 'BLOCK': return <Layers size={24} className="text-white" />;
            case 'PLOT': return <MapPin size={24} className="text-white" />;
            case 'BUILDING': return <Building2 size={24} className="text-white" />;
            case 'FLOOR': return <HardDrive size={24} className="text-white" />;
            case 'ROOM': return <DoorOpen size={24} className="text-white" />;
            default: return <Info size={24} className="text-white" />;
        }
    };

    const getEntityColor = () => {
        switch (formData.type) {
            case 'ZONE': return 'bg-emerald-600';
            case 'BLOCK': return 'bg-blue-600';
            case 'PLOT': return 'bg-teal-600';
            case 'BUILDING': return 'bg-violet-600';
            case 'FLOOR': return 'bg-amber-600';
            case 'ROOM': return 'bg-pink-600';
            default: return 'bg-slate-600';
        }
    };

    return (
        <Box pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1, color: '#F8FAFC' }} loaderProps={{ color: '#0C7C92', size: 'xl', type: 'bars' }} />
            <form id="spatial-form" onSubmit={handleSubmit} className="space-y-4">

                {/* Core Architecture Section */}
                <Paper withBorder p="md" radius="2rem" className="border-slate-100 bg-white shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F8FAFC] rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                    <Group gap="lg" mb="1.5rem" className="relative z-10">
                        <Box p={14} className={`${getEntityColor()} shadow-xl shadow-slate-200 transform -rotate-1 hover:rotate-0 transition-transform duration-300`} style={{ borderRadius: '1.25rem' }}>
                            {getEntityIcon()}
                        </Box>
                        <div className="flex-1">
                            <Group gap={6} mb={2}>
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                <Text size="10px" fw={900} className="text-slate-400 tracking-[0.2em] uppercase">Structural Identity</Text>
                            </Group>
                            <Title order={3} fw={900} lts="-1px" c="#16284F" className="text-2xl">
                                {formData.id ? 'Edit' : 'Register'} {formData.type === 'ZONE' ? 'Zone' :
                                    formData.type === 'BLOCK' ? 'Block' :
                                        formData.type === 'PLOT' ? 'Plot' :
                                            formData.type === 'BUILDING' ? 'Building' :
                                                formData.type === 'FLOOR' ? 'Floor' : 'Room'}
                            </Title>
                            <Text size="xs" c="dimmed" fw={700} className="mt-1 max-w-sm leading-relaxed">
                                {formData.parentName ? `Registering under ${formData.parentName}` : `Define essential attributes for the ${formData.type?.toLowerCase()}.`}
                            </Text>
                        </div>
                    </Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                        <TextInput
                            label={formData.type === 'ZONE' ? 'Zone Code' :
                                formData.type === 'BLOCK' ? 'Block Code' :
                                    formData.type === 'PLOT' ? 'Plot Code' :
                                        formData.type === 'BUILDING' ? 'Building Code' :
                                            formData.type === 'FLOOR' ? 'Floor Code' : 'Room Code'}
                            placeholder="e.g. F-100"
                            value={formData.code ?? ''}
                            onChange={(e) => setFormData({ ...formData, code: e.currentTarget.value })}
                            required
                            radius="xl"
                            size="md"
                            styles={{
                                label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
                                input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '48px', borderRadius: '16px', fontSize: '14px' }
                            }}
                        />

                        <TextInput
                            label={formData.type === 'ZONE' ? 'Zone Name' :
                                formData.type === 'BLOCK' ? 'Block Name' :
                                    formData.type === 'PLOT' ? 'Plot Name' :
                                        formData.type === 'BUILDING' ? 'Building Name' :
                                            formData.type === 'FLOOR' ? 'Floor Name' : 'Room Name'}
                            placeholder={`Enter ${formData.type?.toLowerCase()} name...`}
                            value={formData.name ?? ''}
                            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                            required
                            radius="xl"
                            size="md"
                            styles={{
                                label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
                                input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '48px', borderRadius: '16px', fontSize: '14px' }
                            }}
                        />

                        {/* Level-Specific Dynamic Lookups */}
                        {formData.type === 'ZONE' && (
                            <>
                                <AtomicLookupSelector
                                    label={catConfigs['ZONE_TYPES']?.label || 'Zone Type'}
                                    items={lookups['ZONE_TYPES'] || []}
                                    value={formData.zoneTypeId ?? null}
                                    onChange={(val) => setFormData({ ...formData, zoneTypeId: val })}
                                    variant="form"
                                />
                                <AtomicLookupSelector
                                    label={catConfigs['ZONE_STATUS']?.label || 'Operation Status'}
                                    items={lookups['ZONE_STATUS'] || []}
                                    value={formData.zoneStatusId ?? null}
                                    onChange={(val) => setFormData({ ...formData, zoneStatusId: val })}
                                    variant="form"
                                />
                            </>
                        )}

                        {formData.type === 'BLOCK' && (
                            <AtomicLookupSelector
                                label={catConfigs['BLOCK_STATUS']?.label || 'Allocation Status'}
                                items={lookups['BLOCK_STATUS'] || []}
                                value={formData.blockStatusId ?? null}
                                onChange={(val) => setFormData({ ...formData, blockStatusId: val })}
                                variant="form"
                            />
                        )}

                        {formData.type === 'PLOT' && (
                            <>
                                <AtomicLookupSelector
                                    label={catConfigs['LAND_USAGE']?.label || 'Land Usage'}
                                    items={lookups['LAND_USAGE'] || []}
                                    value={formData.usageTypeId}
                                    onChange={(val) => setFormData({ ...formData, usageTypeId: val })}
                                    variant="form"
                                />
                                <AtomicLookupSelector
                                    label={catConfigs['PLOT_STATUS']?.label || 'Plot Status'}
                                    items={lookups['PLOT_STATUS'] || []}
                                    value={formData.plotStatusId ?? null}
                                    onChange={(val) => setFormData({ ...formData, plotStatusId: val })}
                                    variant="form"
                                />
                                <AtomicLookupSelector
                                    label={catConfigs['LAND_OWNERSHIP']?.label || 'Ownership Model'}
                                    items={lookups['LAND_OWNERSHIP'] || []}
                                    value={formData.ownershipTypeId}
                                    onChange={(val) => setFormData({ ...formData, ownershipTypeId: val })}
                                    variant="form"
                                />
                            </>
                        )}

                        {formData.type === 'BUILDING' && (
                            <>
                                <AtomicLookupSelector
                                    label={catConfigs['BUILDING_CLASS']?.label || 'Building Class'}
                                    items={lookups['BUILDING_CLASS'] || []}
                                    value={formData.buildingClassId}
                                    onChange={(val) => setFormData({ ...formData, buildingClassId: val })}
                                    variant="form"
                                />
                                <AtomicLookupSelector
                                    label={catConfigs['CONSTRUCTION_STATUS']?.label || 'Construction Progress'}
                                    items={lookups['CONSTRUCTION_STATUS'] || []}
                                    value={formData.constructionStatusId}
                                    onChange={(val) => setFormData({ ...formData, constructionStatusId: val })}
                                    variant="form"
                                />
                                <NumberInput
                                    label="Total Floors"
                                    min={1}
                                    value={formData.floors}
                                    onChange={(val) => setFormData({ ...formData, floors: Number(val) || 0 })}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px', borderRadius: '12px' }
                                    }}
                                />
                            </>
                        )}

                        {formData.type === 'ROOM' && (
                            <>
                                <AtomicLookupSelector
                                    label={catConfigs['ROOM_TYPE']?.label || 'Facility Usage'}
                                    items={lookups['ROOM_TYPE'] || []}
                                    value={formData.roomTypeId}
                                    onChange={(val) => setFormData({ ...formData, roomTypeId: val })}
                                    variant="form"
                                />
                                <AtomicLookupSelector
                                    label={catConfigs['ROOM_STATUS']?.label || 'Occupancy Status'}
                                    items={lookups['ROOM_STATUS'] || []}
                                    value={formData.roomStatusId}
                                    onChange={(val) => setFormData({ ...formData, roomStatusId: val })}
                                    variant="form"
                                />
                            </>
                        )}

                        {/* Special case for structural type integration (Plot metadata) */}
                        {formData.type === 'PLOT' && (
                            <AtomicLookupSelector
                                label={catConfigs['BUILDING_TYPES']?.label || 'Structural Standard'}
                                items={lookups['BUILDING_TYPES'] || []}
                                value={formData.itpcBuildingType}
                                onChange={(val) => setFormData({ ...formData, itpcBuildingType: val.toString() })}
                                variant="form"
                            />
                        )}
                    </div>

                    {/* Conditionals using dense grid placement (Removed old standard Selects) */}
                    {false && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                        </div>
                    )}


                    {/* ITPC Enterprise Metadata Section (Phase 22 Compliance) */}
                    {(formData.type === 'PLOT' || formData.type === 'BUILDING' || formData.type === 'ROOM') && (
                        <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
                            <Group gap="xs" mb="lg">
                                <Badge variant="light" color="indigo" radius="sm">Audit Metadata</Badge>
                                <Text size="xs" fw={700} c="dimmed">Reference & Compliance Fields</Text>
                            </Group>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                                {(formData.type === 'PLOT' || formData.type === 'BUILDING') && (
                                    <TextInput
                                        label="GPS Coordinates"
                                        placeholder="e.g. 9.0123, 38.7456"
                                        value={formData.gpsCoordinates || ''}
                                        onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.currentTarget.value })}
                                        radius="xl"
                                        size="md"
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                            input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
                                        }}
                                    />
                                )}

                                {formData.type === 'PLOT' && (
                                    <AtomicLookupSelector
                                        label={catConfigs['BUILDING_TYPES']?.label || 'Structural Standard'}
                                        items={lookups['BUILDING_TYPES'] || []}
                                        value={formData.itpcBuildingType}
                                        onChange={(val) => setFormData({ ...formData, itpcBuildingType: val.toString() })}
                                        variant="form"
                                    />
                                )}

                                {formData.type === 'PLOT' && (
                                    <TextInput
                                        label="Master Plan Ref"
                                        placeholder="e.g. Wipro-2025-ARCH-001"
                                        value={formData.masterPlanRef || ''}
                                        onChange={(e) => setFormData({ ...formData, masterPlanRef: e.currentTarget.value })}
                                        radius="xl"
                                        size="md"
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                            input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
                                        }}
                                    />
                                )}

                                {(formData.type === 'PLOT' || formData.type === 'ROOM') && (
                                    <>
                                        <TextInput
                                            label="Previous Occupant"
                                            placeholder="Enter previous tenant name..."
                                            value={formData.previousOccupantName ?? ''}
                                            onChange={(e) => setFormData({ ...formData, previousOccupantName: e.currentTarget.value })}
                                            radius="xl"
                                            size="md"
                                            styles={{
                                                label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
                                                input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', borderRadius: '12px' }
                                            }}
                                        />
                                        <TextInput
                                            label="Previous Occupant ID"
                                            placeholder="e.g. EITP-RES-REN-REG-XXXXX"
                                            value={formData.previousOccupantId ?? ''}
                                            onChange={(e) => setFormData({ ...formData, previousOccupantId: e.currentTarget.value })}
                                            radius="xl"
                                            size="md"
                                            styles={{
                                                label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
                                                input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', borderRadius: '12px' }
                                            }}
                                        />
                                        <NumberInput
                                            label="Previous Area (m²)"
                                            placeholder="Previous area record..."
                                            value={formData.previousOccupantArea ?? 0}
                                            onChange={(val) => setFormData({ ...formData, previousOccupantArea: Number(val) || 0 })}
                                            radius="xl"
                                            size="md"
                                            styles={{
                                                label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                                input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
                                            }}
                                        />
                                    </>
                                )}

                                {formData.type === 'PLOT' && (
                                    <TextInput
                                        label="Land Title Ref"
                                        placeholder="e.g. LTR-2025-ETH-001"
                                        value={formData.landTitleRef ?? ''}
                                        onChange={(e) => setFormData({ ...formData, landTitleRef: e.currentTarget.value })}
                                        radius="xl"
                                        size="md"
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                            input: { border: '1px solid #3B82F6', backgroundColor: '#EFF6FF' } // Slightly distinctive blue for legal
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Secondary Capacity/Metric Row */}
                    {(['PLOT', 'FLOOR', 'ROOM', 'BUILDING'].includes(formData.type)) && (
                        <div className="mt-6 pt-6 border-t border-slate-50 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(formData.type === 'PLOT' || formData.type === 'FLOOR' || formData.type === 'ROOM') && (
                                    <NumberInput
                                        label="Survey Area (m²)"
                                        description="Actual measured dimensions"
                                        value={formData.area ?? 0}
                                        onChange={(val) => setFormData({ ...formData, area: Number(val) || 0 })}
                                        radius="xl"
                                        size="md"
                                        required={formData.type === 'ROOM'}
                                        rightSection={<Text size="xs" fw={900} pr="md" c="dimmed">SQM</Text>}
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '12px' },
                                            input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 800 }
                                        }}
                                    />
                                )}
                                {(formData.type === 'PLOT' || formData.type === 'ROOM') && (
                                    <NumberInput
                                        label="Contract Area (m²)"
                                        description="Dimensions as per agreement"
                                        value={formData.contractArea ?? 0}
                                        onChange={(val) => setFormData({ ...formData, contractArea: Number(val) || 0 })}
                                        radius="xl"
                                        size="md"
                                        rightSection={<Text size="xs" fw={900} pr="md" c="blue.5">LEASED</Text>}
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '12px' },
                                            input: { border: '2px solid #E0F2FE', backgroundColor: '#F0F9FF', fontWeight: 800, color: '#0369A1' }
                                        }}
                                    />
                                )}
                                {formData.type === 'ROOM' && (
                                    <NumberInput
                                        label="Max Capacity (PAX)"
                                        description="Maximum occupancy load"
                                        value={formData.capacity ?? 0}
                                        onChange={(val) => setFormData({ ...formData, capacity: Number(val) || 0 })}
                                        radius="xl"
                                        size="md"
                                        rightSection={<Text size="xs" fw={900} pr="md" c="dimmed">PAX</Text>}
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '12px' },
                                            input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 800 }
                                        }}
                                    />
                                )}
                                {formData.type === 'BUILDING' && (
                                    <div className="md:col-span-3">
                                        <Paper withBorder p="xl" radius="2rem" className="bg-[#F8FAFC] border-slate-100 shadow-inner">
                                            <Group gap="3rem">
                                                <Checkbox
                                                    label="High-Speed Elevators"
                                                    description="Vertical mobility accessibility"
                                                    checked={formData.hasElevator ?? false}
                                                    onChange={(e) => setFormData({ ...formData, hasElevator: e.currentTarget.checked })}
                                                    styles={{ label: { fontWeight: 900, fontSize: '14px', color: '#16284F' }, description: { fontSize: '10px', fontWeight: 700 } }}
                                                />
                                                <Checkbox
                                                    label="Managed Parking Zone"
                                                    description="Vehicle storage infrastructure"
                                                    checked={formData.hasParking ?? false}
                                                    onChange={(e) => setFormData({ ...formData, hasParking: e.currentTarget.checked })}
                                                    styles={{ label: { fontWeight: 900, fontSize: '14px', color: '#16284F' }, description: { fontSize: '10px', fontWeight: 700 } }}
                                                />
                                            </Group>
                                        </Paper>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Paper>

                {/* Intelligence & Remarks Section */}
                <Paper withBorder p="md" radius="2rem" className="border-slate-50 bg-[#F8FAFC]/50 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200" />
                    <Group gap="lg" mb="1rem">
                        <Box p={10} bg="white" className="shadow-lg border border-slate-100 text-slate-400" style={{ borderRadius: '1rem' }}>
                            <Info size={20} strokeWidth={2.5} />
                        </Box>
                        <div className="flex-1">
                            <Title order={5} fw={900} lts="-0.5px" c="#16284F">Additional Notes</Title>
                            <Text size="10px" c="dimmed" fw={800} tt="uppercase" className="tracking-widest">Internal context</Text>
                        </div>
                    </Group>
                    <TextInput
                        label="Description"
                        placeholder="Provide internal context..."
                        value={formData.description ?? ''}
                        onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                        radius="xl"
                        size="md"
                        styles={{
                            label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
                            input: { border: '2px solid #E2E8F0', backgroundColor: 'white', fontWeight: 600, height: '48px', borderRadius: '16px', fontSize: '14px' }
                        }}
                    />
                </Paper>
            </form>
        </Box>
    );
};
