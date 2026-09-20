import { StyleDependency } from '../../../src/common/consts'
import { UniwindListener } from '../../../src/core/listener'
import { UniwindStore } from '../../../src/core/native/store'

const resolveAtWidth = (className: string, width: number) => {
    UniwindStore.runtime.screen = { ...UniwindStore.runtime.screen, width }
    UniwindListener.notify([StyleDependency.Dimensions])

    return UniwindStore.getStyles(
        className,
        {},
        {},
        { scopedTheme: null, rtl: null, variables: null },
    ).styles
}

describe('media query boundaries', () => {
    const originalScreen = UniwindStore.runtime.screen

    afterEach(() => {
        UniwindStore.runtime.screen = originalScreen
        UniwindListener.notify([StyleDependency.Dimensions])
    })

    test.each([
        [389.99, { top: 0, right: 0, bottom: 1, left: 1 }],
        [390, { top: 0, right: 1, bottom: 0, left: 1 }],
        [390.01, { top: 1, right: 1, bottom: 0, left: 0 }],
    ])('resolves width %s', (width, expected) => {
        expect(resolveAtWidth('media-query-boundaries', width)).toMatchObject(expected)
    })

    test('resolves custom width media queries', () => {
        expect(resolveAtWidth('min-[50vw]:top-[1px]', 390)).toMatchObject({ top: 1 })
        expect(resolveAtWidth('min-[300px]:top-[1px]', 299.99)).toEqual({})
        expect(resolveAtWidth('min-[300px]:top-[1px]', 300)).toMatchObject({ top: 1 })
        expect(resolveAtWidth('max-[500px]:right-[1px]', 499.99)).toMatchObject({ right: 1 })
        expect(resolveAtWidth('max-[500px]:right-[1px]', 500)).toEqual({})
    })
})
