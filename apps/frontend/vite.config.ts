import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath, URL } from 'node:url';
import checker from 'vite-plugin-checker';
import {VitePWA, VitePWAOptions} from "vite-plugin-pwa";
import {createHash} from "node:crypto";
function getHash(text: string) {
  return createHash('sha256').update(text).digest('hex').substring(0, 8);
}

const htmlHashPlugin = {
  name: 'html-hash',
  enforce: 'post',
  generateBundle(_options: any, bundle: any) {
    const indexHtml = bundle['index.html'];
    indexHtml.fileName = `index.${getHash(indexHtml.source)}.html`;
  },
} as const;

const manifest: Partial<VitePWAOptions> = {
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Stories Like Grapes',
    short_name: 'SLG',
    description: 'An app for various home-tasks',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  registerType: 'autoUpdate',
  devOptions: { enabled: true }, // Enables SW during development for testing.
  injectRegister: 'auto',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    cleanupOutdatedCaches: true,
  }
}
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
    }),
    htmlHashPlugin,
    VitePWA(manifest)
  ],
  server: {
    host: '0.0.0.0',
    port: 4200,
    watch: {
      usePolling: true,
    },
    hmr: { clientPort: 4200, host: 'localhost' },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '@api': fileURLToPath(new URL('../api/', import.meta.url)),
    },
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
});
