export type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
}

export type Polyfills = {
    rem?: number
}

export type UniwindMetroConfig = UniwindConfig & {
    polyfills?: Polyfills
    debug?: boolean
    isTV?: boolean
}
