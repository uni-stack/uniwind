export const parseTransitionsMutation = (styles: Record<string, any>) => {
    const duration = styles.transitionDuration
    if (typeof duration === 'string') {
        Object.defineProperty(styles, 'transitionDuration', {
            value: duration.includes(',') ? duration.split(',') : duration,
            configurable: true,
            enumerable: true,
        })
    }

    const delay = styles.transitionDelay
    if (typeof delay === 'string') {
        Object.defineProperty(styles, 'transitionDelay', {
            value: delay.includes(',') ? delay.split(',') : delay,
            configurable: true,
            enumerable: true,
        })
    }

    const timingFunction = styles.transitionTimingFunction
    if (
        typeof timingFunction === 'string'
        && timingFunction.includes(',')
        && !timingFunction.includes('(')
    ) {
        Object.defineProperty(styles, 'transitionTimingFunction', {
            value: timingFunction.split(','),
            configurable: true,
            enumerable: true,
        })
    }
}
