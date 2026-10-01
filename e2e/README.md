# End-to-end tests (Playwright)

These are real-browser tests, separate from the Vitest unit suite in `tests/`.
There are two files:

- `auth.spec.ts` - login and registration through the actual pages. Needs a
  database, nothing else.
- `collaboration.spec.ts` - the one thing no unit test can prove: that two
  independent browser sessions editing the same board see each other's changes
  in real time. This genuinely calls Liveblocks' API to authorize each session's
  room access, so it needs a real `LIVEBLOCKS_SECRET_KEY` from a Liveblocks
  project - there's no mock for it here.

## Running locally

```bash
npm run db:up                      # a real Postgres, not mocked
cp .env.example .env                # fill in AUTH_SECRET and LIVEBLOCKS_SECRET_KEY
npx playwright install chromium     # downloads a browser binary, ~150MB
npm run test:e2e
```

`playwright.config.ts` starts `next dev` for you automatically when
`E2E_BASE_URL` isn't set. Point it at an already-running instance instead with
`E2E_BASE_URL=http://localhost:3000 npm run test:e2e`.

## What each test seeds and cleans up

Both files seed their own users (and `collaboration.spec.ts` its own board and
share link) directly through Prisma in `fixtures/seed.ts` - real email
verification and UI-driven share-link creation are skipped on purpose to keep
this fast and focused; those flows are already covered by
`tests/api/register.test.ts` and `tests/api/liveblocks-auth.test.ts`. Every test
deletes what it created in an `afterAll`/`finally`, so a run leaves no leftover
rows even on failure - but if a run is killed hard (crash, `Ctrl+C`), the
`e2e-owner-*@example.com` / `e2e-auth-*@example.com` rows it seeded can be
deleted manually.

## A note on this repo's environment

This test suite was written but **could not be executed inside the sandbox
this project was developed in** - it has no access to Playwright's browser
download CDN, no real database, and no Liveblocks credentials. Everything else
in this codebase (unit tests, lint, typecheck) was run and mutation-tested
before being committed; these E2E tests were not. Run them locally or in CI
before relying on them - the selectors and flow are written to match the real
app exactly, but "compiles and type-checks" is not the same guarantee as
"was actually seen passing."
