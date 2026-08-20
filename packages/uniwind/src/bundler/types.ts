export type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
}

export type Polyfills = {
    rem?: number
}

export type ExperimentalMetroOptions = {
    optimizeClasslessComponents?: boolean
}

export type UniwindMetroConfig = UniwindConfig & {
    polyfills?: Polyfills
    debug?: boolean
    isExpoProject?: boolean
    isTV?: boolean
    experimental?: ExperimentalMetroOptions
}
