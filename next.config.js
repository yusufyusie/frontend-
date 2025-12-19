/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true, // Use SWC for faster minification
    compress: true, // Enable gzip compression

    // Image optimization
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
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
                        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3000/api; frame-ancestors 'self';"
                    }
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
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Vendor chunk
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /node_modules/,
                            priority: 20
                        },
                        // Common chunk
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true
                        }
                    }
                }
            };
        }
        return config;
    },

    // Environment variables available to the browser
    env: {
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/api',
    },
};

module.exports = nextConfig;

