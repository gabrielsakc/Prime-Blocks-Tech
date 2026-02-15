import { defineConfig } from 'vite'

export default defineConfig({
    base: './', // Crucial for Electron to load assets correctly in production
})
