import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  agentRules: false,
  experimental: {
    proxyClientMaxBodySize: "51mb",
  },
};

export default nextConfig;
