import type { Plugin } from 'vite'

type UniwindConfig = {
    cssEntryFile: string
    extraThemes?: Array<string>
    dtsFile?: string
}

export declare function uniwind(config: UniwindConfig): Plugin
