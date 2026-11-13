import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'],['html',{open:'never'}]] : 'list',
  use: { baseURL: 'http://127.0.0.1:8765', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'Chromium desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'iPhone WebKit', use: { ...devices['iPhone 13'], browserName: 'webkit' } }
  ],
  webServer: { command: 'python3 -m http.server 8765 --bind 127.0.0.1', url: 'http://127.0.0.1:8765/', timeout: 30000, reuseExistingServer: !process.env.CI }
});
