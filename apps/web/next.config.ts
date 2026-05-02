import type { NextConfig } from 'next';

const config: NextConfig = {
  // Re-enable typedRoutes once legal/marketing routes are real (M7).
  transpilePackages: ['@clinical-notes/ui', '@clinical-notes/types'],
  webpack: (cfg) => {
    // Workspace packages are TS source with NodeNext-style ".js" import
    // specifiers. Tell webpack to resolve those to their real ".ts"/".tsx"
    // sources during dev and build.
    cfg.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
    };
    return cfg;
  },
};

export default config;
