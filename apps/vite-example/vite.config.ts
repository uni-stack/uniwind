import { uniwind } from '@niibase/uniwind/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { rnw } from 'vite-plugin-rnw'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        rnw(),
        tailwindcss(),
        uniwind({
            cssEntryFile: './src/App.css',
            extraThemes: ['premium'],
        }),
    ],
})
