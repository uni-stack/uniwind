import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Button from '../../src/components/native/Button'
import { TW_RED_500 } from '../consts'

describe('Button', () => {
    test('Basic rendering', () => {
        const { getByText } = render(
            <React.Fragment>
                <Button
                    title="Button"
                    colorClassName="accent-red-500"
                    testID="button-1"
                />
            </React.Fragment>,
        )

        // Button uses Text internally for the title rendering
        const text = getByText('Button')
        const flatStyle = StyleSheet.flatten(text.props.style)

        expect(flatStyle.color).toEqual(TW_RED_500)
    })
})
