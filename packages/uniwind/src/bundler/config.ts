import { buildCSS } from '@/bundler/artifacts/css'
import { buildDtsFile } from '@/bundler/artifacts/dts'
import { UniwindCSSVisitor } from '@/bundler/css-visitor'
import type { UniwindConfig, UniwindMetroConfig } from '@/bundler/types'
import { Platform } from '@/common/consts'
import { isDefined } from '@/common/utils'
import path from 'path'

export class UniwindBundlerConfig {
    static fromMetroConfig(config: UniwindMetroConfig, platform?: string | null) {
        const getPlatform = () => {
            if (!isDefined(platform)) {
                return Platform.Native
            }

            if (!config.isTV) {
                return platform as Platform
            }

            if (platform === Platform.Android) {
                return Platform.AndroidTV
            }

            if (platform === Platform.iOS) {
                return Platform.AppleTV
            }

            throw new Error(`Platform ${platform} not supported`)
        }

        if (typeof config === 'undefined') {
            throw new Error('Uniwind: You need to pass second parameter to withUniwindConfig')
        }

        if (typeof config.cssEntryFile === 'undefined') {
            throw new Error(
                'Uniwind: You need to pass css css entry file to withUniwindConfig, e.g. withUniwindConfig(config, { cssEntryFile: "./global.css" })',
            )
        }

        return new UniwindBundlerConfig(config, getPlatform())
    }

    static fromViteConfig(config: UniwindConfig) {
        return new UniwindBundlerConfig(config, Platform.Web)
    }

    static fromCliConfig(config: UniwindConfig) {
        if (typeof config.cssEntryFile === 'undefined') {
            throw new Error(
                'Uniwind: You need to pass css entry file, e.g. uniwind generate-artifacts --css ./global.css. Run uniwind generate-artifacts --help for usage.',
            )
        }

        return new UniwindBundlerConfig(config, Platform.Web)
    }

    constructor(private readonly config: UniwindMetroConfig, readonly platform: Platform) {}

    get cssPath() {
        return path.join(process.cwd(), this.config.cssEntryFile)
    }

    get themes() {
        return Array.from(
            new Set([
                'light',
                'dark',
                ...this.config.extraThemes ?? [],
            ]),
        )
    }

    get cssVisitor() {
        return new UniwindCSSVisitor(this)
    }

    get polyfills() {
        return this.config.polyfills
    }

    get stringifiedThemes() {
        return `[${this.themes.map((theme) => `'${theme}'`).join(', ')}]`
    }

    toMetroConfig() {
        return this.config
    }

    async generateArtifacts(cssArtifactPath: string) {
        await buildCSS(this.themes, this.config.cssEntryFile, cssArtifactPath)
        buildDtsFile(this.config.dtsFile ?? 'uniwind-types.d.ts', this.stringifiedThemes)
    }
}
