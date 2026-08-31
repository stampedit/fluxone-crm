const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', '192.168.40.31', '192.168.56.1'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
