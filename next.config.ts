import path from 'node:path';
import type { NextConfig } from 'next';

const config: NextConfig = {
  // Pin tracing root to this project. Without this Next walks up the file tree
  // looking for a lockfile and may pick up an unrelated one (e.g. ~/package-lock.json),
  // which can cause module-resolution churn during dev.
  outputFileTracingRoot: path.join(__dirname),
};

export default config;
