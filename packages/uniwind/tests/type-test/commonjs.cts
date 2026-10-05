import { type ThemeName, Uniwind, useCSSVariable } from 'uniwind'
import { withUniwindConfig } from 'uniwind/metro'
import { uniwind } from 'uniwind/vite'

declare module 'uniwind' {
    export interface UniwindConfig {
        // Distinct themes ensure this consumer resolves its own declaration, rather than the ESM one.
        themes: readonly ['light', 'dark', 'commonjs']
    }
}

const theme: ThemeName = Uniwind.currentTheme
Uniwind.setTheme(theme)
Uniwind.setTheme('commonjs')

const variables: [string | number | undefined, string | number | undefined] = useCSSVariable(['--color-red-500', '--color-blue-500'])

// @ts-expect-error Unknown themes must be rejected, including if declarations fall back to any.
Uniwind.setTheme('missing-theme')

uniwind({ cssEntryFile: 'global.css' })

// @ts-expect-error The Vite adapter requires a CSS entry file.
uniwind({})

declare const metroConfig: Parameters<typeof withUniwindConfig>[0]
withUniwindConfig(metroConfig, { cssEntryFile: 'global.css' })

// @ts-expect-error The Metro adapter requires a CSS entry file.
withUniwindConfig(metroConfig, {})

void variables
