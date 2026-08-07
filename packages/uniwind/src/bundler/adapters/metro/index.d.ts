import type { MetroConfig } from 'metro-config'

type Polyfills = {
    rem?: number
}

type UniwindFederationConfig =
    | {
        role: 'host'
        sharedClassNames?: ReadonlyArray<string>
    }
    | {
        role: 'remote'
        id: string
        sharedClassNames?: ReadonlyArray<string>
    }

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
    federation?: UniwindFederationConfig
    polyfills?: Polyfills
    debug?: boolean
    isTV?: boolean
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
