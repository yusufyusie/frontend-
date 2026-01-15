import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import { ColorSchemeScript } from '@mantine/core';
import { Providers } from '@/components/Providers';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap', // Optimize font loading
    preload: true,
    variable: '--font-inter',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0C7C92',
};

export const metadata: Metadata = {
    title: {
        default: 'Tenant Management System',
        template: '%s | TMS',
    },
    description: 'Comprehensive Tenant Management System for Ethiopian IT Park. Manage tenants, leases, billing, and property administration with advanced RBAC and secure authentication.',
    keywords: ['tenant management', 'property management', 'lease management', 'billing', 'RBAC', 'Ethiopian IT Park', 'TMS'],
    authors: [{ name: 'Ethiopian IT Park' }],
    creator: 'Ethiopian IT Park',
    publisher: 'Ethiopian IT Park',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
    openGraph: {
        title: 'Tenant Management System',
        description: 'Comprehensive Tenant Management for Ethiopian IT Park',
        url: '/',
        siteName: 'Tenant Management System',
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/favicon.ico',
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/site.webmanifest',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="light" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

                {/* Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'WebApplication',
                            name: 'Tenant Management System',
                            description: 'Comprehensive Tenant Management for Ethiopian IT Park',
                            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'Web',
                        }),
                    }}
                />
            </head>
            <body className={inter.className}>
                {/* Skip to main content link for accessibility */}
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg"
                    aria-label="Skip to main content"
                >
                    Skip to main content
                </a>

                <Providers>
                    <div id="main-content" role="main">
                        {children}
                    </div>
                </Providers>

                {/* Live region for screen reader announcements */}
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                    id="aria-live-region"
                />
            </body>
        </html>
    );
}

