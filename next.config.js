/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  headers: async () => [
    {
      source: '/api/events/:path*',
      headers: [
        { key: 'Content-Type', value: 'text/event-stream' },
        { key: 'Cache-Control', value: 'no-cache, no-transform' },
        { key: 'Connection', value: 'keep-alive' },
      ],
    },
  ],
};

module.exports = nextConfig;
