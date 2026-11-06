import type { MediaQueryResolver } from './types'

export const generateMatches = (meta: MediaQueryResolver) => {
    const conditions = meta.conditions.filter(condition => condition !== 'true')

    if (meta.theme !== null) {
        conditions.push(`(context.scopedTheme ?? rt.currentThemeName) === ${JSON.stringify(meta.theme)}`)
    }

    if (meta.rtl !== null) {
        conditions.push(`(context.rtl ?? rt.rtl) === ${meta.rtl}`)
    }

    for (const [variant, state] of [['active', 'isPressed'], ['focus', 'isFocused'], ['disabled', 'isDisabled']] as const) {
        if (meta[variant] !== null) {
            conditions.push(`state?.${state} === ${meta[variant]}`)
        }
    }

    for (const [attribute, expected] of Object.entries(meta.dataAttributes ?? {})) {
        const value = `props?.[${JSON.stringify(attribute)}]`

        if (expected === '"true"' || expected === '"false"') {
            conditions.push(`(${value} === ${expected.slice(1, -1)} || ${value} === ${expected})`)
        } else {
            conditions.push(`${value} === ${expected}`)
        }
    }

    return `function(rt, context, props, state, vars) { return ${conditions.join(' && ') || 'true'} }`
}
