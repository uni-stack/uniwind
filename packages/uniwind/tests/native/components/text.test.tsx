import { fireEvent, render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import Text from '../../../src/components/native/Text'
import { TW_BLUE_500, TW_RED_500 } from '../../consts'

describe('Text', () => {
    test('Basic rendering with className and selectionColorClassName', () => {
        const { getByText } = render(
            <Text
                className="text-red-500"
                selectionColorClassName="accent-blue-500"
            >
                Hello World
            </Text>,
        )

        const component = getByText('Hello World')

        // Check style
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })

        // Check selectionColor
        expect(component.props.selectionColor).toEqual(TW_BLUE_500)
    })

    test('Rendering with active state (pressed)', () => {
        const { getByText } = render(
            <Text className="text-red-500 active:text-blue-500">
                Press Me
            </Text>,
        )

        const component = getByText('Press Me')

        // Initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })

        // Press in
        fireEvent(component, 'pressIn')

        // Active state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_BLUE_500,
        })

        // Press out
        fireEvent(component, 'pressOut')

        // Back to initial state
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_RED_500,
        })
    })

    test('Rendering with disabled state', () => {
        const { getByText } = render(
            <Text
                className="text-red-500 disabled:text-blue-500"
                disabled={true}
            >
                Disabled Text
            </Text>,
        )

        const component = getByText('Disabled Text')

        expect(StyleSheet.flatten(component.props.style)).toEqual({
            color: TW_BLUE_500,
        })
    })
    test('Line break classes become Text props', () => {
        const { getByText } = render(
            <React.Fragment>
                <Text className="[line-break:strict] [word-break:auto-phrase]">Phrase</Text>
                <Text className="break-all [line-break:anywhere]">Unsupported</Text>
                <Text className="[line-break:strict]" {...{ lineBreak: 'loose' }}>Prop wins</Text>
            </React.Fragment>,
        )

        expect(getByText('Phrase').props).toMatchObject({ lineBreak: 'strict', wordBreak: 'auto-phrase' })
        expect(getByText('Unsupported').props.lineBreak).toBeUndefined()
        expect(getByText('Unsupported').props.wordBreak).toBeUndefined()
        expect(getByText('Prop wins').props.lineBreak).toBe('loose')
    })

    test('Text width mode keeps React Native experimental name', () => {
        const { getByText } = render(<Text className="[experimental-text-width-mode:longest-line]">Longest</Text>)

        expect(StyleSheet.flatten(getByText('Longest').props.style)).toEqual({
            experimental_textWidthMode: 'longest-line',
        })
    })
})
