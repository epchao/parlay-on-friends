import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "static.bigbrain.gg",
      },
      {
        protocol: "https",
        hostname: "opgg-static.akamaized.net",
      },
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
      },
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
      },
    ],
  },
};

export default nextConfig;
