import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [{
          urlPattern: /\/tebakan\/.*/,
          handler: 'NetworkOnly'
        }]
      }
    })
  ],
  worker: {
    format: 'es',
    plugins: () => [sveltekit()]
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js']
  }
}); 