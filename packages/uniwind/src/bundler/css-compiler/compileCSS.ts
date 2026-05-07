import { Platform } from '@/common/consts'
import type { UniwindBundlerConfig } from '../config'
import { compileNativeCSS } from './compileNativeCSS'
import { compileTailwind } from './compileTailwind'
import { compileWebCSS } from './compileWebCSS'

export const compileCSS = async (bundlerConfig: UniwindBundlerConfig) => {
    const tailwindCSS = await compileTailwind(bundlerConfig)

    if (bundlerConfig.platform === Platform.Web) {
        return compileWebCSS(bundlerConfig, tailwindCSS)
    }

    return compileNativeCSS(bundlerConfig, tailwindCSS)
}
