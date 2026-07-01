const types = ['margin', 'padding', 'inset'] as const
const sides = ['inset', 'x', 'y', 'top', 'bottom', 'left', 'right'] as const
const logicalSides = ['start', 'end'] as const
const safeAreaTypes = ['safe', 'safe-or-*', 'safe-offset-*'] as const
const spacing = '--spacing(--value(integer))'
const length = '--value([length], --spacing-*)'

type Side = (typeof sides)[number]
type LogicalSide = (typeof logicalSides)[number]
type TypeName = (typeof types)[number]
type SafeAreaType = (typeof safeAreaTypes)[number]
type Inset = 'top' | 'bottom' | 'left' | 'right'

const generateCSSForInsets = () => {
    let css = `@utility h-screen-safe {
    height: calc(100vh - (env(safe-area-inset-top) + env(safe-area-inset-bottom)));
}\n\n`

    const getInsetsForSide = (side: Side): Array<Inset> => {
        switch (side) {
            case 'top':
                return ['top']
            case 'bottom':
                return ['bottom']
            case 'left':
                return ['left']
            case 'right':
                return ['right']
            case 'x':
                return ['left', 'right']
            case 'y':
                return ['top', 'bottom']
            case 'inset':
                return ['top', 'bottom', 'left', 'right']
            default:
                side satisfies never
                return []
        }
    }

    const getUtilityName = (typeName: TypeName, side: Side, safeAreaType: SafeAreaType) => {
        if (typeName === 'inset') {
            return `${side}-${safeAreaType}`
        }

        const sideSuffix = side === 'inset' ? '' : side.at(0)

        return `${typeName.at(0)}${sideSuffix}-${safeAreaType}`
    }

    const getStyleProperty = (typeName: TypeName, inset: Inset) => {
        if (typeName === 'inset') {
            return inset
        }

        return `${typeName}-${inset}`
    }

    const getLogicalUtilityName = (typeName: TypeName, side: LogicalSide, safeAreaType: SafeAreaType) => {
        if (typeName === 'inset') {
            return `${side}-${safeAreaType}`
        }

        return `${typeName.at(0)}${side.at(0)}-${safeAreaType}`
    }

    const getLogicalStyleProperty = (typeName: TypeName, side: LogicalSide) => {
        if (typeName === 'inset') {
            return `inset-inline-${side}`
        }

        return `${typeName}-inline-${side}`
    }

    const getLogicalInset = (side: LogicalSide, rtl: boolean): Inset => {
        if (side === 'start') {
            return rtl ? 'right' : 'left'
        }

        return rtl ? 'left' : 'right'
    }

    const getStylesForSafeAreaType = (safeAreaType: SafeAreaType, styles: Array<string>) => {
        switch (safeAreaType) {
            case 'safe':
                return styles
            case 'safe-or-*':
                return styles.flatMap(style => {
                    const styleWithoutSemicolon = style.replace(';', '')

                    return [
                        styleWithoutSemicolon.replace(/: (env.*)/, (_, env) => `: max(${env}, ${spacing});`),
                        styleWithoutSemicolon.replace(/: (env.*)/, (_, env) => `: max(${env}, ${length});`),
                    ]
                })
            case 'safe-offset-*':
                return styles.flatMap(style => {
                    const styleWithoutSemicolon = style.replace(';', '')

                    return [
                        styleWithoutSemicolon.replace(/: (env.*)/, (_, env) => `: calc(${env} + ${spacing});`),
                        styleWithoutSemicolon.replace(/: (env.*)/, (_, env) => `: calc(${env} + ${length});`),
                    ]
                })
            default:
                safeAreaType satisfies never
                return []
        }
    }

    types.forEach(type => {
        sides.forEach(side => {
            const insets = getInsetsForSide(side)
            const styles = insets.map(inset => `${getStyleProperty(type, inset)}: env(safe-area-inset-${inset});`)

            safeAreaTypes.forEach(safeAreaType => {
                const utilityName = getUtilityName(type, side, safeAreaType)

                css += [
                    `@utility ${utilityName} {`,
                    ...getStylesForSafeAreaType(safeAreaType, styles).map(style => `    ${style}`),
                    '}',
                    '',
                    '',
                ].join('\n')
            })
        })

        logicalSides.forEach(side => {
            const styleProperty = getLogicalStyleProperty(type, side)
            const ltrStyles = [`${styleProperty}: env(safe-area-inset-${getLogicalInset(side, false)});`]
            const rtlStyles = [`${styleProperty}: env(safe-area-inset-${getLogicalInset(side, true)});`]

            safeAreaTypes.forEach(safeAreaType => {
                const utilityName = getLogicalUtilityName(type, side, safeAreaType)

                css += [
                    `@utility ${utilityName} {`,
                    ...getStylesForSafeAreaType(safeAreaType, ltrStyles).map(style => `    ${style}`),
                    '',
                    '    @variant rtl {',
                    ...getStylesForSafeAreaType(safeAreaType, rtlStyles).map(style => `        ${style}`),
                    '    }',
                    '}',
                    '',
                    '',
                ].join('\n')
            })
        })
    })

    // Remove the last newline character
    return css.slice(0, -1)
}

export const INSETS_CSS = generateCSSForInsets()
