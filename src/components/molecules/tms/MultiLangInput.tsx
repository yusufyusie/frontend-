import { TextInput, Stack, Paper, Text } from '@mantine/core';

interface Props {
    label: string;
    values: { en: string; am: string };
    onChange: (values: { en: string; am: string }) => void;
    error?: string;
}

export const MultiLangInput = ({ label, values, onChange, error }: Props) => {
    return (
        <Paper withBorder p="md" radius="sm" style={{ backgroundColor: '#fcfcfc' }}>
            <Text size="sm" fw={600} mb="xs">{label}</Text>
            <Stack gap="sm">
                <TextInput
                    label="English"
                    placeholder="Enter English value"
                    value={values.en}
                    onChange={(e) => onChange({ ...values, en: e.currentTarget.value })}
                    required
                />
                <TextInput
                    label="Amharic (አማርኛ)"
                    placeholder="እባክዎን የአማርኛ ትርጉም ያስገቡ"
                    value={values.am}
                    onChange={(e) => onChange({ ...values, am: e.currentTarget.value })}
                />
            </Stack>
            {error && <Text color="red" size="xs" mt={5}>{error}</Text>}
        </Paper>
    );
};
