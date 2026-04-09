import * as React from 'react'
import Text from '../../../src/components/native/Text'
import { renderUniwind } from '../utils'

describe('Default styles', () => {
    test('should apply default font-size to Text', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <Text testID="data-text" />
            </React.Fragment>,
        )

        expect(getStylesFromId('data-text').fontSize).toBe(10)
    })
})
