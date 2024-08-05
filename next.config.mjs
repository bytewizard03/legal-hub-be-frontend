/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/api/fileupload/:path*',
            destination: `http://localhost:8040/legal/api/fileupload/:path*`,
          },
          {
            source: '/api/send-envelops/:path*',
            destination: `http://localhost:8040/legal/api/send-envelops/:path*`,
          },
          {
            source: '/api/get-envelops/:path*',
            destination: `http://localhost:8040/legal/api/get-envelops/:path*`,
          },
          {
            source: '/api/generate-presigned-link/:path*',
            destination: `http://localhost:8040/legal/api/generate-presigned-link/:path*`,
          },
          {
            source: '/api/notify/:path*',
            destination: `http://localhost:8040/legal/api/notify/:path*`,
          },
        ];
      },
      
      // Environment variables
      env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8040/legal/api',
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/',
      },
};

export default nextConfig;
