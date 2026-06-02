import type { MetroConfig } from 'metro-config'

type Experimental = {
    thirdPartyModules?: {
        expoUI?: boolean
    }
}

type Polyfills = {
    rem?: number
}

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
    polyfills?: Polyfills
    debug?: boolean
    isTV?: boolean
    experimental?: Experimental
}

export declare function withUniwindConfig(config: MetroConfig, options: UniwindConfig): MetroConfig
