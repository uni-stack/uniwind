import type { TokenOrValue } from 'lightningcss'
import type { DeclarationValues } from '../types'
import { toCamelCase } from '../utils'

type GetProcessedValue = (value: DeclarationValues) => any

const parseValues = (
    tokens: Array<TokenOrValue>,
    getProcessedValue: GetProcessedValue,
) => {
    const groups: Array<Array<TokenOrValue>> = []
    let group: Array<TokenOrValue> = []

    for (const token of tokens) {
        if (
            (
                token.type === 'token'
                && token.value.type === 'delim'
                && token.value.value === '|'
            )
        ) {
            if (group.length > 0) {
                groups.push(group)
                group = []
            }
            continue
        }
        group.push(token)
    }

    if (group.length > 0) {
        groups.push(group)
    }

    const values = groups.map((groupTokens) => tokensToText(groupTokens, getProcessedValue))

    return values.length > 1 ? values : values[0]
}

const tokensToText = (
    tokens: Array<TokenOrValue>,
    getProcessedValue: GetProcessedValue,
) => {
    return tokens
        .map((token) => {
            const value = getProcessedValue(token)
            if (typeof value === 'string') {
                return /^"[^"]+"$/.test(value) ? value : `"${value}"`
            }
            return value
        })
        .join(' ')
        .trim()
}

export const getProcessedAnimation = (
    declarationValue: Array<TokenOrValue>,
    getProcessedValue: GetProcessedValue,
) => {
    const segments: Array<Array<TokenOrValue>> = []
    const result: Array<[string, any]> = []
    let current: Array<TokenOrValue> = []

    for (const token of declarationValue) {
        if (token.type === 'var') {
            return getProcessedValue(token)
        }

        if (token.type === 'token' && token.value.type === 'comma') {
            if (current.length > 0) {
                segments.push(current)
                current = []
            }
            continue
        }

        current.push(token)
    }

    if (current.length > 0) {
        segments.push(current)
    }

    for (const segment of segments) {
        const colonIndex = segment.findIndex((token) => token.type === 'token' && token.value.type === 'colon')

        if (colonIndex === -1) {
            const nameValue = parseValues(segment, getProcessedValue)
            result.push(['name', Array.isArray(nameValue) ? nameValue : [nameValue]])
            continue
        }

        const keyTokens = segment.slice(0, colonIndex)
        const valueTokens = segment.slice(colonIndex + 1)
        const rawKey = tokensToText(keyTokens, getProcessedValue)
        const value = parseValues(valueTokens, getProcessedValue)
        const key = toCamelCase(rawKey)
        result.push([key, value])
    }

    return result
}
