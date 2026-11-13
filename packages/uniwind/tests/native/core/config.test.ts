import { Uniwind } from '../../../src/core/config/config.native'
import { UniwindStore } from '../../../src/core/native'
import type { GenerateStyleSheetsCallback } from '../../../src/core/types'

type UniwindForTest = typeof Uniwind & {
    __reinit: (initialize: GenerateStyleSheetsCallback, themes: Array<string>, fingerprint?: string) => void
}

const uniwind = Uniwind as UniwindForTest
const generateStyles = () => ({ scopedVars: {}, stylesheet: {}, vars: {} })

describe('Uniwind native config', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('skips reinitialization when generated styles have not changed', () => {
        const reinit = jest.spyOn(UniwindStore, 'reinit')
        const initialize = jest.fn(generateStyles)

        uniwind.__reinit(initialize, ['light', 'dark'], 'unchanged-styles')
        uniwind.__reinit(initialize, ['light', 'dark'], 'unchanged-styles')

        expect(reinit).toHaveBeenCalledTimes(1)
    })

    test('reinitializes when generated styles change', () => {
        const reinit = jest.spyOn(UniwindStore, 'reinit')
        const initialize = jest.fn(generateStyles)

        uniwind.__reinit(initialize, ['light', 'dark'], 'styles-before')
        uniwind.__reinit(initialize, ['light', 'dark'], 'styles-after')

        expect(reinit).toHaveBeenCalledTimes(2)
    })

    test('retries the same generated styles after initialization fails', () => {
        const initialize = jest.fn(generateStyles)
        const reinit = jest
            .spyOn(UniwindStore, 'reinit')
            .mockImplementationOnce(() => {
                throw new Error('initialization failed')
            })

        expect(() => uniwind.__reinit(initialize, ['light', 'dark'], 'retry-styles')).toThrow(
            'initialization failed',
        )
        uniwind.__reinit(initialize, ['light', 'dark'], 'retry-styles')

        expect(reinit).toHaveBeenCalledTimes(2)
    })
    test('notifies the color scheme on every appearance change, also with a fixed theme', () => {
        jest.isolateModules(() => {
            const { Appearance } = require('react-native')
            const appearanceListeners: Array<(event: { colorScheme: string }) => void> = []

            jest.spyOn(Appearance, 'addChangeListener').mockImplementation(listener => {
                appearanceListeners.push(listener as (event: { colorScheme: string }) => void)

                return { remove: () => {} }
            })

            const { Uniwind: isolatedUniwind } = require('../../../src/core/config/config.native')
            const { UniwindListener } = require('../../../src/core/listener')
            const { StyleDependency } = require('../../../src/common/consts')
            const onColorScheme = jest.fn()

            isolatedUniwind.setTheme('light')
            UniwindListener.subscribe(onColorScheme, [StyleDependency.ColorScheme])
            appearanceListeners.forEach(listener => listener({ colorScheme: 'dark' }))

            expect(onColorScheme).toHaveBeenCalled()
        })
    })
})
