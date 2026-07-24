import type { MetroConfig } from 'metro-config'

type Polyfills = {
    rem?: number
}

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
    federation?: {
        role: 'remote'
        id: string
    }
    polyfills?: Polyfills
    debug?: boolean
    isTV?: boolean
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
