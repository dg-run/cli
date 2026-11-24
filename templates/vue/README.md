# Vue + dg.run

A minimal Vue 3 + TypeScript app that uses [`dgclient`](https://www.npmjs.com/package/dgclient): sign in with dg and keep private notes in the built-in database, with live updates across tabs. There is no server of your own to write or run.

## Run it

```bash
npm install
npm run dev      # the page, with hot reload
```

If you answered **yes** to "Use the dg.run backend in dev mode?" when you ran `npm create dg`, `npm run dev` uses the **real backend** (sign-in, database, realtime) on a private dev sandbox in your account: your dev server proxies `/_dg/*` to it, and the link is kept in `.dg/dev.json` (git-ignored). Click **Sign in with dg**, add a note, open a second tab and watch it appear.

Without dev mode the page runs but calls to the backend fail and the app shows a short error. Set it up any time with `npm run dg:sandbox`. How it works and its limits: [dev mode](https://dg.run/docs/dev-mode).

## Publish it

```bash
npm run publish   # packs, then uploads the build to your dg.run account
npm run pack      # only type-checks, builds, and writes <name>.zip
```

`npm run publish` shows a login link: open it, check the code and allow. The build lands in your **sandbox** (on your dev sandbox if you have one, and a later run uploads a new build of the same app). It prints a private address to test it on; the app is linked in `.dg/app.json` (git-ignored). Use `-- --new` to upload as a new app instead. Then request a review in **My apps**.

Or upload the zip by hand in **My apps** on dg.run: click **Upload new build** on your dev sandbox's card (or drop it in the upload box if you have no dev sandbox). It gets a private sandbox address to test the real build on, and you request a review when you are happy. See [Start your first app](https://dg.run/docs/getting-started).

## If the build is blocked on Windows

Some Windows machines run an Application Control policy (Smart App Control, WDAC) that refuses to load unsigned native files, which breaks `vite build` with `An Application Control policy has blocked this file ... rollup.win32-x64-msvc.node`. This template already avoids it: `package.json` has an `overrides` block that swaps Rollup and esbuild for their WebAssembly builds, which need no native files.

On a machine without that restriction you can delete the `overrides` block and run `npm install` again for the native (somewhat faster) builds.

## Where things are

| File | What it does |
|---|---|
| `src/dg.ts` | Creates the one `dg` client and the typed `notes` collection. |
| `src/main.ts` | Installs `createDgPlugin(dg)`, which gives every composable the client. |
| `src/errors.ts` | `errorText`: a readable message for any `DgError`. |
| `src/App.vue` | The screen: sign in, add, delete, list. Built with `useUser` and `useCollection` from `dgclient/vue`. |
| `public/manifest.webmanifest` | App name, description and icon shown on dg.run. Edit these. |
| `vite.config.ts` | `base: '/'` (dg.run serves each app at the root of its own address) and `dgDev()`, the dev proxy. |
| `.dg/dev.json` | Links this project to your dev sandbox (made by `create-dg`, git-ignored). |
| `.dg/app.json` | Which app `npm run publish` uploads to (made by the first upload, git-ignored). |
| `scripts/pack.mjs` | Zips `dist/` for upload. |

## Next steps

- Make the collection shared: `dg.db.collection<Note>('notes', 'public')` (everyone can read, only the creator changes).
- The same package has `useConfig`, `useFlag`, `useBilling`, `useTheme`, `useI18n`, `useLive` and `useRealtimeStatus`: `import { useFlag } from 'dgclient/vue'`.
- Rules per collection, remote config, logs and subscriptions are all on the same `dg` client. See the [client docs](https://www.npmjs.com/package/dgclient).
- Change the manifest's `name` and replace `public/favicon.svg` with your own icon.
