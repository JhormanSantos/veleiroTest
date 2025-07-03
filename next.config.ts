import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    PULSE_API_KEY: process.env.PULSE_API_KEY,
  },
};

export default nextConfig;
