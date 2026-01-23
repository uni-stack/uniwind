import { fireEvent } from '@testing-library/react-native'
import * as React from 'react'
import { createAnimatedComponent } from 'react-native-reanimated'
import Pressable from '../../src/components/native/Pressable'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('CSS Transitions', () => {
    test('Transition Property', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="transition-all" testID="transition-all" />
                <View className="transition-none" testID="transition-none" />
                <View className="transition-[width,height]" testID="transition-custom" />
            </React.Fragment>,
        )

        const allStyles = getStylesFromId('transition-all')
        const noneStyles = getStylesFromId('transition-none')
        const customStyles = getStylesFromId('transition-custom')

        expect(allStyles).toEqual(
            {
                transitionProperty: ['all'],
                transitionDuration: '150ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
            },
        )
        expect(noneStyles).toEqual({
            transitionProperty: ['none'],
        })
        expect(customStyles).toEqual(
            {
                transitionProperty: ['width', 'height'],
                transitionDuration: '150ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
            },
        )
    })

    test('Transition Duration', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="duration-75" testID="duration-75" />
                <View className="duration-100" testID="duration-100" />
                <View className="duration-150" testID="duration-150" />
                <View className="duration-200" testID="duration-200" />
                <View className="duration-300" testID="duration-300" />
                <View className="duration-500" testID="duration-500" />
                <View className="duration-700" testID="duration-700" />
                <View className="duration-1000" testID="duration-1000" />
                <View className="duration-250" testID="duration-custom" />
            </React.Fragment>,
        )

        expect(getStylesFromId('duration-75')).toEqual({ transitionDuration: '75ms' })
        expect(getStylesFromId('duration-100')).toEqual({ transitionDuration: '100ms' })
        expect(getStylesFromId('duration-150')).toEqual({ transitionDuration: '150ms' })
        expect(getStylesFromId('duration-200')).toEqual({ transitionDuration: '200ms' })
        expect(getStylesFromId('duration-300')).toEqual({ transitionDuration: '300ms' })
        expect(getStylesFromId('duration-500')).toEqual({ transitionDuration: '500ms' })
        expect(getStylesFromId('duration-700')).toEqual({ transitionDuration: '700ms' })
        expect(getStylesFromId('duration-1000')).toEqual({ transitionDuration: '1000ms' })
        expect(getStylesFromId('duration-custom')).toEqual({ transitionDuration: '250ms' })
    })

    test('Transition Delay', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="delay-75" testID="delay-75" />
                <View className="delay-100" testID="delay-100" />
                <View className="delay-150" testID="delay-150" />
                <View className="delay-200" testID="delay-200" />
                <View className="delay-300" testID="delay-300" />
                <View className="delay-500" testID="delay-custom" />
            </React.Fragment>,
        )

        expect(getStylesFromId('delay-75')).toEqual({ transitionDelay: '75ms' })
        expect(getStylesFromId('delay-100')).toEqual({ transitionDelay: '100ms' })
        expect(getStylesFromId('delay-150')).toEqual({ transitionDelay: '150ms' })
        expect(getStylesFromId('delay-200')).toEqual({ transitionDelay: '200ms' })
        expect(getStylesFromId('delay-300')).toEqual({ transitionDelay: '300ms' })
        expect(getStylesFromId('delay-custom')).toEqual({ transitionDelay: '500ms' })
    })

    test('Transition Timing Function', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="ease-linear" testID="ease-linear" />
                <View className="ease-in" testID="ease-in" />
                <View className="ease-out" testID="ease-out" />
                <View className="ease-in-out" testID="ease-in-out" />
            </React.Fragment>,
        )

        expect(getStylesFromId('ease-linear')).toEqual({
            transitionTimingFunction: 'linear',
        })

        const easeInStyles = getStylesFromId('ease-in')
        expect(easeInStyles).toEqual(
            expect.objectContaining({
                transitionTimingFunction: expect.objectContaining({
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                }),
            }),
        )
        expect(easeInStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0.4000000059604645, 0, 1, 1)')

        const easeOutStyles = getStylesFromId('ease-out')
        expect(easeOutStyles).toEqual(
            expect.objectContaining({
                transitionTimingFunction: expect.objectContaining({
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                }),
            }),
        )
        expect(easeOutStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0, 0, 0.20000000298023224, 1)')

        const easeInOutStyles = getStylesFromId('ease-in-out')
        expect(easeInOutStyles).toEqual(
            expect.objectContaining({
                transitionTimingFunction: expect.objectContaining({
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                }),
            }),
        )
        expect(easeInOutStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0.4000000059604645, 0, 0.20000000298023224, 1)')
    })

    test('Transition Behavior', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="transition-[normal]" testID="behavior-normal" />
                <View className="transition-[allow-discrete]" testID="behavior-allow-discrete" />
            </React.Fragment>,
        )

        expect(getStylesFromId('behavior-normal')).toEqual(
            {
                transitionBehavior: 'normal',
                transitionDuration: '150ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
            },
        )
        expect(getStylesFromId('behavior-allow-discrete')).toEqual(
            {
                transitionBehavior: 'allow-discrete',
                transitionDuration: '150ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
            },
        )
    })

    test('Combined Transition Properties', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="transition-all duration-300 ease-in-out delay-150"
                testID="combined-transition"
            />,
        )

        const combinedStyles = getStylesFromId('combined-transition')
        expect(combinedStyles).toEqual(
            {
                transitionProperty: ['all'],
                transitionDuration: '300ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
                transitionDelay: '150ms',
            },
        )
        expect(combinedStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0.4000000059604645, 0, 0.20000000298023224, 1)')
    })

    test('Transition with Transform', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="transition-transform duration-300 ease-in-out"
                testID="transition-transform"
            />,
        )

        expect(getStylesFromId('transition-transform')).toEqual(
            {
                transitionProperty: ['transform', 'translate', 'scale', 'rotate'],
                transitionDuration: '300ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
            },
        )
    })

    test('Multiple Transition Properties', () => {
        const { getStylesFromId } = renderUniwind(
            <View
                className="transition-[width,height,opacity] duration-[200ms,300ms,150ms] ease-[linear,ease-in-out,ease]"
                testID="multiple-properties"
            />,
        )

        expect(getStylesFromId('multiple-properties')).toEqual({
            transitionProperty: ['width', 'height', 'opacity'],
            transitionDuration: ['200ms', ' 300ms', ' 150ms'],
            transitionTimingFunction: ['linear', 'ease-in-out', 'ease'],
        })
    })

    test('Transition reactivity with active modifier', () => {
        jest.clearAllMocks()

        const { getStylesFromId, getByTestId } = renderUniwind(
            <Pressable
                className="transition-all duration-300 bg-gray-300 active:duration-100 active:bg-gray-500"
                testID="transition-active"
            />,
        )

        expect(createAnimatedComponent).toHaveBeenCalledTimes(1)
        const initialStyles = getStylesFromId('transition-active')
        expect(initialStyles).toEqual(
            {
                transitionProperty: ['all'],
                transitionDuration: '300ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
                backgroundColor: '#d1d5dc',
            },
        )
        expect(initialStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0.4000000059604645, 0, 0.20000000298023224, 1)')

        fireEvent(getByTestId('transition-active'), 'responderGrant', {
            nativeEvent: {
                changedTouches: [],
                identifier: '1',
                locationX: 0,
                locationY: 0,
                pageX: 0,
                pageY: 0,
                target: '1',
                timestamp: Date.now(),
                touches: [],
            },
            touchHistory: { touchBank: [] },
            persist: jest.fn(),
        })

        expect(createAnimatedComponent).toHaveBeenCalledTimes(1)
        const activeStyles = getStylesFromId('transition-active')
        expect(activeStyles).toEqual(
            {
                transitionProperty: ['all'],
                transitionDuration: '100ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
                backgroundColor: '#6a7282',
            },
        )
        expect(activeStyles.transitionTimingFunction.toString()).toBe('cubicBezier(0.4000000059604645, 0, 0.20000000298023224, 1)')
    })

    test('Transition reactivity with disabled modifier', () => {
        const { getStylesFromId } = renderUniwind(
            <Pressable
                className="transition-all duration-300 opacity-100 disabled:duration-700 disabled:opacity-50"
                disabled={true}
                testID="transition-disabled"
            />,
        )

        expect(getStylesFromId('transition-disabled')).toEqual(
            {
                transitionProperty: ['all'],
                transitionDuration: '700ms',
                transitionTimingFunction: {
                    normalize: expect.any(Function),
                    toString: expect.any(Function),
                },
                opacity: 0.5,
            },
        )
    })
})
