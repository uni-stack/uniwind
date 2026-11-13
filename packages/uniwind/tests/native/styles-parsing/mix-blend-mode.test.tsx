import * as React from 'react'
import View from '../../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Mix Blend Mode', () => {
    test('Blend Modes', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="mix-blend-normal" testID="mix-blend-normal" />
                <View className="mix-blend-multiply" testID="mix-blend-multiply" />
                <View className="mix-blend-plus-lighter" testID="mix-blend-plus-lighter" />
            </React.Fragment>,
        )

        expect(getStylesFromId('mix-blend-normal').mixBlendMode).toBe('normal')
        expect(getStylesFromId('mix-blend-multiply').mixBlendMode).toBe('multiply')
        expect(getStylesFromId('mix-blend-plus-lighter').mixBlendMode).toBe('plus-lighter')
    })
})
