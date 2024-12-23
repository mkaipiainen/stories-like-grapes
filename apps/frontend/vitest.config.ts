import { fileURLToPath } from 'node:url';
import viteConfig from './vite.config';
import { defineConfig, mergeConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
