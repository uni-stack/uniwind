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
})
