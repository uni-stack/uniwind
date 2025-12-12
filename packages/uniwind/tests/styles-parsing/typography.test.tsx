import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Typography', () => {
    test('Font Size', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-xs" testID="text-xs" />
                <View className="text-sm" testID="text-sm" />
                <View className="text-base" testID="text-base" />
                <View className="text-lg" testID="text-lg" />
                <View className="text-xl" testID="text-xl" />
                <View className="text-2xl" testID="text-2xl" />
                <View className="text-3xl" testID="text-3xl" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-xs').fontSize).toBe(12)
        expect(getStylesFromId('text-sm').fontSize).toBe(14)
        expect(getStylesFromId('text-base').fontSize).toBe(16)
        expect(getStylesFromId('text-lg').fontSize).toBe(18)
        expect(getStylesFromId('text-xl').fontSize).toBe(20)
        expect(getStylesFromId('text-2xl').fontSize).toBe(24)
        expect(getStylesFromId('text-3xl').fontSize).toBe(30)
    })

    test('Font Weight', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="font-thin" testID="font-thin" />
                <View className="font-extralight" testID="font-extralight" />
                <View className="font-light" testID="font-light" />
                <View className="font-normal" testID="font-normal" />
                <View className="font-medium" testID="font-medium" />
                <View className="font-semibold" testID="font-semibold" />
                <View className="font-bold" testID="font-bold" />
                <View className="font-extrabold" testID="font-extrabold" />
                <View className="font-black" testID="font-black" />
            </React.Fragment>,
        )

        expect(getStylesFromId('font-thin').fontWeight).toBe(100)
        expect(getStylesFromId('font-extralight').fontWeight).toBe(200)
        expect(getStylesFromId('font-light').fontWeight).toBe(300)
        expect(getStylesFromId('font-normal').fontWeight).toBe(400)
        expect(getStylesFromId('font-medium').fontWeight).toBe(500)
        expect(getStylesFromId('font-semibold').fontWeight).toBe(600)
        expect(getStylesFromId('font-bold').fontWeight).toBe(700)
        expect(getStylesFromId('font-extrabold').fontWeight).toBe(800)
        expect(getStylesFromId('font-black').fontWeight).toBe(900)
    })

    test('Line Height', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="leading-3" testID="leading-3" />
                <View className="leading-[30px]" testID="leading-custom" />
            </React.Fragment>,
        )

        // leading-3 is .75rem = 12px
        expect(getStylesFromId('leading-3').lineHeight).toBe(12)
        expect(getStylesFromId('leading-custom').lineHeight).toBe(30)
    })

    test('Line Height with Font Size', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-base leading-none" testID="text-base-leading-none" />
                <View className="text-base leading-normal" testID="text-base-leading-normal" />
                <View className="text-base leading-loose" testID="text-base-leading-loose" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-base-leading-none').lineHeight).toBe(16)
        expect(getStylesFromId('text-base-leading-normal').lineHeight).toBe(24)
        expect(getStylesFromId('text-base-leading-loose').lineHeight).toBe(32)
    })

    test('Text Color', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-red-500" testID="text-red" />
                <View className="text-black/50" testID="text-black-alpha" />
                <View className="text-[#00ff00]" testID="text-hex" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-red').color).toBe('#fb2c36')
        expect(getStylesFromId('text-black-alpha').color).toBe('#00000080')
        expect(getStylesFromId('text-hex').color).toBe('#00ff00')
    })

    test('Text Decoration', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="underline" testID="underline" />
                <View className="line-through" testID="line-through" />
                <View className="no-underline" testID="no-underline" />
            </React.Fragment>,
        )

        expect(getStylesFromId('underline').textDecorationLine).toBe('underline')
        expect(getStylesFromId('line-through').textDecorationLine).toBe('line-through')
        expect(getStylesFromId('no-underline').textDecorationLine).toBe('none')
    })

    test('Text Align', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="text-left" testID="text-left" />
                <View className="text-center" testID="text-center" />
                <View className="text-right" testID="text-right" />
                <View className="text-justify" testID="text-justify" />
            </React.Fragment>,
        )

        expect(getStylesFromId('text-left').textAlign).toBe('left')
        expect(getStylesFromId('text-center').textAlign).toBe('center')
        expect(getStylesFromId('text-right').textAlign).toBe('right')
        expect(getStylesFromId('text-justify').textAlign).toBe('justify')
    })

    test('Font Style & Transform', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="italic" testID="italic" />
                <View className="not-italic" testID="not-italic" />
                <View className="uppercase" testID="uppercase" />
                <View className="lowercase" testID="lowercase" />
                <View className="capitalize" testID="capitalize" />
                <View className="normal-case" testID="normal-case" />
            </React.Fragment>,
        )

        expect(getStylesFromId('italic').fontStyle).toBe('italic')
        expect(getStylesFromId('not-italic').fontStyle).toBe('normal')
        expect(getStylesFromId('uppercase').textTransform).toBe('uppercase')
        expect(getStylesFromId('lowercase').textTransform).toBe('lowercase')
        expect(getStylesFromId('capitalize').textTransform).toBe('capitalize')
        expect(getStylesFromId('normal-case').textTransform).toBe('none')
    })

    test('Letter Spacing', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="tracking-tighter" testID="tracking-tighter" />
                <View className="tracking-tight" testID="tracking-tight" />
                <View className="tracking-normal" testID="tracking-normal" />
                <View className="tracking-wide" testID="tracking-wide" />
                <View className="tracking-wider" testID="tracking-wider" />
                <View className="tracking-widest" testID="tracking-widest" />
            </React.Fragment>,
        )

        expect(getStylesFromId('tracking-tighter').letterSpacing).toBeCloseTo(-0.8)
        expect(getStylesFromId('tracking-tight').letterSpacing).toBeCloseTo(-0.4)
        expect(getStylesFromId('tracking-normal').letterSpacing).toBe(0)
        expect(getStylesFromId('tracking-wide').letterSpacing).toBeCloseTo(0.4)
        expect(getStylesFromId('tracking-wider').letterSpacing).toBeCloseTo(0.8)
        expect(getStylesFromId('tracking-widest').letterSpacing).toBeCloseTo(1.6)
    })
})
