# Local Supabase dev server

This repo is a Base44 app (Vite + React). Its production backend is the Base44
platform, but the Supabase CLI is configured here for local database development.

`supabase/` was scaffolded with `supabase init` (no nested folder — runs from repo root).

## Start the local stack

```bash
npx supabase start     # pulls images, starts all services on 127.0.0.1
npx supabase status    # shows URLs, DB URL, and auth/storage keys
npx supabase stop      # stop the stack
```

### Connection details (local, not for production)

| Service  | URL                         |
|----------|-----------------------------|
| API      | http://127.0.0.1:54321      |
| Studio   | http://127.0.0.1:54323      |
| Mailpit  | http://127.0.0.1:54324      |
| Database | postgresql://postgres:postgres@127.0.0.1:54322/postgres |

The local stack runs as Docker containers outside `docker-compose.base44.yml`.
It is ephemeral in the sandbox: re-run `npx supabase start` after a sandbox
recreate. Local data lives in the `supabase` Docker volumes, not the repo.

## Linked remote project

This repo is linked to the remote project **Steam Room App**
(ref `qymqgovxghrigylrccfc`, West EU / Ireland) via `supabase link`.

The link state lives in `supabase/.temp/project-ref` (gitignored). To re-link
after a fresh clone or sandbox recreate, set your Supabase access token and run:

```bash
SUPABASE_ACCESS_TOKEN=<your-token> npx supabase link --project-ref qymqgovxghrigylrccfc
```

Sync schema from remote into a migration file:

```bash
SUPABASE_ACCESS_TOKEN=<your-token> npx supabase db pull --schema public
```
