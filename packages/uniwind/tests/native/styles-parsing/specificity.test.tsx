import * as React from 'react'
import View from '../../../src/components/native/View'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../../consts'
import { renderUniwind } from '../utils'

describe('Specificity', () => {
    test('Important', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="text-red-500 text-blue-500"
                    testID="no-important"
                />
                <View
                    className="text-red-500! text-blue-500!"
                    testID="both-important"
                />
                <View
                    className="text-red-500! text-green-500 text-blue-500"
                    testID="important-first"
                />
                <View
                    className="text-red-500 text-green-500! text-blue-500"
                    testID="important-middle"
                />
                <View
                    className="text-red-500 text-green-500 text-blue-500!"
                    testID="important-last"
                />
            </React.Fragment>,
        )

        expect(getStylesFromId('no-important').color).toBe(TW_BLUE_500)
        /* NOTE: when both classes are !important, the first one wins.
        This diverges from CSS where the last !important would win. */
        expect(getStylesFromId('both-important').color).toBe(TW_RED_500)
        expect(getStylesFromId('important-first').color).toBe(TW_RED_500)
        expect(getStylesFromId('important-middle').color).toBe(TW_GREEN_500)
        expect(getStylesFromId('important-last').color).toBe(TW_BLUE_500)
    })
})
