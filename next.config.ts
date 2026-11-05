import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
   
    unoptimized:true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '**',
        search: '',
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
