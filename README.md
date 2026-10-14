# Project Supervision System

Next.js frontend for the student project supervision platform. The app has separate student, supervisor, and administrator workspaces and connects to the Laravel API in `project-supervision-api`.

## Run locally

1. Install dependencies with `npm install`.
2. Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.local`.
3. Start the Laravel API on port 8000 and set its `FRONTEND_URL=http://localhost:3000`.
4. Start the frontend with `npm run dev` and open `http://localhost:3000`.

The API uses Sanctum stateful sessions. The frontend obtains a CSRF cookie before login or registration and sends cookies with API requests; it does not save authentication tokens in browser storage. For production, set `API_PROXY_TARGET` to the Railway API origin (for example, `https://your-service.up.railway.app`) and `NEXT_PUBLIC_API_URL=/backend/api` in Vercel. The Next.js rewrite proxies `/backend/*` to Laravel so browser requests and cookies stay same-origin. On Railway, configure `SANCTUM_STATEFUL_DOMAINS` with the Vercel hostname, `FRONTEND_URL` with its full HTTPS origin, and leave `SESSION_DOMAIN` unset when using the default Vercel domain.

## Main areas

- `src/app/(student)`: student dashboards, projects, submissions, feedback, and repository search.
- `src/app/(supervisor)`: assigned projects, submission review, feedback, and similarity reports.
- `src/app/(admin)`: user and supervisor assignment, approvals, sessions, departments, activity, reports, and repository management.
- `src/lib/services`: API calls grouped by feature.
- `src/lib/api-client.ts`: shared cookie, CSRF, and JSON request handling.

Useful commands: `npm run dev`, `npm run lint`, and `npm run build`.
