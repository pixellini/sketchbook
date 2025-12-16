import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
    base: '/astronauts/',
    plugins: [deno()],
    server: {
        port: 8080,
        open: true,
    },
})
