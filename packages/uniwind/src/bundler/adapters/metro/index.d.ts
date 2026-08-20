import type { MetroConfig } from 'metro-config'

type Polyfills = {
    rem?: number
}

type ExperimentalOptions = {
    /**
     * Rewrites statically classless React Native elements to raw components.
     * @default false
     */
    optimizeClasslessComponents?: boolean
}

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
    polyfills?: Polyfills
    debug?: boolean
    isTV?: boolean
    experimental?: ExperimentalOptions
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
