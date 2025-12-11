import { render } from '@testing-library/react-native'
import * as React from 'react'
import { StyleSheet } from 'react-native'
import type { RNStyle } from '../src/core/types'

export const renderUniwind = <T>(component: React.ReactElement<T>) => {
    const renderResult = render(component)

    return {
        ...renderResult,
        getStylesFromId: (id: string) => {
            const element = renderResult.getByTestId(id)
            const styles = element.props.style

            return StyleSheet.flatten(styles) as RNStyle
        },
    }
}
