import type { getWebStyles, getWebVariable } from '../../src/core/web/getWebStyles'

declare global {
    interface Window {
        __uniwind: {
            getWebStyles: typeof getWebStyles
            getWebVariable: typeof getWebVariable
        }
    }
}
