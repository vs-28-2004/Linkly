# CLAUDE_PROGRESS.md - Linkly fix/finish/flavour task

> Resume rule: never restart from the beginning. Read this file, then continue at "NEXT".
> Working tree: /home/claude/Linkly-main (fresh extract of the uploaded zip + my edits).
> /home/claude/Linkly-prev-session = leftovers from an EARLIER session found in the workspace (reference only, untouched).
> Original upload /mnt/user-data/uploads/Linkly-main.zip is untouched = source of truth.

## Environment limits (affect verification)
- npm registry blocked (403) -> cannot `npm install`; no express/mongoose/vite/tailwind, no MongoDB/Clerk/Cloudinary.
- Available: node 22, esbuild (via tsx), global react/react-dom 19.2.5, Playwright + chromium (/opt/pw-browsers).
- So: syntax + import-graph checks (esbuild), pure-helper unit tests, and a browser smoke test with stand-ins for
  clerk/router/lucide/toast/moment. Server routes/queries and Tailwind CSS are NOT executable here.

## Checkpoint log
- [x] CP1 Audit of whole repo (bugs + unfinished features listed below)
- [x] CP2 Server rewrite: db, models, utils, middleware, all controllers/routes, inngest, server.js, .env.example, scripts
      - checked: `node --check` on all files, esbuild import graph OK, utils/text.js unit tests pass
- [x] CP3 Client foundation: index.html, favicon, vite proxy, index.css theme tokens ("flavour"), lib/{api,ui,useObjectUrl},
      context/{CurrentUserProvider,currentUserContext,useCurrentUser}; deleted src/assets (dummy data + big images) & vite.svg
- [x] CP4 Client components written: Logo, Avatar, Loading, EmptyState, ErrorBoundary, MenuItems, Sidebar, PostCard,
      UserCard, StoriesBar, StoryModal, StoryViewer, RecentMessages, SuggestedUsers, UserProfileInfo, ProfileModal
- [x] CP5 Client pages written: Layout, Login, Feed, CreatePost, PostPage, Discover, Connections, Messages, ChatBox
- [x] CP6 Profile.jsx, App.jsx (isLoaded gate, /post/:postId, catch-all), main.jsx (ErrorBoundary, afterSignOutUrl, missing-key screen) written
- [x] CP7 esbuild bundle of client OK (all files reachable); custom unused-import checker (/tmp/unused.mjs, validated w/ probe) = 0 issues
- [x] CP8 Browser smoke test 51/51 pass (harness /tmp/harness: smoke.cjs + mockapi.js + stubs; NOT shipped).
      Harness proven able to detect the original ProfileModal <input>-children crash. Test-only fixes made along the way:
      selector exactness, state-aware follow step, ignore fake img.test host. One real UI fix found by it: Connections tab label/count spacing.
      Covers: shell, feed, XSS, like/unlike, comments, delete, feed tabs, create post, discover+search+follow, connections
      (pending/accept/unfollow), messages+chat+polling, profile edit/likes/other-user, stories, deep link, auth header, console clean.
      NOT covered: real Clerk/router/Tailwind, real Express/Mongo server, Cloudinary, Inngest. with stubs (Playwright) - feed, like, comment, chat, profile edit, discover, connections
- [x] CP9 Root package.json scripts (start->npm start, install:all, dev via --prefix), vercel.json (install client, SPA rewrite); dependency lists verified identical to zip
- [x] CP10 (README.md + server/README.md rewritten) Docs: README.md (Linkly), server/README.md (new API), .gitignore check
- [x] CP11 Final review pass done. Found+fixed 2 server issues by re-reading: Story TTL index (expires:0 is ignored by Mongoose ->
      now explicit expireAfterSeconds:0) and Express 5 undefined req.body (guarded). Verified: 31/31 client API calls match server
      route+method; response field names consistent; no unused imports; client bundle OK; no dummy data / dangerouslySetInnerHTML left.
- [x] CP12 Packaged to /mnt/user-data/outputs/Linkly-main-fixed.zip (no node_modules). TASK COMPLETE - only follow-ups remain.

## Still unverified (cannot be run in this sandbox) - user should check locally
1. `npm run install:all` then `npm run dev` with real Clerk/Mongo/Cloudinary keys (server never executed)
2. Real Tailwind v4 rendering / layout (only behaviour tested, not visuals); real Clerk + React Router behaviour (stubs used)
3. Mongo query semantics (atomic like toggle, conversations $group aggregation, TTL index) - written carefully, not run
4. ESLint (not installed) - custom unused-import check only
5. lucide-react icon names (Newspaper, SearchX, Trash2, etc.) assumed present in 0.555

## Follow-ups to offer the user
- Ask what "my flavour" means to them (colours/font/name/tone) - defaults chosen are easy to swap in client/src/index.css
- images/*.png screenshots in repo show the OLD PingUp UI (README no longer references them)
- LICENSE still says "Copyright (c) 2025 PingUp" (left alone - user's legal text)
- @clerk/react (v6) in client deps is unused duplicate of @clerk/clerk-react (left: can't regenerate lockfile offline)
- Possible next features: delete/edit comments, block/report, push notifications, websocket chat


## Bugs found in original (all being fixed)
- Pages ran on dummy data (Layout, Sidebar, Connections, Discover, Messages, ChatBox, Stories, ProfileModal, PostCard, UserCard)
- middleware/clerkAuth.js used nonexistent clerkClient.verifyToken -> all /api/connections 401 (file deleted; one auth middleware)
- userController never wired; follow/message/story/profile routes trusted userId from request body (impersonation)
- POST /users/sync overwrote username/avatar on every load
- PostCard dangerouslySetInnerHTML = stored XSS
- ProfileModal: children inside <input> (React crash); UserProfileInfo Edit button never shown (!profileId always false)
- NavLink className callback treated object as boolean (all links looked active); `no-scrollbar` not defined in Tailwind v4
- StoryViewer: hooks after early return, undefined setViewStory; Messages: '...${id}' in single quotes + /message/ typo
- db.js: `${MONGODB_URL}/pingup` broke Atlas URLs with query strings; server swallowed DB failure
- server.js: "/" API banner shadowed the built client; SPA fallback after error handler; open uploads route
- Story model required `image` (no text stories); Inngest: "John null" names, username collisions, only create event
- vercel.json: client deps never installed, no SPA rewrite; root `start` ran nodemon
- Hard-coded http://localhost:4000 in client; fake "12k+ developers" claim; fake sponsored ad

## Decisions
- Name: Linkly everywhere. Kept Mongo db default "pingup" (MONGODB_DB_NAME) and Inngest app id "pingup-app" so existing data/deploys keep working.
- "Flavour" (user gave no specifics): sunset palette (burnt orange -> raspberry), Plus Jakarta Sans, warm canvas.
  All tokens in client/src/index.css @theme. ASK USER what they want changed.
- No new dependencies and package.json deps untouched (lockfiles can't be regenerated offline; `npm ci` stays valid).
- Connections = mutual follows; "Pending" = followers you don't follow back; Accept = follow back (no new schema).
- Chat = polling every 4s (serverless friendly), not websockets.
- Removed: server/uploadRoutes.js, models/Comment.js (unused), middleware/clerkAuth.js, client/src/assets/*
