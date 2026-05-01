import { defineConfig, devices } from '@playwright/test';

const frontendPort = process.env.PLAYWRIGHT_PORT ?? '5173';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${frontendPort}`;
const reuseExistingFrontend = process.env.PLAYWRIGHT_REUSE_SERVER !== '0';
const reuseExistingBackend = process.env.PLAYWRIGHT_REUSE_BACKEND !== '0';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'cd ../backend && JAVA_HOME=/opt/homebrew/opt/openjdk@17 PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH" mvn spring-boot:run',
      url: 'http://127.0.0.1:8080/api/recruitments',
      reuseExistingServer: reuseExistingBackend,
      timeout: 120_000
    },
    {
      command: `npm run dev -- --port ${frontendPort}`,
      url: baseURL,
      reuseExistingServer: reuseExistingFrontend,
      timeout: 120_000
    }
  ]
});
