import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 모바일 및 로컬 네트워크 외부 IP 접속 허용 */
  allowedDevOrigins: [
    "192.168.219.105",
    "192.168.219.105:3000",
    "localhost",
    "localhost:3000",
  ],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
