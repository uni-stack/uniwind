import * as React from 'react'
import View from '../../../src/components/native/View'
import { TW_RED_500 } from '../../consts'
import { renderUniwind } from '../utils'

describe('Multiline', () => {
    test('Multiline classes are handled', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className={`bg-red-500
                             border-2`}
                testID="multiline"
            />,
        )

        const multilineStyles = getStylesFromId('multiline')
        expect(multilineStyles.backgroundColor).toBe(TW_RED_500)
        expect(multilineStyles.borderWidth).toBe(2)
    })
})
