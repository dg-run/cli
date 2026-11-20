import { defineConfig } from 'vite'
import { dgDev } from 'dgclient/vite'
import vue from '@vitejs/plugin-vue'

// dg.run serves your app at the ROOT of its own address (https://your-app.example/), so `base` stays '/'.
// In `npm run dev`, dgDev() proxies /_dg/* (sign-in, database, realtime) to your dev sandbox on dg.run, set up by `npm create dg` (.dg/dev.json).
// Without that file it does nothing. Don't output anything to a top-level `_dg`, `_next` or `_vercel` folder: those paths belong to the platform.
export default defineConfig({
  base: '/',
  plugins: [vue(), dgDev()],
})
