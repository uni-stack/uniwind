import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

const NO_SHADOW = '0px 0px #00000000'

describe('Shadow system', () => {
    test('Shadow', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="shadow-2xl"
                    testID="shadow-2xl"
                />
                <View
                    className="shadow-2xl shadow-red-500"
                    testID="shadow-red"
                />
            </React.Fragment>,
        )

        const shadowStyles = getStylesFromId('shadow-2xl')
        expect(shadowStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            '0px 25px 50px -12px #00000040',
        ].join(', '))

        const shadowRedStyles = getStylesFromId('shadow-red')
        expect(shadowRedStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            '0px 25px 50px -12px #fb2c36ff',
        ].join(', '))
    })

    test('Ring', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="ring-2"
                    testID="ring-2"
                />
                <View
                    className="ring-2 ring-red-500"
                    testID="ring-red"
                />
            </React.Fragment>,
        )

        const ringStyles = getStylesFromId('ring-2')
        expect(ringStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            ' 0px 0px 0px 2px #000000',
            NO_SHADOW,
        ].join(', '))

        const ringRedStyles = getStylesFromId('ring-red')
        expect(ringRedStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            ' 0px 0px 0px 2px #fb2c36',
            NO_SHADOW,
        ].join(', '))
    })

    test('Ring + Ring offset different colors', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="ring-4 ring-green-500 ring-offset-4 ring-offset-red-500"
                    testID="ring"
                />
            </React.Fragment>,
        )

        const ringStyles = getStylesFromId('ring')
        expect(ringStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            ' 0px 0px 0px 4px #fb2c36',
            ' 0px 0px 0px 8px #00c950',
            NO_SHADOW,
        ].join(', '))
    })

    test('Ring inset', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="ring-4 ring-inset ring-red-500"
                    testID="ring-inset"
                />
            </React.Fragment>,
        )

        const ringStyles = getStylesFromId('ring-inset')
        expect(ringStyles.boxShadow).toBe([
            NO_SHADOW,
            NO_SHADOW,
            NO_SHADOW,
            'inset 0px 0px 0px 4px #fb2c36',
            NO_SHADOW,
        ].join(', '))
    })
})
