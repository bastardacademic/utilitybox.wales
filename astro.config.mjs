import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://utilitybox.wales',
  output: 'static',
  build: {
    format: 'directory'
  },
  compressHTML: true
});
