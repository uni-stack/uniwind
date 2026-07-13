import tailwindcss from '@tailwindcss/vite'
import { uniwind } from 'uniwind/vite'
import { defineConfig } from 'vite'
import { rnw } from 'vite-plugin-rnw'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        // Storybook's React Native Web framework configures this plugin itself.
        process.env.STORYBOOK !== '1' && rnw(),
        tailwindcss(),
        uniwind({
            cssEntryFile: './src/App.css',
            extraThemes: ['premium'],
        }),
    ],
})
