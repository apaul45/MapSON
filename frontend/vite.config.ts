import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    build: {
      outDir: './wwwroot/app/',
      sourcemap: true,
    },

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
