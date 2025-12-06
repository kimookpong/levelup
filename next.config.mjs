/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      }
    ],
  },
};

export default nextConfig;
