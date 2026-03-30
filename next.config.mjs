/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'sb_publishable_hCn4hpKWUfJtVrQKyRMVBA_py4PiUQk.supabase.co',
      },
    ],
  },
};

export default nextConfig;
