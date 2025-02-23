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
  }
}); 