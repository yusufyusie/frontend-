/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // swcMinify is now default in Next.js 16 (removed deprecated option)
    compress: true, // Enable gzip compression
    poweredByHeader: false, // Remove X-Powered-By header for security

    // Compiler optimizations for better performance
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? {
            exclude: ['error', 'warn'],
        } : false,
    },

    // Turbopack configuration (empty to silence warnings - webpack config still works)
    turbopack: {},

    // Experimental features for performance
    experimental: {
        optimizeCss: true, // Enable CSS optimization
        optimizePackageImports: ['lucide-react', '@mantine/core'], // Tree-shake icon libraries
    },

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000, // Cache images for 1 year
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Security headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=31536000; includeSubDomains; preload'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'} ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'} ws://${process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'localhost:3001'}; frame-ancestors 'self';`
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // Performance optimizations
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                minimize: true,
                usedExports: true, // Tree shaking
                sideEffects: false, // Enable aggressive tree shaking
                splitChunks: {
                    chunks: 'all',
                    maxInitialRequests: 25,
                    minSize: 20000,
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Framework chunk (React, Next.js)
                        framework: {
                            name: 'framework',
                            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
                            priority: 40,
                            enforce: true,
                        },
                        // Vendor chunk
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /[\\/]node_modules[\\/]/,
                            priority: 20,
                        },
                        // Common chunk
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Styles chunk
                        styles: {
                            name: 'styles',
                            test: /\.(css|scss|sass)$/,
                            chunks: 'all',
                            enforce: true,
                        },
                    },
                },
            };
        }

        return config;
    },

    // Environment variables available to the browser
    env: {
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    },
};

module.exports = nextConfig;

