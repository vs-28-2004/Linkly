# Linkly

Linkly is a full-stack social app: post text and photos, follow people, comment and like, share stories that vanish after 24 hours, and chat one-to-one.

## Features

- **Sign in** with Clerk (email, social logins - whatever you enable in the Clerk dashboard)
- **Profiles** with avatar, cover photo, bio and location - editable in the app
- **Posts** with text and up to 4 photos, likes, comments, delete (your own), and a share link (`/post/<id>`)
- **Feed** with an *Everyone* / *Following* switch and "Load more" pagination
- **Follow system** - *Connections* are mutual follows; *Pending* are people who follow you that you haven't followed back (press **Accept** to follow back)
- **Discover** people with live search (name, username, bio, location)
- **Stories** - text stories with a background colour, or a photo/video; they expire after 24 hours
- **Messages** - one-to-one chat with text and images, unread badges, new messages appear automatically (refreshes every few seconds)

## Tech stack

| Part | Technology |
| --- | --- |
| Client | React 19, Vite, Tailwind CSS 4, React Router 7, Lucide icons |
| Server | Node.js, Express 5, MongoDB + Mongoose |
| Auth | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| Media | Cloudinary (images and story videos) |
| Background jobs | Inngest (optional - syncs Clerk sign-ups/updates/deletions) |

## Project structure

```
Linkly/
├── client/                 React app
│   └── src/
│       ├── components/     Reusable UI (PostCard, Sidebar, StoriesBar, ...)
│       ├── context/        CurrentUserProvider - the signed-in user, follow helpers, unread count
│       ├── lib/            api.js (authenticated fetch), ui.js (shared styles)
│       ├── pages/          Feed, Discover, Connections, Messages, ChatBox, Profile, ...
│       └── index.css       Theme tokens: colours + font
├── server/                 Express API
│   ├── controllers/  routes/  models/  middleware/  utils/  inngest/  configs/
│   └── scripts/            Cloudinary test scripts, one-off migration
├── vercel.json             Static deployment of the client
└── package.json            Convenience scripts for running both apps
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- A MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account (free tier is fine)

### 2. Install

```bash
npm run install:all
```

### 3. Configure

Copy the two example files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

- `client/.env` - `VITE_CLERK_PUBLISHABLE_KEY` (leave `VITE_API_URL` empty in development)
- `server/.env` - `MONGODB_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the three `CLOUDINARY_*` values

> Both Clerk keys are needed on the server. The publishable key is the same one the client uses.

### 4. Run

```bash
npm run dev
```

The client runs on <http://localhost:5173> and forwards `/api` requests to the server on port 4000.

To check your Cloudinary setup: `cd server && npm run test:cloudinary`.

## Production

**One server (simplest).** Build the client, then start the server - it serves the built app and the API from the same address:

```bash
npm run build
npm start
```

**Client on Vercel, API elsewhere** (Render, Railway, ...):

1. Deploy `server/` and set `CLIENT_URL` to your Vercel URL (comma-separate several origins if needed).
2. On Vercel, set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (your API's URL, no trailing slash). `vercel.json` already installs the client and rewrites all routes to `index.html`.

### Optional: Clerk -> Inngest webhook

Linkly creates a user's profile automatically the first time they open the app, so the webhook is **not required**. If you want profiles created at sign-up (and removed when a Clerk account is deleted), connect Clerk to Inngest and point Inngest at `https://<your-api>/api/inngest`. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

### Upgrading from PingUp

The app was renamed from PingUp to Linkly. The database is still called `pingup` by default so nothing has to be migrated; set `MONGODB_DB_NAME` if you prefer another name. Existing profiles keep the old default bio - to update it once, run `cd server && npm run migrate:branding`.

## Making it your own

All colours and the font are defined in one place: the `@theme` block at the top of [`client/src/index.css`](client/src/index.css).

- `--color-brand-*` - primary colour (buttons, links, highlights)
- `--color-accent-*` - the second colour in gradients
- `--color-canvas` / `--color-ink` - page background and text
- `--font-sans` - the typeface (also change the Google Fonts `@import` on the first line)

The logo mark lives in `client/src/components/Logo.jsx` and `client/public/favicon.svg`.

## API

See [server/README.md](server/README.md) for the endpoint reference.

## License

MIT - see [LICENSE](LICENSE).
