import {
    CSSAnimationDelay,
    CSSAnimationDirection,
    CSSAnimationFillMode,
    CSSAnimationIterationCount,
    CSSAnimationKeyframes,
    CSSAnimationPlayState,
} from 'react-native-reanimated'
import { ParametrizedTimingFunction, PredefinedTimingFunction } from 'react-native-reanimated/lib/typescript/css/easing'
import { UniwindRuntime } from '../../types'

// Pre-compiled regexes for performance (avoid recompilation on every call)
const TIME_REGEX = /^-?\d*(?:\.\d+)?(?:e[+-]?\d+)?(ms|s)$/
const ITERATION_COUNT_REGEX = /^\d+$/

// Static timing functions lookup (faster than chained comparisons)
const STATIC_TIMING_FUNCTIONS = new Set([
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'step-start',
    'step-end',
])

// Direction values lookup
const DIRECTION_VALUES = new Set(['normal', 'reverse', 'alternate', 'alternate-reverse'])

// Fill mode values lookup
const FILL_MODE_VALUES = new Set(['none', 'forwards', 'backwards', 'both'])

// Play state values lookup
const PLAY_STATE_VALUES = new Set(['running', 'paused'])

const isTimeString = (x: unknown): x is CSSAnimationDelay => {
    if (typeof x === 'number') return true
    return typeof x === 'string' && TIME_REGEX.test(x.trim())
}

const isTimingFunctionStatic = (x: unknown): x is PredefinedTimingFunction => {
    return typeof x === 'string' && STATIC_TIMING_FUNCTIONS.has(x)
}

const isTimingFunctionCustom = (x: unknown): x is ParametrizedTimingFunction => {
    if (typeof x !== 'string') return false
    return x.startsWith('cubicBezier(') || x.startsWith('steps(') || x.startsWith('linear(')
}

const isDirection = (x: unknown): x is CSSAnimationDirection => {
    return typeof x === 'string' && DIRECTION_VALUES.has(x)
}

const isFillMode = (x: unknown): x is CSSAnimationFillMode => {
    return typeof x === 'string' && FILL_MODE_VALUES.has(x)
}

const isPlayState = (x: unknown): x is CSSAnimationPlayState => {
    return typeof x === 'string' && PLAY_STATE_VALUES.has(x)
}

const isIterationCount = (x: unknown): x is CSSAnimationIterationCount => {
    if (x === 'infinite') return true
    return typeof x === 'string' && ITERATION_COUNT_REGEX.test(x)
}

/**
 * Parse and execute a custom timing function string
 */
const executeTimingFunction = (fnString: string, runtime: UniwindRuntime) => {
    const parenIndex = fnString.indexOf('(')
    if (parenIndex === -1) return fnString

    const fnName = fnString.slice(0, parenIndex)
    const fn = runtime[fnName as keyof UniwindRuntime]
    const args = fnString.slice(parenIndex + 1, -1)

    try {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
        return new Function('fn', `return fn(${args})`)(fn)
    } catch {
        return fnString
    }
}

/* @keyframes duration | easing-function | delay | iteration-count | direction | fill-mode | play-state | name */
export const parseAnimationsMutation = (
    styles: Record<string, any>,
    keyframes: Record<string, CSSAnimationKeyframes>,
    runtime: UniwindRuntime,
) => {
    const animationNameValue = styles.animationName
    if (typeof animationNameValue !== 'string') return

    let duration = false
    let timingFunctionBuffer = ''
    const tokens = animationNameValue.split(' ')

    for (const token of tokens) {
        // If we're accumulating a multi-token timing function (e.g., "cubicBezier(0.4, 0, 0.2, 1)")
        if (timingFunctionBuffer !== '') {
            timingFunctionBuffer += token

            if (token.endsWith(')')) {
                // Complete timing function - parse and execute it directly
                const result = executeTimingFunction(timingFunctionBuffer.replace(/\s+/g, ''), runtime)
                Object.defineProperty(styles, 'animationTimingFunction', {
                    value: result,
                    configurable: true,
                    enumerable: true,
                })
                timingFunctionBuffer = ''
            }
            continue
        }

        if (isTimeString(token) && !duration) {
            const numValue = Number(token)
            Object.defineProperty(styles, 'animationDuration', {
                value: isNaN(numValue) ? token : numValue,
                configurable: true,
                enumerable: true,
            })

            if (animationNameValue === token) delete styles.animationName
            duration = true
        } else if (isTimeString(token) && duration) {
            const numValue = Number(token)
            Object.defineProperty(styles, 'animationDelay', {
                value: isNaN(numValue) ? token : numValue,
                configurable: true,
                enumerable: true,
            })
        } else if (isTimingFunctionStatic(token)) {
            Object.defineProperty(styles, 'animationTimingFunction', {
                configurable: true,
                enumerable: true,
                value: token,
            })
        } else if (isTimingFunctionCustom(token)) {
            timingFunctionBuffer = token
        } else if (isIterationCount(token)) {
            Object.defineProperty(styles, 'animationIterationCount', {
                value: isNaN(Number(token)) ? token : Number(token),
                configurable: true,
                enumerable: true,
            })
        } else if (isDirection(token)) {
            Object.defineProperty(styles, 'animationDirection', {
                configurable: true,
                enumerable: true,
                value: token,
            })
        } else if (isFillMode(token)) {
            Object.defineProperty(styles, 'animationFillMode', {
                configurable: true,
                enumerable: true,
                value: token,
            })
        } else if (isPlayState(token)) {
            Object.defineProperty(styles, 'animationPlayState', {
                value: token,
                configurable: true,
                enumerable: true,
            })
        } else {
            Object.defineProperty(styles, 'animationName', {
                value: keyframes[token] ?? [],
                configurable: true,
                enumerable: true,
            })
        }
    }
}
