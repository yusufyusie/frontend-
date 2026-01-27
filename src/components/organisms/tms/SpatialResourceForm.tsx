import { useState, useEffect } from 'react';
import { Stack, TextInput, Group, Select, Box, LoadingOverlay, Title, NumberInput, Paper, Text, Checkbox, Badge } from '@mantine/core';
import { Save, Map, Layers, MapPin, Building2, DoorOpen, HardDrive, Info } from 'lucide-react';
import { lookupsService, SystemLookup } from '@/services/lookups.service';

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

    // Lookups state
    const [lookups, setLookups] = useState<{
        usageTypes: SystemLookup[];
        ownershipTypes: SystemLookup[];
        buildingClasses: SystemLookup[];
        roomTypes: SystemLookup[];
        roomStatuses: SystemLookup[];
    }>({
        usageTypes: [],
        ownershipTypes: [],
        buildingClasses: [],
        roomTypes: [],
        roomStatuses: []
    });

    useEffect(() => {
        const loadLookups = async () => {
            const types = ['LAND_USAGE', 'LAND_OWNERSHIP', 'BUILDING_CLASS', 'ROOM_TYPE', 'ROOM_STATUS'];
            const results = await Promise.all(types.map(t => lookupsService.getByCategory(t)));

            setLookups({
                usageTypes: (results[0] as any).data || results[0] || [],
                ownershipTypes: (results[1] as any).data || results[1] || [],
                buildingClasses: (results[2] as any).data || results[2] || [],
                roomTypes: (results[3] as any).data || results[3] || [],
                roomStatuses: (results[4] as any).data || results[4] || []
            });
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
                                label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '6px' },
                                input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '48px' }
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
                                label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '6px' },
                                input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '48px' }
                            }}
                        />
                        {/* Conditionals using dense grid placement */}
                        {formData.type === 'PLOT' && (
                            <>
                                <Select
                                    label="Land Usage"
                                    placeholder="Select usage type"
                                    data={lookups.usageTypes.map(l => ({ value: l.id.toString(), label: l.lookupValue.en }))}
                                    value={formData.usageTypeId?.toString() ?? null}
                                    onChange={(val) => setFormData({ ...formData, usageTypeId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                                <Select
                                    label="Ownership Type"
                                    placeholder="Select ownership model"
                                    data={lookups.ownershipTypes.map(l => ({ value: l.id.toString(), label: l.lookupValue.en }))}
                                    value={formData.ownershipTypeId?.toString() ?? null}
                                    onChange={(val) => setFormData({ ...formData, ownershipTypeId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                            </>
                        )}

                        {formData.type === 'BUILDING' && (
                            <>
                                <NumberInput
                                    label="Total Floors"
                                    min={1}
                                    value={formData.floors}
                                    onChange={(val) => setFormData({ ...formData, floors: Number(val) || 0 })}
                                    required
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                                <Select
                                    label="Building Class"
                                    placeholder="Select class"
                                    data={lookups.buildingClasses.map(l => ({ value: l.id.toString(), label: l.lookupValue.en }))}
                                    value={formData.buildingClassId?.toString() ?? null}
                                    onChange={(val) => setFormData({ ...formData, buildingClassId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                            </>
                        )}

                        {formData.type === 'ROOM' && (
                            <>
                                <Select
                                    label="Room Type"
                                    placeholder="Select room type"
                                    data={lookups.roomTypes.map(l => ({ value: l.id.toString(), label: l.lookupValue.en }))}
                                    value={formData.roomTypeId?.toString() ?? null}
                                    onChange={(val) => setFormData({ ...formData, roomTypeId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                                <Select
                                    label="Room Status"
                                    placeholder="Select room status"
                                    data={lookups.roomStatuses.map(l => ({ value: l.id.toString(), label: l.lookupValue.en }))}
                                    value={formData.roomStatusId?.toString() ?? null}
                                    onChange={(val) => setFormData({ ...formData, roomStatusId: val ? parseInt(val) : undefined })}
                                    radius="xl"
                                    size="md"
                                    styles={{
                                        label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                        input: { border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', fontWeight: 700, height: '44px' }
                                    }}
                                />
                            </>
                        )}
                    </div>

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
                                    <TextInput
                                        label="Building Type"
                                        placeholder="e.g. G+7"
                                        value={formData.itpcBuildingType || ''}
                                        onChange={(e) => setFormData({ ...formData, itpcBuildingType: e.currentTarget.value })}
                                        radius="xl"
                                        size="md"
                                        styles={{
                                            label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                            input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
                                        }}
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
                                                label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                                input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
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
                                                label: { fontWeight: 900, color: '#16284F', fontSize: '11px', marginBottom: '4px' },
                                                input: { border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }
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
                            label: { fontWeight: 900, color: '#16284F', fontSize: '12px', marginBottom: '4px' },
                            input: { border: '2px solid #E2E8F0', backgroundColor: 'white', fontWeight: 600, height: '48px' }
                        }}
                    />
                </Paper>
            </form>
        </Box>
    );
};
