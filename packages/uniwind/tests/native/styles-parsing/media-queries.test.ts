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

const resolveAtSize = (className: string, width: number, height: number) => {
    UniwindStore.runtime.screen = { ...UniwindStore.runtime.screen, width, height }
    UniwindListener.notify([StyleDependency.Dimensions])

    return UniwindStore.getStyles(
        className,
        {},
        {},
        { scopedTheme: null, rtl: null, variables: null },
    ).styles
}

describe('height media queries', () => {
    const originalScreen = UniwindStore.runtime.screen

    afterEach(() => {
        UniwindStore.runtime.screen = originalScreen
        UniwindListener.notify([StyleDependency.Dimensions])
    })

    test.each([
        [699.99, { top: 0, right: 0, bottom: 1, left: 1 }],
        [700, { top: 0, right: 1, bottom: 0, left: 1 }],
        [700.01, { top: 1, right: 1, bottom: 0, left: 0 }],
    ])('resolves height %s independently of width', (height, expected) => {
        expect(resolveAtSize('height-query-boundaries', 390, height)).toMatchObject(expected)
        expect(resolveAtSize('height-query-boundaries', 1000, height)).toMatchObject(expected)
    })

    test('resolves custom min/max-height variants and invalidates cached styles on resize', () => {
        expect(resolveAtSize('tall:top-[1px] compact:right-[1px]', 390, 699)).toEqual({ right: 1 })
        expect(resolveAtSize('tall:top-[1px] compact:right-[1px]', 390, 700)).toEqual({ top: 1, right: 1 })
        expect(resolveAtSize('tall:top-[1px] compact:right-[1px]', 390, 701)).toEqual({ top: 1 })
        expect(resolveAtSize('tall:top-[1px] compact:right-[1px]', 390, 699)).toEqual({ right: 1 })
    })

    test('resolves viewport-relative height bounds', () => {
        expect(resolveAtSize('height-relative-query', 400, 400)).toEqual({})
        expect(resolveAtSize('height-relative-query', 400, 400.01)).toEqual({ top: 1 })
        expect(resolveAtSize('height-relative-query', 401, 400.01)).toEqual({})
        expect(resolveAtSize('height-self-relative', 390, 400)).toEqual({})
        expect(resolveAtSize('height-self-relative', 390, 1000)).toEqual({})
    })

    test('resolves em height bounds against the initial font size', () => {
        expect(resolveAtSize('height-em-query height-em-max-query', 390, 639)).toEqual({ right: 1 })
        expect(resolveAtSize('height-em-query height-em-max-query', 390, 640)).toEqual({ top: 1, right: 1 })
        expect(resolveAtSize('height-em-query height-em-max-query', 390, 641)).toEqual({ top: 1 })
    })

    test.each([
        'taller:top-[2px] dark:tall:top-[1px]',
        'dark:tall:top-[1px] taller:top-[2px]',
    ])('keeps theme specificity ahead of height in %s', className => {
        resolveAtSize('', 390, 900)
        expect(UniwindStore.getStyles(className, {}, {}, { scopedTheme: 'dark', rtl: null, variables: null }).styles)
            .toEqual({ top: 1 })
    })

    test.each([
        'taller:top-[2px] tall:top-[1px]!',
        'tall:top-[1px]! taller:top-[2px]',
    ])('keeps important declarations ahead of height in %s', className => {
        expect(resolveAtSize(className, 390, 900)).toEqual({ top: 1 })
    })

    test('requires both width and height constraints to match', () => {
        expect(resolveAtSize('wide-and-tall', 499, 800)).toEqual({})
        expect(resolveAtSize('wide-and-tall', 600, 699)).toEqual({})
        expect(resolveAtSize('wide-and-tall', 600, 800)).toEqual({ top: 1 })
    })

    test('prefers the taller minimum-height breakpoint regardless of class order', () => {
        expect(resolveAtSize('tall:top-[1px] taller:top-[2px]', 390, 900)).toEqual({ top: 2 })
        expect(resolveAtSize('taller:top-[2px] tall:top-[1px]', 390, 900)).toEqual({ top: 2 })
    })

    test('keeps max-height variants more specific than unconditional utilities', () => {
        expect(resolveAtSize('top-[2px] compact:top-[1px]', 390, 699)).toEqual({ top: 1 })
        expect(resolveAtSize('compact:top-[1px] top-[2px]', 390, 699)).toEqual({ top: 1 })
        expect(resolveAtSize('compact:top-[1px] top-[2px]', 390, 701)).toEqual({ top: 2 })
    })

    test('supports exact heights and intersects multiple height constraints', () => {
        expect(resolveAtSize('exact-height', 390, 699.99)).toEqual({})
        expect(resolveAtSize('exact-height', 390, 700)).toEqual({ top: 1 })
        expect(resolveAtSize('exact-height', 390, 700.01)).toEqual({})
        expect(resolveAtSize('height-intersection', 390, 750)).toEqual({})
        expect(resolveAtSize('height-intersection', 390, 800)).toEqual({ top: 1 })
    })

    test.each([
        [600, {}],
        [600.01, { top: 1 }],
        [800, { top: 1 }],
        [800.01, {}],
    ])('resolves height intervals at %s', (height, expected) => {
        expect(resolveAtSize('height-interval', 390, height)).toEqual(expected)
    })

    test('keeps height conditions when stacked with a platform variant', () => {
        expect(resolveAtSize('ios:tall:right-[1px] android:tall:left-[1px]', 390, 699)).toEqual({})
        expect(resolveAtSize('ios:tall:right-[1px] android:tall:left-[1px]', 390, 700)).toEqual({ right: 1 })
    })
})

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

describe('media blocks shared by multiple utilities', () => {
    const originalScreen = UniwindStore.runtime.screen

    afterEach(() => {
        UniwindStore.runtime.screen = originalScreen
        UniwindListener.notify([StyleDependency.Dimensions])
    })

    test('keeps every utility of a platform block on its platform', () => {
        expect(resolveAtWidth('ios-block-first', 390)).toMatchObject({ paddingTop: 1 })
        expect(resolveAtWidth('ios-block-second', 390)).toMatchObject({ paddingTop: 2 })
        expect(resolveAtWidth('android-block-first', 390)).toEqual({})
        expect(resolveAtWidth('android-block-second', 390)).toEqual({})
    })

    test('keeps every utility of a width block behind its breakpoint', () => {
        expect(resolveAtWidth('wide-block-first', 390)).toEqual({})
        expect(resolveAtWidth('wide-block-second', 390)).toEqual({})
        expect(resolveAtWidth('wide-block-first', 500)).toMatchObject({ paddingTop: 4 })
        expect(resolveAtWidth('wide-block-second', 500)).toMatchObject({ paddingTop: 5 })
    })

    test('keeps media rules nested inside a class rule attached to the class', () => {
        expect(resolveAtWidth('nested-mq', 390)).toMatchObject({ paddingTop: 6 })
        expect(resolveAtWidth('nested-mq', 500)).toMatchObject({ paddingTop: 7 })
    })
})
