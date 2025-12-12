import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Image from '../../src/components/native/Image'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('Image', () => {
    test('Basic rendering with className and tintColorClassName', () => {
        const { getByTestId } = render(
            <Image
                source={{ uri: 'https://example.com/image.png' }}
                className="bg-red-500"
                tintColorClassName="accent-blue-500"
                testID="image-1"
            />,
        )

        const component = getByTestId('image-1')

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check tintColor
        expect(component.props.tintColor).toEqual(TW_BLUE_500)
    })
})
