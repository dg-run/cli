# Vite + dg.run

A minimal Vite + TypeScript (no framework) app that uses [`@dgrun/client`](https://www.npmjs.com/package/@dgrun/client): sign in with dg and keep private notes in the built-in database, with live updates across tabs. There is no server of your own to write or run.

## Run it

```bash
npm install
npm run dev      # the page, with hot reload
```

dg.run provides the backend (`/_dg/*`) on **your app's own address**, so sign-in and the database work once the app is uploaded. Under `npm run dev` the page runs, but calls to the backend fail and the app shows a short error. Upload to try the real thing.

## Publish it

```bash
npm run pack     # type-checks, builds, and writes <name>.zip
```

Upload the zip in **My apps** on dg.run. It gets a private sandbox address to test on, and you submit it for review when you are happy. See [Getting started](https://dg.run/docs/getting-started).

## Where things are

| File | What it does |
|---|---|
| `src/dg.ts` | Creates the one `dg` client and the typed `notes` collection. |
| `src/notes-app.ts` | `NotesApp`: a class that owns the DOM, follows the user and keeps the notes live. |
| `src/main.ts` | Starts it. |
| `public/manifest.webmanifest` | App name, description and icon shown on dg.run. Edit these. |
| `vite.config.ts` | `base: '/'`: dg.run serves each app at the root of its own address. |
| `scripts/pack.mjs` | Zips `dist/` for upload. |

## Next steps

- Make the collection shared: `dg.db.collection<Note>('notes', 'public')` (everyone can read, only the creator changes).
- Rules per collection, remote config, logs and subscriptions are all on the same `dg` client. See the [client docs](https://www.npmjs.com/package/@dgrun/client).
- Change the manifest's `name` and replace `public/favicon.svg` with your own icon.
