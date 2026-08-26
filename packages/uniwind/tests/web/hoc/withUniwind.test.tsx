import { render } from '@testing-library/react'
import * as React from 'react'
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import * as webCore from '../../../src/core/web'
import { withUniwind } from '../../../src/hoc/withUniwind'
import { TW_BLUE_500, TW_RED_500, UNIWIND_CONTEXT_MOCK } from '../../consts'

const Component: React.FC<ActivityIndicatorProps> = (props) => <ActivityIndicator {...props} />

const ComponentWithSpy = vi.fn((props: ActivityIndicatorProps) => <ActivityIndicator {...props} />)

vi.mock('../../../src/core/web', async importOriginal => ({
    ...await importOriginal(),
    getWebStyles: vi.fn(),
}))

describe('withUniwind', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('[auto] Should map className to style', () => {
        ComponentWithSpy.mockClear()

        const AutoWithUniwind = withUniwind(ComponentWithSpy)

        const { getByTestId } = render(
            <AutoWithUniwind className="bg-red-500" testID="test-component" />,
        )

        const component = getByTestId('test-component')

        expect(component).toBeInTheDocument()
        expect(component).toHaveClass('bg-red-500')

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps.style).toEqual([{ $$css: true, tailwind: 'bg-red-500' }])
        expect(receivedProps).not.toHaveProperty('className')
    })

    test('[auto] Should map colorClassName to color', () => {
        const mockGetWebStyles = vi.mocked(webCore.getWebStyles)

        mockGetWebStyles.mockReturnValue({ accentColor: TW_RED_500 })
        ComponentWithSpy.mockClear()

        const AutoWithUniwind = withUniwind(ComponentWithSpy)

        render(<AutoWithUniwind colorClassName="accent-red-500" testID="test-component" />)

        expect(mockGetWebStyles).toHaveBeenCalledWith('accent-red-500', {
            'testID': 'test-component',
        }, UNIWIND_CONTEXT_MOCK)

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps).toHaveProperty('color')
        expect(receivedProps.color).toBe(TW_RED_500)
        expect(receivedProps).not.toHaveProperty('colorClassName')
    })

    test('[auto] Should add both inline style and className', () => {
        const AutoWithUniwind = withUniwind(Component)

        const { getByTestId } = render(
            <AutoWithUniwind className="bg-red-500" style={{ backgroundColor: TW_BLUE_500 }} testID="test-component" />,
        )

        const component = getByTestId('test-component')

        expect(component).toBeInTheDocument()
        expect(component).toHaveClass('bg-red-500')
        expect(component).toHaveStyle({ backgroundColor: TW_BLUE_500 })
    })

    test('[auto] Should override colorClassName with inline color', () => {
        ComponentWithSpy.mockClear()

        const AutoWithUniwind = withUniwind(ComponentWithSpy)

        render(<AutoWithUniwind color={TW_BLUE_500} colorClassName="accent-red-500" testID="test-component" />)

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps).toHaveProperty('color')
        expect(receivedProps.color).toBe(TW_BLUE_500)
        expect(receivedProps).not.toHaveProperty('colorClassName')
    })

    test('[manual] Should map testClassName to style', () => {
        ComponentWithSpy.mockClear()

        const ManualWithUniwind = withUniwind(ComponentWithSpy, {
            style: {
                fromClassName: 'testClassName',
            },
        })

        const { getByTestId } = render(
            <ManualWithUniwind testClassName="bg-red-500" testID="test-component" />,
        )

        const component = getByTestId('test-component')

        expect(component).toBeInTheDocument()
        expect(component).toHaveClass('bg-red-500')

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps.style).toEqual([{ $$css: true, tailwind: 'bg-red-500' }, undefined])
        expect(receivedProps).not.toHaveProperty('testClassName')
    })

    test('[manual] Should map testClassName to color', () => {
        const mockGetWebStyles = vi.mocked(webCore.getWebStyles)

        mockGetWebStyles.mockReturnValue({ fill: TW_RED_500 })
        ComponentWithSpy.mockClear()

        const ManualWithUniwind = withUniwind(ComponentWithSpy, {
            color: {
                fromClassName: 'testClassName',
                styleProperty: 'fill',
            },
        })

        render(<ManualWithUniwind testClassName="fill-red-500" testID="test-component" />)

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps).toHaveProperty('color')
        expect(receivedProps.color).toBe(TW_RED_500)
        expect(receivedProps).not.toHaveProperty('testClassName')
    })

    test('[manual] Should override colorClassName with inline color', () => {
        ComponentWithSpy.mockClear()

        const ManualWithUniwind = withUniwind(ComponentWithSpy, {
            color: {
                fromClassName: 'colorClassName',
                styleProperty: 'fill',
            },
        })

        render(<ManualWithUniwind color={TW_BLUE_500} colorClassName="fill-red-500" testID="test-component" />)

        const receivedProps = ComponentWithSpy.mock.calls[0][0]

        expect(receivedProps).toHaveProperty('color')
        expect(receivedProps.color).toBe(TW_BLUE_500)
        expect(receivedProps).not.toHaveProperty('colorClassName')
    })

    test('[manual] Should add both inline style and className', () => {
        const ManualWithUniwind = withUniwind(Component, {
            style: {
                fromClassName: 'testClassName',
            },
        })

        const { getByTestId } = render(
            <ManualWithUniwind style={{ backgroundColor: TW_BLUE_500 }} testClassName="bg-red-500" testID="test-component" />,
        )

        const component = getByTestId('test-component')

        expect(component).toBeInTheDocument()
        expect(component).toHaveClass('bg-red-500')
        expect(component).toHaveStyle({ backgroundColor: TW_BLUE_500 })
    })
})
