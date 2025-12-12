import { render } from '@testing-library/react-native'
import * as React from 'react'
import { Switch as RNSwitch } from 'react-native'
import Switch from '../../src/components/native/Switch'
import { TW_BLUE_500, TW_GREEN_500, TW_RED_500 } from '../consts'

describe('Switch', () => {
    test('Basic rendering with className and color props', () => {
        const { UNSAFE_getByType } = render(
            <Switch
                trackColorOnClassName="accent-blue-500"
                trackColorOffClassName="accent-red-500"
                thumbColorClassName="accent-green-500"
                ios_backgroundColorClassName="accent-blue-500"
                testID="switch-1"
            />,
        )

        const component = UNSAFE_getByType(RNSwitch)

        // Check trackColor
        expect(component.props.trackColor).toEqual({
            true: TW_BLUE_500,
            false: TW_RED_500,
        })

        // Check thumbColor
        expect(component.props.thumbColor).toEqual(TW_GREEN_500)

        // Check ios_backgroundColor
        expect(component.props.ios_backgroundColor).toEqual(TW_BLUE_500)
    })
})
