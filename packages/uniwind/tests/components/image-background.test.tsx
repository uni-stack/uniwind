import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import ImageBackground from '../../src/components/native/ImageBackground'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('ImageBackground', () => {
    test('Basic rendering with className, imageClassName and tintColorClassName', () => {
        const { getByTestId, UNSAFE_getAllByType } = render(
            <ImageBackground
                source={{ uri: 'https://example.com/bg.png' }}
                className="bg-red-500"
                imageClassName="bg-blue-500"
                tintColorClassName="accent-green-500"
                testID="image-background-1"
            >
                <React.Fragment />
            </ImageBackground>,
        )

        // Find the container View
        const views = UNSAFE_getAllByType(View)
        const container = views[0]

        // Check container style
        const containerFlatStyle = StyleSheet.flatten(container.props.style)
        expect(containerFlatStyle).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Find the inner Image
        const imageComponent = getByTestId('image-background-1')

        // Check imageStyle (applied as style to the inner Image)
        const imageFlatStyle = StyleSheet.flatten(imageComponent.props.style)
        expect(imageFlatStyle).toEqual(expect.objectContaining({
            backgroundColor: TW_BLUE_500,
        }))

        // Check tintColor (applied to the inner Image)
        expect(imageComponent.props.tintColor).toEqual(TW_GREEN_500)
    })
})
