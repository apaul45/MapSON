import { defineConfig, loadEnv } from 'vite';
// @ts-ignore
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';
import fs from 'fs';

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  if (mode.includes('dev')) {
    return {
      server: { https: true },

      plugins: [
        react(),
        nodePolyfills({
          // Whether to polyfill `node:` protocol imports.
          protocolImports: true,
        }),
        mkcert(),
      ],
    };
  }

  return {
    server: {
      https: {
        key: fs.readFileSync('./key.pem'),
        cert: fs.readFileSync('./cert.pem'),
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
