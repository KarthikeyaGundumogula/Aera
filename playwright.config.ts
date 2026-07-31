import { defineConfig, devices } from '@playwright/test';

/**
 * playwright.config.ts
 *
 * Full-Stack E2E Test Configuration for Aera.
 *
 * This config manages the full lifecycle for E2E tests:
 *   1. Starts the tars backend in E2E mode (APP_ENV=test, port 8080)
 *      which provisions a fresh isolated PostgreSQL database with all
 *      sqlx migrations applied (including pg_search indices).
 *   2. Starts the Aera Vite dev server (port 3000) pointing to the E2E backend.
 *   3. Runs all specs in ./e2e/
 *   4. Playwright stops both servers on completion.
 *
 * Run:
 *   npm run test:e2e          → headless chromium
 *   npm run test:e2e:ui       → interactive visual test runner
 *   npm run test:e2e:debug    → debug mode with browser devtools
 *
 * Prerequisites:
 *   - ParadeDB running: docker compose up -d postgres (from workspace root)
 *   - tars built at least once: cd tars && cargo build --bin e2e_server
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: false, // false because all tests share one server instance

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI.
  workers: 1, // 1 worker — all tests run against the same ephemeral DB

  // Reporter: HTML for local dev, dot for CI
  reporter: process.env.CI ? 'dot' : [['html', { open: 'never' }]],

  use: {
    // Base URL for page.goto('/') calls
    baseURL: 'http://localhost:3000',

    // Collect trace on first retry — inspect with: npx playwright show-trace
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ─── Server Orchestration ────────────────────────────────────────────────────
  // Playwright automatically manages these processes:
  //   - If not running: starts them before tests begin
  //   - After tests: stops them cleanly
  //   - reuseExistingServer: allows reuse during local dev for faster iteration
  webServer: [
    {
      // ── Server 1: tars E2E Backend ───────────────────────────────────────
      // Runs the dedicated E2E binary which:
      //   - Creates fresh tars_e2e_<uuid> database in ParadeDB
      //   - Runs all sqlx migrations (schema + pg_search indices)
      //   - Seeds user_roles
      //   - Binds Axum to port 8080
      //   - Prints "E2E_SERVER_READY" on startup
      command: 'cd ../tars && APP_ENV=test cargo run',
      url: 'http://localhost:8080/health_check',

      reuseExistingServer: !process.env.CI,
      // 120s timeout: accommodates cold Rust compilation on first run.
      // Subsequent runs are fast due to incremental build cache (target/).
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        RUST_LOG: 'info,sqlx=warn',
      },
    },
    {
      // ── Server 2: Aera Vite Dev Server ──────────────────────────────────
      // Starts Aera pointing to the E2E backend (port 8080).
      // VITE_API_URL is injected to override any .env.local config.
      command: 'npm run dev -- --port 3000',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 30 * 1000,
      env: {
        // Force Aera to talk to the E2E test backend, not the dev backend.
        // This guarantees complete isolation from local development data.
        VITE_API_URL: 'http://localhost:8080',
      },
    },
  ],
});
