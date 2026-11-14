import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir: './tests/e2e', fullyParallel: false, workers: 1,
    use: { baseURL: 'https://127.0.0.1:4175', ignoreHTTPSErrors: true, browserName: 'chromium', viewport: { width: 1440, height: 1056 } },
    webServer: { command: 'node tests/support/https-static.mjs', url: 'https://127.0.0.1:4175', ignoreHTTPSErrors: true, reuseExistingServer: false },
});
