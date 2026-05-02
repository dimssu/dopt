import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@clinical-notes/ui', '@clinical-notes/types', '@clinical-notes/config'],
};

export default config;
