import type { StorybookConfig } from '@storybook/react-native-web-vite'
import { rnw } from 'vite-plugin-rnw'

const rnwPluginNames = new Set(
    rnw().flat(Infinity).flatMap((plugin) =>
        plugin && typeof plugin === 'object' && 'name' in plugin && typeof plugin.name === 'string'
            ? [plugin.name]
            : []
    ),
)

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    framework: '@storybook/react-native-web-vite',
    viteFinal(config) {
        const seen = new Set<string>()

        // @ts-expect-error excessively deep
        config.plugins = config.plugins?.flat(Infinity).filter((plugin) => {
            if (!plugin || typeof plugin !== 'object' || !('name' in plugin) || typeof plugin.name !== 'string') return true
            if (!rnwPluginNames.has(plugin.name)) return true
            if (seen.has(plugin.name)) return false

            seen.add(plugin.name)
            return true
        })

        return config
    },
}

export default config
