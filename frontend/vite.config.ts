import { defineConfig, loadEnv } from 'vite';
// @ts-ignore
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  if (mode.includes('dev')) {
    return {
      plugins: [
        react(),
        nodePolyfills({
          // Whether to polyfill `node:` protocol imports.
          protocolImports: true,
        }),
      ],
    };
  }
  return {
    server: {
      https: {
        key: process.env.key,
        cert: process.env.certificate,
      },
    },
    plugins: [
      react(),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
  };
});
