# Board — Real-Time Collaborative Whiteboard

A Miro-style collaborative whiteboard built with Next.js. Multiple users can create shapes, sticky notes, and freehand drawings on a shared canvas in real time, organized around teams with role-based access.

## Features

- **Real-time multiplayer canvas** — cursors, selections, and live editing powered by Liveblocks (CRDT-based sync), with shapes, sticky notes, text, and freehand drawing
- **Custom authentication** — email/password auth built from scratch with JWT (`jose`) session tokens in httpOnly cookies and `bcrypt` password hashing; no third-party auth provider
- **Multi-tenant organizations** — users can belong to multiple teams simultaneously, each with `ADMIN`/`MEMBER` roles and its own set of boards
- **Two invite flows**:
  - Email invites that create a full account and org membership
  - Anonymous, revocable share links that grant guest access to a single board without requiring an account
- **Favorites, search, and board management** — rename, delete, and organize boards per team
- **Email verification and password reset** flows with time-limited tokens

## Tech Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma 7
- **Real-time:** Liveblocks (presence, storage, and room-based access control)
- **Auth:** Custom-built — `jose` for JWT, `bcrypt` for password hashing, httpOnly cookies for sessions
- **State:** Zustand
- **UI:** Tailwind CSS, shadcn/ui

## Getting Started

Requirements: Node 22+, Docker.

```bash
cp .env.example .env        # then fill in AUTH_SECRET, LIVEBLOCKS_SECRET_KEY, RESEND_API_KEY
npm install
npm run db:up               # starts PostgreSQL in Docker (waits until healthy)
npx prisma generate
npm run db:migrate          # applies migrations to the local database
npm run dev
```

Useful scripts: `npm run db:down` (stop the DB, keep data), `npm run db:reset` (wipe the DB volume and re-apply migrations), `npm run lint`, `npm run typecheck`, `npm test`.

Environment variables: see [`.env.example`](.env.example). `EMAIL_FROM` is optional.

## Screenshots

![dashboard](/assets/dashboard.png)
![boards](/assets/boards.png)
