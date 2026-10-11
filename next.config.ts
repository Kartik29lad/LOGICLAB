import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mssql"],
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /src\/server\/database\/connection\.ts/ },
    ];
    return config;
  },
};

export default nextConfig;
