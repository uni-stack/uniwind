import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { withUniwind } from '../../../src/hoc/withUniwind.native'
import { TW_BLUE_500, TW_RED_500 } from '../consts'
import { renderUniwind } from '../utils'

const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />

describe('withUniwind', () => {
    it('[auto] Should map className to style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(<AutoWithUniwind className="bg-red-500" testID="test-component" />)

        expect(getStylesFromId('test-component')).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    it('[auto] Should map colorClassName to color', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getByTestId } = renderUniwind(<AutoWithUniwind colorClassName="accent-red-500" testID="test-component" />)

        const component = getByTestId('test-component')

        expect(component.props.color).toEqual(TW_RED_500)
    })

    it('[auto] Should override className with inline style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <AutoWithUniwind style={{ backgroundColor: TW_BLUE_500 }} className="bg-red-500" testID="test-component" />,
        )

        expect(getStylesFromId('test-component')).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })

    it('[auto] Should override colorClassName with inline color', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getByTestId } = renderUniwind(<AutoWithUniwind color={TW_BLUE_500} colorClassName="accent-red-500" testID="test-component" />)

        const component = getByTestId('test-component')

        expect(component.props.color).toEqual(TW_BLUE_500)
    })

    it('[auto] Should merge className with inline style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getStylesFromId } = renderUniwind(
            <AutoWithUniwind style={{ borderColor: TW_BLUE_500 }} className="bg-red-500" testID="test-component" />,
        )

        expect(getStylesFromId('test-component')).toEqual({
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

        const { getStylesFromId } = renderUniwind(<ManualWithUniwind className="bg-red-500" testID="test-component" />)

        expect(getStylesFromId('test-component')).toEqual({
            backgroundColor: TW_RED_500,
        })
    })

    it('[manual] Should map testClassName to color', () => {
        const ManualWithUniwind = withUniwind(Component, {
            color: {
                fromClassName: 'testClassName',
                styleProperty: 'fill',
            },
        })

        const { getByTestId } = renderUniwind(<ManualWithUniwind testClassName="fill-red-500" testID="test-component" />)

        const component = getByTestId('test-component')

        expect(component.props.color).toEqual(TW_RED_500)
    })

    it('[manual] Should override className with inline style', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'className',
            },
        })

        const { getStylesFromId } = renderUniwind(
            <ManualWithUniwind style={{ backgroundColor: TW_BLUE_500 }} className="bg-red-500" testID="test-component" />,
        )

        expect(getStylesFromId('test-component')).toEqual({
            backgroundColor: TW_BLUE_500,
        })
    })

    it('[manual] Should override testClassName with inline color', () => {
        const ManualWithUniwind = withUniwind(Component, {
            color: {
                fromClassName: 'testClassName',
                styleProperty: 'fill',
            },
        })

        const { getByTestId } = renderUniwind(<ManualWithUniwind color={TW_BLUE_500} testClassName="fill-red-500" testID="test-component" />)

        const component = getByTestId('test-component')

        expect(component.props.color).toEqual(TW_BLUE_500)
    })

    it('[manual] Should merge className with inline style', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'className',
            },
        })

        const { getStylesFromId } = renderUniwind(
            <ManualWithUniwind style={{ borderColor: TW_BLUE_500 }} className="bg-red-500" testID="test-component" />,
        )

        expect(getStylesFromId('test-component')).toEqual({
            backgroundColor: TW_RED_500,
            borderColor: TW_BLUE_500,
        })
    })
})
