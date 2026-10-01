import { defineConfig, devices } from "@playwright/test";

// E2E needs a running app backed by a real Postgres database and a real
// LIVEBLOCKS_SECRET_KEY (the realtime sync test genuinely calls Liveblocks' API to
// authorize rooms - there is no mock for that here, unlike the unit tests). See
// e2e/README.md before running this locally or wiring it into CI.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share one seeded database; parallel runs would race
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Only spins up `next dev` when no E2E_BASE_URL was given (i.e. running locally
  // against a throwaway instance). In CI, start it yourself as a separate step so
  // its logs are visible and it can be health-checked before tests run.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
