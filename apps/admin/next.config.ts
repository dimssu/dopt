import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@clinical-notes/ui', '@clinical-notes/types', '@clinical-notes/config'],
  webpack: (cfg) => {
    cfg.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return cfg;
  },
};

export default config;
