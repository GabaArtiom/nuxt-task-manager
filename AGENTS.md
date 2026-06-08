# AGENTS.md

## Commands
- Use Bun for installs: this repo has `bun.lock`; `scripts/update.sh` also uses `bun install` and `bun run build` even though README examples use npm.
- Required runtime is Node `22.*` from `package.json`.
- `bun install` runs `postinstall`: `nuxt prepare && prisma generate`.
- Main verification command is `bun run build`; there are no lint, test, formatter, or typecheck scripts in `package.json`.
- Database commands: `bun run db:migrate`, `bun run db:seed`, `bun run db:reset`. Treat `db:reset` as destructive.
- Avoid `bun run update` for normal work: it runs `git pull`, builds, removes `node_modules`, and restarts a PM2 process.

## Database And Env
- Prisma is configured for SQLite (`provider = "sqlite"`) and `.env.example` uses `DATABASE_URL="file:./dev.db"`; README mentions PostgreSQL, but the executable schema/config currently do not.
- `prisma/dev.db` exists in the repo. Do not overwrite/reset it unless explicitly asked.
- `docker-compose.yml` starts PostgreSQL, but it does not match the current Prisma SQLite provider.
- Seed data is skipped if any users already exist. Seed logins are `admin@example.com` / `Admin1234!`, `bob@example.com` / `Member1234!`, and `carol@example.com` / `Member1234!`.

## App Shape
- This is a Nuxt app using the `app/` directory. Main UI routes are in `app/pages`; project board work centers on `app/pages/projects/[id].vue` and `app/components/projects/*`.
- Current domain is projects, columns, tasks, and members. Some README ticket-management API details are stale.
- Server endpoints are file-based Nitro/H3 handlers under `server/api`; shared server utilities are under `server/utils`.
- Prisma models are `User`, `Project`, `ProjectMember`, `Column`, and `Task`; roles used by code include `admin`, `member`, and `super_admin` checks in `requireAdmin`.

## Realtime And Auth
- Auth is JWT in the `auth_token` HTTP-only cookie; protected handlers should call `requireAuth(event)` and admin-only handlers should call `requireAdmin(event)`.
- Realtime updates use authenticated SSE at `server/routes/sse.ts` and client composable `app/composables/useRealtimeProject.ts`.
- Project mutation handlers should call `broadcastToProject(projectId, type, { ..., triggered_by: user.id })`; the client ignores events from the current user and expects `data.project_id`.

## Nuxt Conventions
- Components are auto-imported from `~/components` with `pathPrefix: false`; do not add prefixed component names unless changing config.
- i18n is configured for `en` and `ru` only in `nuxt.config.ts`; adding a locale requires updating `locales` config, not just adding a JSON file.
- Runtime config env keys are in `nuxt.config.ts`; public app URL is `runtimeConfig.public.appUrl` from `APP_URL`.
- The codebase currently uses single quotes and no semicolons; there is no formatter config enforcing this.
