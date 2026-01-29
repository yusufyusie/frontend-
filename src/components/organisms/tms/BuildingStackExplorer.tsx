'use client';

import React from 'react';
import { Stack, Group, Box, Text, Paper, Badge, Tooltip, rem } from '@mantine/core';
import { Building2, Users } from 'lucide-react';
import Link from 'next/link';

interface Room {
    id: number;
    code: string;
    name: string;
    roomStatus?: { name: string; lookupCode: string };
    roomType?: { name: string; lookupCode: string };
    leases?: any[];
}

interface Floor {
    id: number;
    floorNumber: number;
    rooms: Room[];
}

interface BuildingStackExplorerProps {
    buildingName: string;
    floors: Floor[];
}

export const BuildingStackExplorer = ({ buildingName, floors }: BuildingStackExplorerProps) => {
    // Sort floors in descending order (highest floor first)
    const sortedFloors = [...floors].sort((a, b) => b.floorNumber - a.floorNumber);

    return (
        <Paper withBorder p="xl" radius="2rem" className="glass shadow-xl bg-white/40">
            <Stack gap="xl">
                <Group justify="space-between">
                    <Box>
                        <TitleWithIcon
                            icon={<Building2 size={24} className="text-[#0C7C92]" />}
                            title={`${buildingName} - Vertical Stack`}
                            subtitle="Floor-by-floor occupancy and asset distribution"
                        />
                    </Box>
                    <Badge variant="light" color="blue" size="xl" radius="md">
                        {floors.length} LEVELS
                    </Badge>
                </Group>

                <Stack gap="xs">
                    {sortedFloors.map((floor) => (
                        <FloorRow key={floor.id} floor={floor} />
                    ))}

                    {/* Ground/Foundation indicator */}
                    <Box
                        h={8}
                        bg="slate.200"
                        style={{ borderRadius: '4px', opacity: 0.5 }}
                        mt="xs"
                    />
                </Stack>
            </Stack>
        </Paper>
    );
};

const FloorRow = ({ floor }: { floor: Floor }) => {
    return (
        <Group align="stretch" gap="md" wrap="nowrap">
            {/* Floor Number Indicator */}
            <Paper
                w={60}
                bg="#16284F"
                p="xs"
                radius="md"
                className="flex flex-col items-center justify-center text-white shrink-0"
            >
                <Text size="xs" fw={900} opacity={0.7} tracking="1px">FLR</Text>
                <Text size="xl" fw={900}>{floor.floorNumber}</Text>
            </Paper>

            {/* Room Stack */}
            <div className="flex-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {floor.rooms?.map((room) => (
                    <RoomNode key={room.id} room={room} />
                ))}
            </div>
        </Group>
    );
};

const RoomNode = ({ room }: { room: Room }) => {
    const isOccupied = room.roomStatus?.lookupCode === 'RENTED' || (room.leases && room.leases.length > 0);
    const occupant = room.leases?.[0]?.tenant?.name;

    return (
        <Tooltip
            label={
                <Stack gap={4} p={4}>
                    <Text fw={900} size="sm">{room.name || room.code}</Text>
                    <Text size="xs">{room.roomType?.name || 'Office'}</Text>
                    {isOccupied && (
                        <Group gap={4}>
                            <Users size={10} />
                            <Text size="xs" fw={700} c="teal.3">{occupant}</Text>
                        </Group>
                    )}
                    <Text size="10px" opacity={0.7}>STATUS: {room.roomStatus?.name || 'Vacant'}</Text>
                </Stack>
            }
            position="top"
            withArrow
            radius="md"
        >
            <Box
                component={Link}
                href={`/admin/tms/resources/room/${room.id}`}
                h={40}
                className={`
                    rounded-lg border transition-all cursor-pointer flex items-center justify-center
                    ${isOccupied
                        ? 'bg-blue-600 border-blue-700 text-white shadow-md hover:brightness-110'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-500'}
                `}
                style={{ minWidth: rem(40) }}
            >
                <Text size="xs" fw={900}>{room.code.split('-').pop()}</Text>
            </Box>
        </Tooltip>
    );
};

const TitleWithIcon = ({ icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <Group gap="md">
        <Box p={10} bg="blue.0" style={{ borderRadius: '14px' }} className="shadow-sm">
            {icon}
        </Box>
        <Box>
            <Text fw={900} size="lg" c="#16284F" tracking="-0.5px">{title}</Text>
            <Text size="xs" c="dimmed" fw={600}>{subtitle}</Text>
        </Box>
    </Group>
);
