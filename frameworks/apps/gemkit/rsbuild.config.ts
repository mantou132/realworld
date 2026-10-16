import { pluginGemkit } from '@mantou/gemkit/plugin';
import { defineConfig } from '@rsbuild/core';

export default defineConfig({
  plugins: [pluginGemkit({ title: 'Conduit', titleTemplate: '%s — Conduit' })],
  source: {
    define: {
      'process.env.API_BASE': JSON.stringify(process.env.API_BASE || 'http://localhost:3100/api'),
    },
  },
});
