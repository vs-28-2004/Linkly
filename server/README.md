# Linkly API

Express + MongoDB REST API. Every endpoint except `/api/health` and `/api/inngest` requires a signed-in Clerk user.

## Environment

See [`.env.example`](.env.example) for the full list.

| Variable | Notes |
| --- | --- |
| `MONGODB_URL` | Plain or Atlas URI. Don't append a database name. |
| `MONGODB_DB_NAME` | Optional, defaults to `Linkly` (the name used before the rebrand). |
| `PORT` | Defaults to `4000`. |
| `CLIENT_URL` | Optional, comma-separated allowed front-end origins. Empty allows any origin. |
| `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Required. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Required for uploads. |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Optional (Clerk webhook sync). |

## Scripts

```bash
npm run dev               # nodemon
npm start                 # node (production)
npm run test:cloudinary   # checks your Cloudinary credentials
npm run migrate:branding  # one-off: old default bio -> Linkly bio
```

## Authentication

Send the Clerk session token with every request:

```
Authorization: Bearer <clerk_session_token>
```

The user making the request is always taken from the token - never from the request body. A Linkly profile is created automatically the first time a signed-in user calls the API.

## Response format

Successful responses contain `"success": true` plus the data. Errors look like:

```json
{ "success": false, "message": "Human readable description" }
```

Status codes used: `200`, `201`, `400` (bad input), `401` (not signed in), `403` (not allowed), `404`, `409` (e.g. username taken), `502` (upload failed), `500`.

## Endpoints

### Health

- `GET /api/health` - `{ success: true, status: "ok" }` (no auth)

### Users

- `POST /api/users/sync` - returns the signed-in user's profile (creating it on first call). Never overwrites edits.
- `GET /api/users/me` - your profile (includes email)
- `GET /api/users/:userId` - a user's profile (`followers` / `following` are arrays of user ids)
- `PUT /api/users/profile` - `multipart/form-data`: `full_name`, `username`, `bio`, `location`, `profile_picture` (file), `cover_photo` (file). All optional. Usernames are 3-30 chars of `a-z 0-9 _ .` and must be unique (`409` if taken).
- `GET /api/users/search?query=...` - users matching name, username, bio or location (max 20)
- `GET /api/users/all?limit=20&exclude_following=1` - users for Discover / suggestions (`limit` max 50)

User lists return cards: `_id, full_name, username, profile_picture, bio, location, followers_count`.

### Posts

- `POST /api/posts` - `multipart/form-data`: `content` (max 2000 chars), `images` (up to 4 files, 8 MB each). Needs text or at least one image.
- `GET /api/posts?feed=all|following&limit=20&skip=0` - newest first. Returns `{ posts, hasMore }`. `following` = you + people you follow.
- `GET /api/posts/user/:userId` - a user's posts (same pagination)
- `GET /api/posts/liked/:userId` - posts a user has liked (same pagination)
- `GET /api/posts/:postId` - one post with comment authors
- `DELETE /api/posts/:postId` - owner only
- `POST /api/posts/:postId/like` - toggles; returns `{ liked, likes, likes_count }`
- `POST /api/posts/:postId/comment` - body `{ "text": "..." }` (max 500 chars); returns the new `comment` and `comments_count`

### Connections

- `POST /api/connections/follow/:userId`
- `DELETE /api/connections/unfollow/:userId`
- `GET /api/connections/followers/:userId`
- `GET /api/connections/following/:userId`
- `GET /api/connections` - connections = mutual follows
- `GET /api/connections/pending` - people who follow you that you don't follow back

Follow and unfollow are idempotent.

### Messages

- `POST /api/messages` - `multipart/form-data`: `receiver`, `content` (max 2000), `image` (one file, 5 MB)
- `GET /api/messages/conversations` - one row per person: `{ user, last_message, unread }`
- `GET /api/messages/conversation/:userId` - latest 200 messages, oldest first; marks their messages to you as read
- `GET /api/messages/unread-count` - `{ count }`

### Stories

- `POST /api/stories` - `multipart/form-data`: `content` (max 500), `background_color` (`#rrggbb`, for text stories), `media` (image or video, 30 MB). Needs text or media.
- `GET /api/stories` - live stories from you and people you follow
- `POST /api/stories/:storyId/view` - records a view (not counted for your own stories)

Stories are removed automatically by MongoDB 24 hours after creation (TTL index).

### Inngest

- `/api/inngest` - webhook endpoint for the `clerk/user.created`, `clerk/user.updated` and `clerk/user.deleted` functions.

## Data models

```js
User    { _id (Clerk id), email, full_name, username, bio, profile_picture, cover_photo, location,
          followers: [id], following: [id], createdAt, updatedAt }
Post    { user, content, image_urls: [url], post_type, likes: [id], comments: [{ user, text, createdAt }],
          likes_count, comments_count, createdAt, updatedAt }
Message { sender, receiver, content, media_url, message_type, read, createdAt }
Story   { user, content, media_url, media_type: text|image|video, background_color, views: [id], expiresAt, createdAt }
```
