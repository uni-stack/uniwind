import { UniwindBundlerConfig } from '../../../src/bundler/config'
import { compileNativeCSS } from '../../../src/bundler/css-compiler/compileNativeCSS'
import { Platform } from '../../../src/common/consts'
import { Logger } from '../../../src/core/logger'
import { UniwindStore } from '../../../src/core/native'
import type { GenerateStyleSheetsCallback, UniwindContextType } from '../../../src/core/types'

const context = {
    rtl: null,
    scopedTheme: null,
} satisfies UniwindContextType

const compileRegistration = (css: string, federated: boolean): GenerateStyleSheetsCallback => {
    const config = UniwindBundlerConfig.fromMetroConfig(
        {
            cssEntryFile: './unused.css',
            ...(federated
                ? {
                    federation: {
                        role: 'remote' as const,
                        id: 'remote-a',
                    },
                }
                : {}),
        },
        Platform.iOS,
    )
    const virtualCode = compileNativeCSS(config, css)

    return rt => {
        // oxlint-disable-next-line no-eval
        return eval(`(${virtualCode})`)
    }
}

describe('federated native CSS', () => {
    test('resolves host-owned runtime globals without remote conflicts', () => {
        const warn = jest.spyOn(Logger, 'warn').mockImplementation()

        UniwindStore.reinit(compileRegistration('', false), ['light', 'dark'])
        const dispose = UniwindStore.merge(
            'remote-a',
            compileRegistration('.runtime-globals { color: currentColor; width: 1em; }', true),
            ['light', 'dark'],
        )

        expect(UniwindStore.getStyles('runtime-globals', undefined, undefined, context).styles).toMatchObject({
            color: '#000000',
            width: 16,
        })
        expect(warn).not.toHaveBeenCalled()

        dispose()
        warn.mockRestore()
    })
})
