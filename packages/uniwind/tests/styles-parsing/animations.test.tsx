import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('CSS Animations', () => {
    test('Animation Name', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-spin" testID="animate-spin" />
                <View className="animate-ping" testID="animate-ping" />
                <View className="animate-pulse" testID="animate-pulse" />
                <View className="animate-bounce" testID="animate-bounce" />
                <View className="animate-[fade-in]" testID="animate-custom" />
            </React.Fragment>,
        )

        expect(getStylesFromId('animate-spin')).toEqual({
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationName: {
                to: {
                    transform: [
                        {
                            rotate: '360deg',
                        },
                    ],
                },
            },
            animationTimingFunction: 'linear',
        })
        expect(getStylesFromId('animate-ping')).toEqual({
            animationDuration: '1s',
            animationIterationCount: 'infinite',
            animationName: {
                '100%': {
                    opacity: 0,
                    transform: [
                        {
                            scale: 2,
                        },
                    ],
                },
                '75%': {
                    opacity: 0,
                    transform: [
                        {
                            scale: 2,
                        },
                    ],
                },
            },
            animationTimingFunction: expect.objectContaining({
                normalize: expect.any(Function),
                toString: expect.any(Function),
            }),
        })
        expect(getStylesFromId('animate-pulse')).toEqual({
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationName: {
                '50%': {
                    opacity: 0.5,
                },
            },
            animationTimingFunction: expect.objectContaining({
                normalize: expect.any(Function),
                toString: expect.any(Function),
            }),
        })
        expect(getStylesFromId('animate-bounce')).toEqual({
            'animationDuration': '1s',
            'animationIterationCount': 'infinite',
            animationName: {
                '0%': {
                    animationTimingFunction: expect.objectContaining({
                        normalize: expect.any(Function),
                        toString: expect.any(Function),
                    }),
                    'transform': [
                        {
                            'translateY': '-25%',
                        },
                    ],
                },
                '100%': {
                    'animationTimingFunction': expect.objectContaining({
                        normalize: expect.any(Function),
                        toString: expect.any(Function),
                    }),
                    'transform': [
                        {
                            'translateY': '-25%',
                        },
                    ],
                },
                '50%': {
                    'animationTimingFunction': expect.objectContaining({
                        normalize: expect.any(Function),
                        toString: expect.any(Function),
                    }),
                    'transform': [],
                },
            },
        })
        expect(getStylesFromId('animate-custom')).toEqual({
            animationName: [],
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Animation Duration', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[75ms]" testID="duration-75" />
                <View className="animate-[100ms]" testID="duration-100" />
                <View className="animate-[150ms]" testID="duration-150" />
                <View className="animate-[200ms]" testID="duration-200" />
                <View className="animate-[300ms]" testID="duration-300" />
                <View className="animate-[500ms]" testID="duration-500" />
                <View className="animate-[700ms]" testID="duration-700" />
                <View className="animate-[1000ms]" testID="duration-1000" />
                <View className="animate-[1s]" testID="duration-1s" />
            </React.Fragment>,
        )

        expect(getStylesFromId('duration-75')).toEqual({
            animationDuration: '75ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-100')).toEqual({
            animationDuration: '100ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-150')).toEqual({
            animationDuration: '150ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-200')).toEqual({
            animationDuration: '200ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-300')).toEqual({
            animationDuration: '300ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-500')).toEqual({
            animationDuration: '500ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-700')).toEqual({
            animationDuration: '700ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-1000')).toEqual({
            animationDuration: '1000ms',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('duration-1s')).toEqual({
            animationDuration: '1s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Animation Delay', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[spin,delay:75ms]" testID="delay-75" />
                <View className="animate-[spin,delay:100ms]" testID="delay-100" />
                <View className="animate-[spin,delay:150ms]" testID="delay-150" />
                <View className="animate-[spin,delay:200ms]" testID="delay-200" />
                <View className="animate-[spin,delay:300ms]" testID="delay-300" />
                <View className="animate-[spin,delay:500ms]" testID="delay-500" />
            </React.Fragment>,
        )

        const spinAnimationName = [
            {
                to: {
                    transform: [
                        {
                            rotate: '360deg',
                        },
                    ],
                },
            },
        ]

        expect(getStylesFromId('delay-75')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '75ms',
        })
        expect(getStylesFromId('delay-100')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '100ms',
        })
        expect(getStylesFromId('delay-150')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '150ms',
        })
        expect(getStylesFromId('delay-200')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '200ms',
        })
        expect(getStylesFromId('delay-300')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '300ms',
        })
        expect(getStylesFromId('delay-500')).toEqual({
            animationName: spinAnimationName,
            animationDelay: '500ms',
        })
    })

    test('Animation Timing Function', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[linear]" testID="timing-linear" />
                <View className="animate-[ease]" testID="timing-ease" />
                <View className="animate-[ease-in]" testID="timing-ease-in" />
                <View className="animate-[ease-out]" testID="timing-ease-out" />
                <View className="animate-[ease-in-out]" testID="timing-ease-in-out" />
            </React.Fragment>,
        )

        expect(getStylesFromId('timing-linear')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'linear',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('timing-ease')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('timing-ease-in')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease-in',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('timing-ease-out')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease-out',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('timing-ease-in-out')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Animation Direction', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[normal]" testID="direction-normal" />
                <View className="animate-[reverse]" testID="direction-reverse" />
                <View className="animate-[alternate]" testID="direction-alternate" />
                <View className="animate-[alternate-reverse]" testID="direction-alternate-reverse" />
            </React.Fragment>,
        )

        expect(getStylesFromId('direction-normal')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('direction-reverse')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'reverse',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('direction-alternate')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'alternate',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('direction-alternate-reverse')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'alternate-reverse',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Animation Iteration Count', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[1]" testID="iteration-1" />
                <View className="animate-[2]" testID="iteration-2" />
                <View className="animate-[3]" testID="iteration-3" />
                <View className="animate-[infinite]" testID="iteration-infinite" />
            </React.Fragment>,
        )

        expect(getStylesFromId('iteration-1')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('iteration-2')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 2,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('iteration-3')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 3,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('iteration-infinite')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 'infinite',
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Animation Fill Mode', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-none" testID="fill-none" />
                <View className="animate-[forwards]" testID="fill-forwards" />
                <View className="animate-[backwards]" testID="fill-backwards" />
                <View className="animate-[both]" testID="fill-both" />
            </React.Fragment>,
        )

        expect(getStylesFromId('fill-none')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('fill-forwards')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
            animationFillMode: 'forwards',
        })
        expect(getStylesFromId('fill-backwards')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
            animationFillMode: 'backwards',
        })
        expect(getStylesFromId('fill-both')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
            animationFillMode: 'both',
        })
    })

    test('Animation Play State', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View className="animate-[running]" testID="play-running" />
                <View className="animate-[paused]" testID="play-paused" />
            </React.Fragment>,
        )

        expect(getStylesFromId('play-running')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'running',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
        expect(getStylesFromId('play-paused')).toEqual({
            animationDuration: '0s',
            animationTimingFunction: 'ease',
            animationIterationCount: 1,
            animationDirection: 'normal',
            animationPlayState: 'paused',
            animationDelay: '0s',
            animationTimeline: 'auto',
        })
    })

    test('Combined Animation Properties', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="animate-[spin,duration:1s,delay:200ms,timing-function:ease-in-out,direction:alternate,iteration-count:infinite,fill-mode:forwards,play-state:running]"
                    testID="combined-animation"
                />
            </React.Fragment>,
        )

        expect(getStylesFromId('combined-animation')).toEqual({
            animationName: [
                {
                    to: {
                        transform: [
                            {
                                rotate: '360deg',
                            },
                        ],
                    },
                },
            ],
            animationDuration: '1s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationPlayState: 'running',
            animationDelay: '200ms',
            animationFillMode: 'forwards',
        })
    })

    test('Multiple Animations', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="animate-[spin|fade-in,duration:1s|500ms,delay:0|200ms]"
                    testID="multiple-animations"
                />
            </React.Fragment>,
        )

        expect(getStylesFromId('multiple-animations')).toEqual({
            animationName: [
                {
                    to: {
                        transform: [
                            {
                                rotate: '360deg',
                            },
                        ],
                    },
                },
            ],
            animationDuration: ['1s', '500ms'],
            animationDelay: [0, '200ms'],
        })
    })

    test('Animation with Transform', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="animate-spin rotate-45 scale-50"
                    testID="animation-with-transform"
                />
            </React.Fragment>,
        )

        expect(getStylesFromId('animation-with-transform')).toEqual({
            animationName: {
                to: {
                    transform: [
                        {
                            rotate: '360deg',
                        },
                    ],
                },
            },
            animationDuration: '1s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            transform: [
                {
                    rotateZ: '45deg',
                },
                {
                    scaleX: 0.5,
                },
                {
                    scaleY: 0.5,
                },
            ],
        })
    })
})
