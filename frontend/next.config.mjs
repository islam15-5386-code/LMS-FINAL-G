import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Point Turbopack at the monorepo root so it can resolve hoisted deps.
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default nextConfig;
