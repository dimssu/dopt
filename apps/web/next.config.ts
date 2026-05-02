import type { NextConfig } from 'next';

const config: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ['@clinical-notes/ui', '@clinical-notes/types'],
};

export default config;
