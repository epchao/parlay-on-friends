import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false, // CAUTION: This is set to false to avoid double render errors in development when loading player pages.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "opgg-static.akamaized.net",
      },
      {
        protocol: "https",
        hostname: "ddragon-webp.lolmath.net",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
      },
    ],
  },
};

export default nextConfig;
