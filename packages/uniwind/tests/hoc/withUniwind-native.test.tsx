import * as React from 'react'
import { View, ViewProps } from 'react-native'
import { withUniwind } from '../../src/hoc/withUniwind.native'
import { TW_BLUE_500, TW_RED_500 } from '../consts'
import { renderUniwind } from '../utils'

const Component: React.FC<ViewProps> = (props) => <View {...props} />

describe('withUniwind', () => {
    it('[auto] Should map className to style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(<AutoWithUniwind className="bg-red-500" testID="test-view" />)

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    it('[auto] Should override className with inline style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <AutoWithUniwind className="bg-red-500" style={{ backgroundColor: TW_BLUE_500 }} testID="test-view" />,
        )

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })

    it('[auto] Should merge className with inline style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <AutoWithUniwind className="bg-red-500" style={{ borderColor: TW_BLUE_500 }} testID="test-view" />,
        )

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_RED_500,
            borderColor: TW_BLUE_500,
        })
    })

    it('[manual] Should map className to style', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'className',
            },
        })

        const { getStylesFromId } = renderUniwind(<ManualWithUniwind className="bg-red-500" testID="test-view" />)

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    it('[manual] Should override className with inline style', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'className',
            },
        })

        const { getStylesFromId } = renderUniwind(
            <ManualWithUniwind className="bg-red-500" style={{ backgroundColor: TW_BLUE_500 }} testID="test-view" />,
        )

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })

    it('[manual] Should merge className with inline style', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'className',
            },
        })

        const { getStylesFromId } = renderUniwind(
            <ManualWithUniwind className="bg-red-500" style={{ borderColor: TW_BLUE_500 }} testID="test-view" />,
        )

        expect(getStylesFromId('test-view')).toEqual({
            backgroundColor: TW_RED_500,
            borderColor: TW_BLUE_500,
        })
    })
})
