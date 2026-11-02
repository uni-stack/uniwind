import { parseColorText, toHexColor } from '../../uniparser/src/common/color'
import type { CSSVariables, UniwindRuntime, Var, Vars } from '../types'

const scopedVarsCache = new WeakMap<CSSVariables, Vars>()

// Normalizes a CSS variable value (numbers pass through, colors -> hex) and wraps it in a lazy getter
export const createVarGetter = (value: string | number): Var => () => {
    if (typeof value === 'number') {
        return value
    }

    const parsedColor = parseColorText(value)

    return parsedColor === undefined ? value : toHexColor(parsedColor)
}

export const getScopedVars = (variables: CSSVariables): Vars => {
    const cachedVars = scopedVarsCache.get(variables)

    if (cachedVars) {
        return cachedVars
    }

    const vars = Object.fromEntries(
        Object.entries(variables)
            .map(([name, value]) => [name, createVarGetter(value)]),
    ) as Vars

    scopedVarsCache.set(variables, vars)

    return vars
}

export function lightDark(this: UniwindRuntime, light: string, dark: string) {
    if (this.currentThemeName === 'dark') {
        return dark
    }

    return light
}

// css-cascade-5 inherit: the variable below the class's own declaration (theme, ScopedVariables or root), evaluated in that scope
export const readInheritedVariable = (vars: Vars, name: string) => {
    let owner: Vars | null = vars

    while (owner !== null && !Object.hasOwn(owner, name)) {
        owner = Object.getPrototypeOf(owner) as Vars | null
    }

    const parent = owner === null ? null : Object.getPrototypeOf(owner) as Vars | null

    return parent === null ? undefined : parent[name]?.(parent)
}
