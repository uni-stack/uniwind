import { Logger } from '../logger'
import { addMissingSpaces, isNumber, isValidJSValue, pipe, roundToPrecision, smartSplit } from './common'

const parseStringValue = (value: string) => {
    if (isValidJSValue(value)) {
        return value
    }

    if (value.startsWith('function')) {
        return value
    }

    const tokens = smartSplit(addMissingSpaces(value))
    const parsedTokens = tokens.map(token => {
        // String literals
        if (token.startsWith('"')) {
            return token.replace(/"/g, '')
        }

        // Plain words
        if (/^[a-z]+$/i.test(token.replace(/,/g, ''))) {
            return token
        }

        // Numbers
        if (isNumber(token)) {
            return token
        }

        // Expressions that need to be wrapped with ${}
        const endsWithComma = token.endsWith(',')
        const expr = endsWithComma ? token.slice(0, -1) : token

        // Only wrap in ${} if the expression is valid JS — otherwise treat as plain string
        if (!isValidJSValue(expr)) {
            return token
        }

        return [
            '${',
            expr,
            '}',
            endsWithComma ? ',' : '',
        ].join('')
    })

    return [
        '`',
        parsedTokens.join(' '),
        '`',
    ].join('')
}

export const serialize = (value: any): string => {
    const typeOfValue = typeof value

    switch (typeOfValue) {
        case 'string':
            return parseStringValue(value)
        case 'symbol':
            return String(value)
        case 'number':
        case 'bigint':
            return String(roundToPrecision(value, 2))
        case 'boolean':
            return value.toString()
        case 'object':
            if (value === null) {
                return 'null'
            }

            if (Array.isArray(value)) {
                return [
                    '[',
                    value.map(serialize).join(', '),
                    ']',
                ].join('')
            }

            return [
                '{',
                Object.entries(value).map(([key, val]) => {
                    const serializedKey = isNumber(key) ? key : `"${key}"`

                    return `${serializedKey}: ${serialize(val)}`
                }).join(', '),
                '}',
            ].join('')
        case 'undefined':
            return 'undefined'
        case 'function':
            return ''
        default:
            typeOfValue satisfies never
            return ''
    }
}

export const serializeJSObject = (obj: Record<string, any>, serializer: (key: string, value: string) => string) => {
    const serializedObject = pipe(obj)(
        Object.entries,
        entries => entries.map(([key, value]) => serializer(key, serialize(value))),
        serializedValues =>
            serializedValues.filter(serializedValue => {
                try {
                    new Function(`function validateJS() { const obj = ({ ${serializedValue} }) }`)

                    return true
                } catch {
                    Logger.error(`Failed to serialize ${serializedValue} as a valid JS object entry. Skipping.`)

                    return false
                }
            }),
        entries => entries.join(','),
        result => {
            if (result === '') {
                return ''
            }

            return `${result},`
        },
    )

    return serializedObject
}
