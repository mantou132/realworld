import { defineConfig } from '@playwright/test';

import { baseConfig } from '../../specs/e2e/playwright.base';

// 官方 e2e 测试集，`BASE_URL` 是被测应用，`TEST_MODE=ssr`，`API_BASE` 是本地 API
export default defineConfig({
  ...baseConfig,
  testDir: '../../specs/e2e',
  retries: 0,
  reporter: [['json', { outputFile: `results/e2e-${process.env.APP}.json` }], ['line']],
  use: {
    ...baseConfig.use,
    baseURL: process.env.BASE_URL,
    launchOptions: {
      executablePath:
        process.env.CHROME_PATH || '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    },
  },
});
