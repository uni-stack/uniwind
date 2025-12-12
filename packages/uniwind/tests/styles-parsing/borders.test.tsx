import * as React from 'react'
import View from '../../src/components/native/View'
import { TW_RED_500 } from '../consts'
import { renderUniwind } from '../utils'

describe('Borders', () => {
    test('Border Width', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="border" testID="border" />
                <View className="border-0" testID="border-0" />
                <View className="border-2" testID="border-2" />
                <View className="border-4" testID="border-4" />
                <View className="border-t" testID="border-t" />
                <View className="border-r-2" testID="border-r-2" />
                <View className="border-b-4" testID="border-b-4" />
                <View className="border-l-8" testID="border-l-8" />
                <View className="border-x-2" testID="border-x-2" />
                <View className="border-y-4" testID="border-y-4" />
            </React.Fragment>,
        )

        expect(getStylesFromId('border').borderTopWidth).toBe(1)
        expect(getStylesFromId('border').borderBottomWidth).toBe(1)
        expect(getStylesFromId('border').borderLeftWidth).toBe(1)
        expect(getStylesFromId('border').borderRightWidth).toBe(1)

        expect(getStylesFromId('border-0').borderTopWidth).toBe(0)
        expect(getStylesFromId('border-2').borderTopWidth).toBe(2)
        expect(getStylesFromId('border-4').borderTopWidth).toBe(4)

        expect(getStylesFromId('border-t').borderTopWidth).toBe(1)
        expect(getStylesFromId('border-r-2').borderRightWidth).toBe(2)
        expect(getStylesFromId('border-b-4').borderBottomWidth).toBe(4)
        expect(getStylesFromId('border-l-8').borderLeftWidth).toBe(8)

        const borderX = getStylesFromId('border-x-2')
        expect(borderX.borderLeftWidth).toBe(2)
        expect(borderX.borderRightWidth).toBe(2)

        const borderY = getStylesFromId('border-y-4')
        expect(borderY.borderTopWidth).toBe(4)
        expect(borderY.borderBottomWidth).toBe(4)
    })

    test('Border Color', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="border-red-500" testID="border-red" />
                <View className="border-black/50" testID="border-black-alpha" />
            </React.Fragment>,
        )

        expect(getStylesFromId('border-red').borderColor).toBe(TW_RED_500)
        expect(getStylesFromId('border-black-alpha').borderColor).toBe('#00000080')
    })

    test('Border Radius', () => {
        const checkRadius = (id: string, expected: number) => {
            const styles = getStylesFromId(id)

            if (styles.borderRadius !== undefined) {
                expect(styles.borderRadius).toBe(expected)

                return
            }

            expect(styles.borderTopLeftRadius).toBe(expected)
            expect(styles.borderTopRightRadius).toBe(expected)
            expect(styles.borderBottomRightRadius).toBe(expected)
            expect(styles.borderBottomLeftRadius).toBe(expected)
        }

        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="rounded" testID="rounded" />
                <View className="rounded-none" testID="rounded-none" />
                <View className="rounded-sm" testID="rounded-sm" />
                <View className="rounded-md" testID="rounded-md" />
                <View className="rounded-lg" testID="rounded-lg" />
                <View className="rounded-xl" testID="rounded-xl" />
                <View className="rounded-2xl" testID="rounded-2xl" />
                <View className="rounded-3xl" testID="rounded-3xl" />
                <View className="rounded-full" testID="rounded-full" />
                <View className="rounded-t-lg" testID="rounded-t-lg" />
                <View className="rounded-r-xl" testID="rounded-r-xl" />
                <View className="rounded-b-2xl" testID="rounded-b-2xl" />
                <View className="rounded-l-3xl" testID="rounded-l-3xl" />
                <View className="rounded-tl-md" testID="rounded-tl-md" />
                <View className="rounded-tr-md" testID="rounded-tr-md" />
                <View className="rounded-br-md" testID="rounded-br-md" />
                <View className="rounded-bl-md" testID="rounded-bl-md" />
            </React.Fragment>,
        )

        checkRadius('rounded', 4)
        checkRadius('rounded-none', 0)
        checkRadius('rounded-sm', 4)
        checkRadius('rounded-md', 6)
        checkRadius('rounded-lg', 8)
        checkRadius('rounded-xl', 12)
        checkRadius('rounded-2xl', 16)
        checkRadius('rounded-3xl', 24)
        checkRadius('rounded-full', 99999)

        const roundedT = getStylesFromId('rounded-t-lg')
        expect(roundedT.borderTopLeftRadius).toBe(8)
        expect(roundedT.borderTopRightRadius).toBe(8)

        const roundedR = getStylesFromId('rounded-r-xl')
        expect(roundedR.borderTopRightRadius).toBe(12)
        expect(roundedR.borderBottomRightRadius).toBe(12)

        const roundedB = getStylesFromId('rounded-b-2xl')
        expect(roundedB.borderBottomRightRadius).toBe(16)
        expect(roundedB.borderBottomLeftRadius).toBe(16)

        const roundedL = getStylesFromId('rounded-l-3xl')
        expect(roundedL.borderTopLeftRadius).toBe(24)
        expect(roundedL.borderBottomLeftRadius).toBe(24)

        expect(getStylesFromId('rounded-tl-md').borderTopLeftRadius).toBe(6)
        expect(getStylesFromId('rounded-tr-md').borderTopRightRadius).toBe(6)
        expect(getStylesFromId('rounded-br-md').borderBottomRightRadius).toBe(6)
        expect(getStylesFromId('rounded-bl-md').borderBottomLeftRadius).toBe(6)
    })

    test('Border Style', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="border-solid" testID="border-solid" />
                <View className="border-dashed" testID="border-dashed" />
                <View className="border-dotted" testID="border-dotted" />
            </React.Fragment>,
        )

        expect(getStylesFromId('border-solid').borderStyle).toBe('solid')
        expect(getStylesFromId('border-dashed').borderStyle).toBe('dashed')
        expect(getStylesFromId('border-dotted').borderStyle).toBe('dotted')
    })
})

describe('Outline', () => {
    test('Outline Width & Style', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="outline" testID="outline" />
                <View className="outline-0" testID="outline-0" />
                <View className="outline-2" testID="outline-2" />
                <View className="outline-4" testID="outline-4" />
                <View className="outline-dashed" testID="outline-dashed" />
                <View className="outline-dotted" testID="outline-dotted" />
            </React.Fragment>,
        )

        expect(getStylesFromId('outline').outlineWidth).toBe(1)
        expect(getStylesFromId('outline').outlineStyle).toBe('solid')

        expect(getStylesFromId('outline-0').outlineWidth).toBe(0)
        expect(getStylesFromId('outline-2').outlineWidth).toBe(2)
        expect(getStylesFromId('outline-4').outlineWidth).toBe(4)

        expect(getStylesFromId('outline-dashed').outlineStyle).toBe('dashed')
        expect(getStylesFromId('outline-dotted').outlineStyle).toBe('dotted')
    })

    test('Outline Color', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="outline-red-500" testID="outline-red" />
                <View className="outline-black/50" testID="outline-black-alpha" />
            </React.Fragment>,
        )

        expect(getStylesFromId('outline-red').outlineColor).toBe(TW_RED_500)
        expect(getStylesFromId('outline-black-alpha').outlineColor).toBe('#00000080')
    })
})
