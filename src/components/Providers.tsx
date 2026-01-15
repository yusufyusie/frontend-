'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { AuthProvider } from './AuthProvider';
import { ToastContainer } from './Toast';

// Ethiopian IT Park Brand Theme
const theme = createTheme({
    primaryColor: 'tms-teal',
    colors: {
        'tms-teal': [
            '#e1f6f7',
            '#c2ecef',
            '#82d9df',
            '#3ec5cf',
            '#0daeb9',
            '#0c7c92', // Brand Main
            '#085868',
            '#053f4a',
            '#03262d',
            '#010f12',
        ],
        'tms-navy': [
            '#eef2f9',
            '#dbe4f2',
            '#b7c9e5',
            '#93aed8',
            '#7496cc',
            '#16284F', // Brand Navy
            '#101e3b',
            '#0b1528',
            '#060c16',
            '#010204',
        ],
        'tms-mint': [
            '#ebf9f8',
            '#d6f3f1',
            '#ade7e3',
            '#82dbd5',
            '#6ec9c4', // Brand Mint
            '#4e9f9a',
            '#3d7b77',
            '#2b5754',
            '#1a3432',
            '#091111',
        ],
    },
    fontFamily: 'Roboto, sans-serif',
    headings: {
        fontFamily: 'Roboto, sans-serif',
        fontWeight: '700',
    },
    defaultRadius: 'md',
    components: {
        Button: {
            defaultProps: {
                radius: 'xl',
            },
            styles: {
                root: { transition: 'transform 0.2s ease, box-shadow 0.2s ease' },
            },
        },
        Card: {
            defaultProps: {
                radius: 'lg',
                shadow: 'sm',
            },
        },
        Modal: {
            defaultProps: {
                radius: 'lg',
                centered: true,
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
            }
        }
    },
});

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <MantineProvider theme={theme}>
            <AuthProvider>
                {children}
            </AuthProvider>
            <ToastContainer />
        </MantineProvider>
    );
}
