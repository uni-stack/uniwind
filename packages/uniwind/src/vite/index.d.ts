import type { Plugin } from 'vite'

type UniwindConfig = {
    extraThemes?: Array<string>
    dtsFile?: string
}

declare function uniwind(config?: UniwindConfig): Plugin
export default uniwind
