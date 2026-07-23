import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // placeholder project shots — swap for real assets later
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
