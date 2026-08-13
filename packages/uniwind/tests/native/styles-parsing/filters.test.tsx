import * as React from 'react'
import View from '../../../src/components/native/View'
import type { RNStyle } from '../../../src/core/types'
import { renderUniwind } from '../utils'

const filterOf = ({ filter }: RNStyle) =>
    typeof filter === 'string'
        ? filter.replace(/\s+/g, ' ').trim()
        : filter

describe('Filters', () => {
    test('Blur', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="blur-md"
                testID="blur-md"
            />,
        )

        expect(filterOf(getStylesFromId('blur-md'))).toBe('blur(12px)')
    })

    test('Arbitrary blur', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="blur-[7px]"
                testID="blur-arbitrary"
            />,
        )

        expect(filterOf(getStylesFromId('blur-arbitrary'))).toBe('blur(7px)')
    })

    test('Amount filters', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="grayscale"
                    testID="grayscale"
                />
                <View
                    className="invert"
                    testID="invert"
                />
                <View
                    className="sepia"
                    testID="sepia"
                />
                <View
                    className="saturate-150"
                    testID="saturate"
                />
                <View
                    className="brightness-50"
                    testID="brightness"
                />
                <View
                    className="contrast-125"
                    testID="contrast"
                />
            </React.Fragment>,
        )

        expect(filterOf(getStylesFromId('grayscale'))).toBe('grayscale(1)')
        expect(filterOf(getStylesFromId('invert'))).toBe('invert(1)')
        expect(filterOf(getStylesFromId('sepia'))).toBe('sepia(1)')
        expect(filterOf(getStylesFromId('saturate'))).toBe('saturate(1.5)')
        expect(filterOf(getStylesFromId('brightness'))).toBe('brightness(0.5)')
        expect(filterOf(getStylesFromId('contrast'))).toBe('contrast(1.25)')
    })

    test('Hue rotate', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="hue-rotate-90"
                testID="hue-rotate"
            />,
        )

        expect(filterOf(getStylesFromId('hue-rotate'))).toBe('hue-rotate(90deg)')
    })

    test('Combined filters keep CSS order', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="grayscale blur-md"
                testID="combined"
            />,
        )

        expect(filterOf(getStylesFromId('combined'))).toBe('blur(12px) grayscale(1)')
    })
})
