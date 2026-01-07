import { addMissingSpaces, isDefined, pipe, removeKeys, toCamelCase } from '../utils'
import type { ProcessorBuilder } from './processor'

const cssToRNMap: Record<string, (value: any) => Record<string, any>> = {
    backgroundSize: value => {
        return {
            resizeMode: value,
        }
    },
    transitionProperty: (value: string) => {
        return {
            transitionProperty: value
                .replace(/"/g, '')
                .split(',')
                .filter(token => token !== '' && !token.startsWith('--'))
                .map(token => `"${toCamelCase(token)}"`),
        }
    },
    flex: (value: any) => {
        if (typeof value === 'object') {
            return value
        }

        return {
            flex: value,
        }
    },
    overflow: (value: any) => {
        if (typeof value === 'object') {
            return value
        }

        return {
            overflow: value,
        }
    },
    backdropFilter: () => ({}),
    backgroundImage: value => ({
        experimental_backgroundImage: value,
    }),
    borderSpacing: () => ({}),
    translate: value => {
        if (typeof value === 'object' && 'x' in value && 'y' in value) {
            return {
                translateX: value.x,
                translateY: value.y,
            }
        }

        if (typeof value === 'string') {
            const [x, y] = value.split(' ')

            return {
                translateX: x,
                translateY: y ?? x,
            }
        }

        return {}
    },
    rotate: value => {
        if (typeof value === 'object') {
            return value
        }

        return {
            rotate: value,
        }
    },
    scale: value => {
        if (typeof value === 'object') {
            return {
                scaleX: value.x,
                scaleY: value.y,
                scaleZ: value.z,
            }
        }

        if (typeof value === 'string') {
            const [x, y, z] = value.split(' ')

            return {
                scaleX: x,
                scaleY: y,
                scaleZ: z,
            }
        }

        return {}
    },
    transform: value => {
        if (typeof value === 'string' || Array.isArray(value)) {
            return {
                transform: value,
            }
        }

        if (typeof value === 'object') {
            return Object.keys(value).length === 0
                ? { transform: [] }
                : value
        }

        return {}
    },
    fontSize: value => {
        return {
            fontSize: value,
            '--uniwind-em': value,
        }
    },
    borderInlineWidth: value => {
        const borderWidth = typeof value === 'object'
            ? Object.values(value)[0]
            : value

        return {
            borderLeftWidth: borderWidth,
            borderRightWidth: borderWidth,
        }
    },
    borderBlockWidth: value => {
        const borderWidth = typeof value === 'object'
            ? Object.values(value)[0]
            : value

        return {
            borderTopWidth: borderWidth,
            borderBottomWidth: borderWidth,
        }
    },
    borderInlineStyle: value => {
        return {
            borderStyle: value,
        }
    },
    borderBlockStyle: value => {
        return {
            borderStyle: value,
        }
    },
    borderStyle: value => {
        const borderStyle = typeof value === 'object'
            ? Object.values(value)[0]
            : value

        return {
            borderStyle,
        }
    },
    transformOrigin: value => {
        if (typeof value === 'object') {
            return {
                transformOrigin: `${value.x} ${value.y}`,
            }
        }

        return {
            transformOrigin: value,
        }
    },
    fontVariantNumeric: value => ({
        fontVariant: value,
    }),
}

const BORDER_WIDTH_KEYS = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']

export class RN {
    constructor(private readonly Processor: ProcessorBuilder) {}

    cssToRN(property: string, value: any) {
        const transformedProperty = property.startsWith('--')
            ? property
            : pipe(property)(
                toCamelCase,
                x => {
                    if (x.includes('padding') || x.includes('margin')) {
                        return x
                            .replace('Inline', 'Horizontal')
                            .replace('Block', 'Vertical')
                    }

                    return x
                },
            )

        const rn = this.transformProperty(
            transformedProperty,
            typeof value === 'string' ? addMissingSpaces(value) : value,
        )
        const joinedStyles = this.joinStyles(rn)

        return Object.entries(joinedStyles).filter(([, value]) => isDefined(value)) as Array<[string, any]>
    }

    private transformProperty(property: string, value: any) {
        if (property in cssToRNMap) {
            return cssToRNMap[property]!(value)
        }

        if (typeof value === 'object') {
            const transformed = this.transformObjectProperty(property, value)

            if (transformed) {
                return transformed
            }
        }

        return {
            [property]: value,
        }
    }

    private transformObjectProperty(property: string, value: Record<string, any>) {
        const properties = Object.keys(value)
        // border properties are border{X}Color instead of borderColor{X}
        const propertyEnd = property.includes('border')
            ? property.split('border').at(-1) ?? ''
            : ''
        const transformedProperty = property.replace(propertyEnd, '')
        const isSpacing = property.includes('margin') || property.includes('padding')

        const wrapProperty = (prop: string) => `${transformedProperty}${prop}${propertyEnd}`

        if (properties.every(property => ['row', 'column'].includes(property))) {
            return {
                rowGap: value.row,
                columnGap: value.column,
            }
        }

        if (properties.every(property => ['start', 'end'].includes(property))) {
            if (isSpacing && property.includes('Horizontal')) {
                return {
                    [`${property.replace('Horizontal', 'Left')}`]: value.start,
                    [`${property.replace('Horizontal', 'Right')}`]: value.end,
                }
            }

            if (isSpacing && property.includes('Vertical')) {
                return {
                    [`${property.replace('Vertical', 'Top')}`]: value.start,
                    [`${property.replace('Vertical', 'Bottom')}`]: value.end,
                }
            }

            return {
                [wrapProperty('Start')]: value.start,
                [wrapProperty('End')]: value.end,
            }
        }

        if (properties.every(property => ['top', 'right', 'bottom', 'left'].includes(property))) {
            return {
                [wrapProperty('Top')]: value.top,
                [wrapProperty('Right')]: value.right,
                [wrapProperty('Bottom')]: value.bottom,
                [wrapProperty('Left')]: value.left,
            }
        }

        if (properties.every(property => ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'].includes(property))) {
            return {
                [wrapProperty('TopLeft')]: value.topLeft,
                [wrapProperty('TopRight')]: value.topRight,
                [wrapProperty('BottomRight')]: value.bottomRight,
                [wrapProperty('BottomLeft')]: value.bottomLeft,
            }
        }

        if (properties.every(property => ['style', 'width', 'color'].includes(property))) {
            return {
                [wrapProperty('Style')]: value.style,
                [wrapProperty('Width')]: value.width,
                [wrapProperty('Color')]: value.color,
            }
        }
    }

    // Used when they're multiple styles with the same value that could be joined
    private joinStyles(styles: Record<string, any>) {
        const keys = Object.keys(styles)

        if (BORDER_WIDTH_KEYS.every(key => keys.includes(key))) {
            const borderWidth = styles.borderTopWidth

            // Join border widths
            if (BORDER_WIDTH_KEYS.every(key => styles[key] === borderWidth)) {
                return {
                    ...removeKeys(styles, BORDER_WIDTH_KEYS),
                    borderWidth,
                }
            }
        }

        return styles
    }
}
