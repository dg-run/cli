import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// dg.run serves your app at the ROOT of its own address (https://your-app.example/), so `base` stays '/'.
// Don't output anything to a top-level `_dg`, `_next` or `_vercel` folder: those paths belong to the platform.
export default defineConfig({
  base: '/',
  plugins: [vue()],
})
