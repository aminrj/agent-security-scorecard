import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // jsPDF's .html() method does a dynamic import of html2canvas.
      // We only use jsPDF's raw drawing API, so stub it out to avoid
      // bundling the unused 200KB html2canvas package.
      html2canvas: resolve(__dirname, 'src/utils/html2canvas-stub.ts'),
    },
  },
});
