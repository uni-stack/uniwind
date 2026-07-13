import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import { uniwind } from 'uniwind/vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    framework: '@storybook/react-vite',
    viteFinal(config) {
        config.plugins ??= []
        config.plugins.push(
            tailwindcss(),
            uniwind({
                cssEntryFile: '../src/App.css',
                extraThemes: ['premium'],
            }),
        )

        return config
    },
}

export default config
