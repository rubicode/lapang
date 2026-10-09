import { defineConfig, devices } from '@playwright/test';

// Deteksi apakah sedang dijalankan dalam mode headed atau ada variabel SLOWMO
const isHeaded = process.argv.includes('--headed') || !!process.env.HEADED;
// Saat headed, pasang default slowMo 1000ms agar transisi browser terlihat santai dan tidak terlalu cepat
const defaultSlowMo = isHeaded ? 1000 : 0;
const slowMo = process.env.SLOWMO !== undefined ? parseInt(process.env.SLOWMO, 10) : defaultSlowMo;

export default defineConfig({
  testDir: './e2e',
  timeout: isHeaded ? 90 * 1000 : 30 * 1000,
  expect: {
    timeout: 7000
  },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    launchOptions: {
      slowMo: slowMo
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000
  }
});
