/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/v1/migrations": ["./dist/infra/migrations/**/*"],
  },
};

module.exports = nextConfig;
