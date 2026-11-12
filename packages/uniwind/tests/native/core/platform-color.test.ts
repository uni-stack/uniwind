import { Appearance, Platform } from 'react-native'
import { platformColor } from '../../../src/core/native/native-utils'

describe('platformColor', () => {
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('names an Android resource with the appearance it was resolved in', () => {
        jest.replaceProperty(Platform, 'OS', 'android')
        jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark')

        expect(platformColor(['label'], ['?attr/colorPrimary'], '#000000')).toEqual({
            resource_paths: ['?attr/colorPrimary'],
            uniwindColorScheme: ['dark'],
            fallback: '#000000',
        })
    })

    test('takes the fallback without a name for the platform', () => {
        expect(platformColor([], ['?attr/colorPrimary'], '#000000')).toBe('#000000')
    })
})
