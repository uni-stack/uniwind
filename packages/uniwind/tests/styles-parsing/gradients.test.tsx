import * as React from 'react'
import View from '../../src/components/native/View'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'
import { renderUniwind } from '../utils'

describe('Gradients', () => {
    test('Linear to bottom', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="bg-linear-to-b from-red-500 to-green-500"
                    testID="linear-to-b"
                />
            </React.Fragment>,
        )

        const linearStyles = getStylesFromId('linear-to-b')
        expect(linearStyles.experimental_backgroundImage).toEqual([
            {
                colorStops: [
                    {
                        color: TW_RED_500,
                        positions: [
                            '0%',
                        ],
                    },
                    {
                        color: TW_GREEN_500,
                        positions: [
                            '100%',
                        ],
                    },
                ],
                type: 'linear-gradient',
                direction: 'to bottom',
            },
        ])
    })

    test('Linear to right 3 colors', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="bg-linear-to-r from-red-500 via-green-500 to-blue-500"
                    testID="linear-to-r"
                />
            </React.Fragment>,
        )

        const linearStyles = getStylesFromId('linear-to-r')
        expect(linearStyles.experimental_backgroundImage).toEqual([
            {
                colorStops: [
                    {
                        color: TW_RED_500,
                        positions: [
                            '0%',
                        ],
                    },
                    {
                        color: TW_GREEN_500,
                        positions: [
                            '50%',
                        ],
                    },
                    {
                        color: TW_BLUE_500,
                        positions: [
                            '100%',
                        ],
                    },
                    {
                        color: TW_RED_500,
                        positions: [
                            '0%',
                        ],
                    },
                    {
                        color: TW_BLUE_500,
                        positions: [
                            '100%',
                        ],
                    },
                ],
                type: 'linear-gradient',
                direction: 'to right',
            },
        ])
    })

    test('Linear 150 deg', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="bg-linear-150 from-red-500 to-green-500"
                    testID="linear-150"
                />
            </React.Fragment>,
        )

        const linearStyles = getStylesFromId('linear-150')
        expect(linearStyles.experimental_backgroundImage).toEqual([
            {
                colorStops: [
                    {
                        color: TW_RED_500,
                        positions: [
                            '0%',
                        ],
                    },
                    {
                        color: TW_GREEN_500,
                        positions: [
                            '100%',
                        ],
                    },
                ],
                type: 'linear-gradient',
                direction: '150deg',
            },
        ])
    })
})
