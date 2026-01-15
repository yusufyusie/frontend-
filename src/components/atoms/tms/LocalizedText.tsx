import { Text, Group } from '@mantine/core';

interface Props {
    value: Record<string, string>;
    primaryLang?: string;
    secondaryLang?: string;
}

export const LocalizedText = ({ value, primaryLang = 'en', secondaryLang = 'am' }: Props) => {
    return (
        <Group gap={4}>
            <Text size="sm" fw={500}>
                {value[primaryLang] || '---'}
            </Text>
            {value[secondaryLang] && (
                <Text size="xs" c="dimmed" fs="italic">
                    ({value[secondaryLang]})
                </Text>
            )}
        </Group>
    );
};
