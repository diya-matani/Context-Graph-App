/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sqlite3'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./o2c_graph.db'],
  },
};

export default nextConfig;
