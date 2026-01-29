import * as React from 'react'
import View from '../../src/components/native/View'
import { TW_BLUE_500, TW_RED_500 } from '../consts'
import { renderUniwind } from '../utils'

describe('Data attributes', () => {
    test('should apply data attribute selectors', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="bg-blue-500 data-[x=true]:bg-red-500" data-x testID="data-x-true" />
                <View className="bg-blue-500 data-[x=true]:bg-red-500" data-x="true" testID="data-x-true-string" />
                <View className="bg-blue-500 data-[x=true]:bg-red-500" data-x="false" testID="data-x-false-string" />
                <View className="bg-blue-500 data-[x=test]:bg-red-500" data-x="test" testID="data-x-test" />
                <View className="bg-blue-500 data-x:bg-red-500" data-x testID="data-x" />
            </React.Fragment>,
        )

        expect(getStylesFromId('data-x-true').backgroundColor).toBe(TW_RED_500)
        expect(getStylesFromId('data-x-true-string').backgroundColor).toBe(TW_RED_500)
        expect(getStylesFromId('data-x-false-string').backgroundColor).toBe(TW_BLUE_500)
        expect(getStylesFromId('data-x-test').backgroundColor).toBe(TW_RED_500)
        expect(getStylesFromId('data-x').backgroundColor).toBe(TW_RED_500)
    })
})
