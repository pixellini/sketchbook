import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
    base: '/astronauts/',
    plugins: [deno()],
    server: {
        port: 8080,
        open: false,
    },
    build: {
        // PixiJS is large by default. Increasing this removes the build warnings.
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // If the file comes from node_modules, put it in a separate chunk
                    if (id.includes('node_modules')) {
                        if (id.includes('pixi.js')) {
                            return 'vendor_pixi';
                        }
                        if (id.includes('gsap')) {
                            return 'vendor_gsap';
                        }
                        return 'vendor'; // All other small libs
                    }
                }
            }
        }
    }
})
