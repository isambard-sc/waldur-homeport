import path from 'path';

import react from '@vitejs/plugin-react';
import markdownPlugin from 'vite-plugin-markdown';
import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import reactDisplayNamePlugin from './vite-plugin-react-displayname';

export default defineConfig({
  resolve: {
    alias: {
      '@waldur': path.resolve(__dirname, './src/'),
      'react-windowed-select': path.resolve(
        'node_modules/react-windowed-select/dist/main.js',
      ),
    },
  },
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        dimensions: false,
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      },
    }),
    // @ts-ignore
    markdownPlugin.default({ mode: 'react' }),
    reactDisplayNamePlugin(),
  ],
  build: {
    sourcemap: false,
  },
  test: {
    include: ['**/*.test.ts', '**/*.test.tsx'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setupTests.js'],
  },
});
