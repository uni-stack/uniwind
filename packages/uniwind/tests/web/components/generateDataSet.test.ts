import { describe, expect, test } from 'vitest'
import { generateDataSet } from '../../../src/components/web/generateDataSet'

describe('generateDataSet', () => {
    test('returns undefined when no dataSet or data attributes are provided', () => {
        expect(generateDataSet({})).toBeUndefined()
    })

    test('creates a dataSet from data attributes', () => {
        expect(generateDataSet({ 'data-test-value': 'test' })).toEqual({
            testValue: 'test',
        })
    })
})
