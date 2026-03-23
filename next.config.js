/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/v1/migrations": ["./dist/infra/migrations/**/*"],
    },
  },
};

module.exports = nextConfig;
