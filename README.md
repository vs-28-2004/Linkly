<div align="center">

# Linkly

**Your people, one link away.**

A full-stack social app: post, follow, comment, share stories that vanish after 24 hours, and chat one-to-one.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47a248?logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6c47ff)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

</div>

<!-- Add screenshots here, e.g.
![Feed](docs/feed.png)
-->

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Customising the look](#customising-the-look)
- [API reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## Features

| | |
| --- | --- |
| **Accounts** | Sign in with Clerk (email and any social logins you enable). A profile is created automatically on first sign-in. |
| **Profiles** | Avatar, cover photo, bio, location and username, all editable in the app. |
| **Posts** | Text plus up to 4 photos, likes, comments, delete your own, and a share link (`/post/<id>`). |
| **Feed** | *Everyone* / *Following* switch with "Load more" pagination. |
| **Network** | Follow people. **Connections** are mutual follows; **Pending** are people who follow you that you haven't followed back, so **Accept** = follow back. |
| **Discover** | Live search by name, username, bio or location, plus follow buttons. |
| **Stories** | Text stories with a background colour, or a photo/video. They disappear after 24 hours. |
| **Messages** | One-to-one chat with text and images, unread badges, and new messages appear automatically. |

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 19, Vite, Tailwind CSS 4, React Router 7, Lucide icons |
| Server | Node.js, Express 5, MongoDB with Mongoose |
| Auth | [Clerk](https://clerk.com) (`@clerk/clerk-react`, `@clerk/express`) |
| Media | [Cloudinary](https://cloudinary.com) (images and story videos) |
| Background jobs | [Inngest](https://www.inngest.com) *(optional)*: syncs Clerk sign-ups, updates and deletions |

## Project structure

```
Linkly/
├── client/                    React app (Vite)
│   ├── public/                Favicon
│   └── src/
│       ├── components/        PostCard, Sidebar, StoriesBar, Avatar, ...
│       ├── context/           CurrentUserProvider: signed-in user, follow helpers, unread count
│       ├── lib/               api.js (authenticated fetch), ui.js (shared styles)
│       ├── pages/             Feed, Discover, Connections, Messages, ChatBox, Profile, ...
│       └── index.css          Theme tokens (colours + font)
├── server/                    Express API
│   ├── configs/               Database connection
│   ├── controllers/           Request handlers
│   ├── inngest/               Clerk webhook functions
│   ├── middleware/            auth, uploads (multer), validation
│   ├── models/                User, Post, Message, Story
│   ├── routes/                Route definitions
│   ├── scripts/               Cloudinary checks, one-off migration
│   └── utils/                 Cloudinary upload, user bootstrap, helpers
├── vercel.json                Static deployment of the client
└── package.json               Scripts that run both apps together
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB database: local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account (the free tier is enough)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/Linkly.git
cd Linkly
npm run install:all
```

### 2. Configure

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in both files (see [Environment variables](#environment-variables)).

> **Important:** the server needs **both** Clerk keys, and they must come from the **same Clerk application** as the key in `client/.env`.

### 3. Run

```bash
npm run dev
```

- Client: <http://localhost:5173>
- API: <http://localhost:4000> (the client forwards `/api` requests here automatically)

Optionally verify your Cloudinary credentials:

```bash
cd server && npm run test:cloudinary
```

## Environment variables

### `server/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `MONGODB_URL` | yes | MongoDB connection string. Don't append a database name. |
| `CLERK_PUBLISHABLE_KEY` | yes | Clerk publishable key (`pk_test_...` / `pk_live_...`) |
| `CLERK_SECRET_KEY` | yes | Clerk secret key (`sk_test_...` / `sk_live_...`) |
| `CLOUDINARY_CLOUD_NAME` | yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | yes | Cloudinary API secret |
| `PORT` | no | Defaults to `4000` |
| `CLIENT_URL` | no | Comma-separated allowed front-end origins. Empty allows any origin (fine for development). |
| `MONGODB_DB_NAME` | no | Defaults to `pingup`, the name used before the rename |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | no | Only for the Clerk webhook sync |

### `client/.env`

| Variable | Required | Description |
| --- | :---: | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | yes | The same publishable key the server uses |
| `VITE_API_URL` | no | Leave empty in development. Set to your API's URL (no trailing slash) if the API is on a different domain. |

## Scripts

Run from the repository root:

| Command | What it does |
| --- | --- |
| `npm run install:all` | Installs root, client and server dependencies |
| `npm run dev` | Starts client and server together |
| `npm run dev:client` / `npm run dev:server` | Starts just one of them |
| `npm run build` | Builds the client into `client/dist` |
| `npm start` | Starts the server in production mode (serves `client/dist` too, if it exists) |

Server-only (`cd server`): `npm run test:cloudinary`, `npm run test:upload`, `npm run migrate:branding`.

## Deployment

### Option A: one server (simplest)

```bash
npm run build
npm start
```

The Express server serves the built client and the API from the same address, so leave `VITE_API_URL` empty.

### Option B: client on Vercel, API elsewhere (Render, Railway, ...)

1. Deploy `server/` and set `CLIENT_URL` to your Vercel URL.
2. In Vercel, set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` (your API URL, no trailing slash).

`vercel.json` already installs the client's dependencies, builds it, and rewrites every path to `index.html` so direct links like `/profile/...` work.

### Optional: Clerk to Inngest webhook

Linkly creates a profile the first time someone opens the app, so the webhook is **not required**. Connect it only if you want profiles created at sign-up and removed when a Clerk account is deleted: point Inngest at `https://<your-api>/api/inngest` and set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY`.

### Coming from PingUp?

This project was renamed. The database keeps its old name by default, so there is nothing to migrate. Old profiles still have the previous default bio; update it once with `cd server && npm run migrate:branding`.

## Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| **"We couldn't load your account: Please sign in to continue"** | The server rejected your Clerk token. Check that `server/.env` has **both** `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, that they belong to the **same Clerk app** as `VITE_CLERK_PUBLISHABLE_KEY` (same `pk_test`/`pk_live` type), and **restart the server** after editing `.env`. |
| **"Can't reach the server"** | The API isn't running, or `VITE_API_URL` points somewhere else. In development leave it empty and run `npm run dev`. |
| **"Linkly is not configured yet"** | `client/.env` is missing `VITE_CLERK_PUBLISHABLE_KEY`. Restart the dev server after adding it. |
| **Server exits with "Could not connect to MongoDB"** | Wrong `MONGODB_URL`, or your IP isn't allowed in Atlas Network Access. |
| **Uploads fail** | Missing or wrong `CLOUDINARY_*` values. Run `npm run test:cloudinary` in `server/`. |
| **CORS errors in the browser** | When the client and API are on different domains, set `CLIENT_URL` on the server to the client's exact origin. |
| **"That username is already taken"** | Usernames are unique. Pick another one. |

## Customising the look

Colours and the font are defined in one place: the `@theme` block at the top of [`client/src/index.css`](client/src/index.css).

- `--color-brand-*`: primary colour (buttons, highlights)
- `--color-accent-*`: second colour of the gradients
- `--color-canvas` and `--color-ink`: page background and text
- `--font-sans`: typeface (also change the Google Fonts `@import` on the first line)

The logo lives in `client/src/components/Logo.jsx` and `client/public/favicon.svg`.

## API reference

Every endpoint except `/api/health` and `/api/inngest` requires a signed-in Clerk user (`Authorization: Bearer <session token>`). The full endpoint list, request formats and data models are in [server/README.md](server/README.md).

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch: `git checkout -b feature/my-feature`
2. Make your changes and check that `npm run build` succeeds
3. Commit, push, and open a pull request describing what you changed and why

## License

Released under the [MIT License](LICENSE).
