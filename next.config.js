/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bs3-hb1.corp.kuaishou.com",
      },
    ],
    domains: [
      "images.ctfassets.net",
    ],
  },
};

module.exports = nextConfig;
