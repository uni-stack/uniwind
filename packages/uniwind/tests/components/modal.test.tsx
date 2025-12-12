import { render } from '@testing-library/react-native'
import * as React from 'react'
import { Modal as RNModal, StyleSheet } from 'react-native'
import Modal from '../../src/components/native/Modal'
import { TW_BLUE_500, TW_RED_500 } from '../consts'

describe('Modal', () => {
    test('Basic rendering with className and backdropColorClassName', () => {
        const { UNSAFE_getByType } = render(
            <Modal
                className="bg-red-500"
                backdropColorClassName="accent-blue-500"
                visible={true}
            />,
        )

        const component = UNSAFE_getByType(RNModal)

        // Check style
        // Note: RN Modal doesn't officially support style, but we check if it's passed
        expect(StyleSheet.flatten(component.props.style)).toEqual({
            backgroundColor: TW_RED_500,
        })

        // Check backdropColor
        // Note: RN Modal doesn't officially support backdropColor, but we check if it's passed
        expect(component.props.backdropColor).toEqual(TW_BLUE_500)
    })
})
