import { render } from '@testing-library/react'
import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { withUniwind } from '../../../src/hoc/withUniwind'

const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />

describe('withUniwind', () => {
    test('[auto] Should map className to style', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getByTestId } = render(
            <AutoWithUniwind className="bg-red-500" testID="test-component" />,
        )

        const component = getByTestId('test-component')

        expect(component).toBeInTheDocument()
        expect(component).toHaveClass('bg-red-500')
    })
})
