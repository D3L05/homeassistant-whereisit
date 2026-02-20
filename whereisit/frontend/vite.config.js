import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // Use relative paths for assets to support Ingress
    build: {
        outDir: 'dist',
    }
})
