import { render } from '@testing-library/react'
import * as React from 'react'
import View from '../../../src/components/web/View'

describe('View', () => {
    test('Passes className correctly', () => {
        const { getByTestId } = render(
            <View className="bg-red-500" testID="view-1" />,
        )

        const view = getByTestId('view-1')

        expect(view).toBeInTheDocument()
        expect(view).toHaveClass('bg-red-500')
    })
})
