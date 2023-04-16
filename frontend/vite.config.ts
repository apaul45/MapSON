import { defineConfig, loadEnv } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      nodePolyfills({
        // Whether to polyfill `node:` protocol imports.
        protocolImports: true,
      }),
    ],
    define: { global: 'window' },
    server: {
      proxy: {
        '^/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          withCredentials: true,
          rewrite: (path) => path.replace(/^\/api/, ``),
        },
      },
    },
  }
})
