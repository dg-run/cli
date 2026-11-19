# Templates

Starting points for apps on [dg.run](https://dg.run). Each folder is a complete, minimal project that already uses [`@dgrun/client`](../client): sign in and a private notes list with live updates.

| Template | Stack |
|---|---|
| [`react`](react) | React 19 + TypeScript + Vite |
| [`vue`](vue) | Vue 3 + TypeScript + Vite |
| [`vite`](vite) | TypeScript + Vite, no framework |

## Use one

```bash
npm create dg
```

It lists the folders here, asks which one you want, and copies it into the current folder. See [`cli`](../cli). To go without the CLI, copy a folder by hand.

## Adding a template

Add a folder here with its own `package.json`, a `build`/`pack` script that produces a zip dg.run accepts (`index.html` at the root, no top-level `_dg` or `_next` folder) and a README. The CLI picks it up from GitHub automatically: it lists every folder in `templates/` that doesn't start with `.` or `_`. Give it a friendlier name in `cli/src/config.ts` (`TEMPLATE_LABELS`) if you like.

## Working on the templates in this repo

They depend on the published `@dgrun/client`. To try them against your local copy before it is published:

```bash
cd client && npm install && npm pack          # makes dgrun-client-<version>.tgz
cd ../templates/react
npm install ../../client/dgrun-client-*.tgz
npm run pack
```
