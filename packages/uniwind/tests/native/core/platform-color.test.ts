import type * as NativeUtils from '../../../src/core/native/native-utils'

const loadPlatformColor = (os: 'ios' | 'android', takesFallback: boolean) => {
    let platformColor: typeof NativeUtils.platformColor | undefined

    jest.isolateModules(() => {
        const { Platform } = require('react-native')

        Platform.OS = os
        jest.doMock('../../../src/core/reactNativeVersion', () => ({ isReactNativeAtLeast: () => takesFallback }))
        platformColor = require('../../../src/core/native/native-utils').platformColor
    })

    return platformColor!
}

describe('platformColor', () => {
    afterEach(() => {
        jest.dontMock('../../../src/core/reactNativeVersion')
    })

    test('names an Android resource with the appearance it was resolved in', () => {
        expect(loadPlatformColor('android', true)(['label'], ['?attr/colorPrimary'], '#000000')).toEqual({
            resource_paths: ['?attr/colorPrimary'],
            uniwindColorScheme: ['light'],
            fallback: '#000000',
        })
    })

    test('leaves the fallback out below React Native 0.88', () => {
        expect(loadPlatformColor('android', false)(['label'], ['?attr/colorPrimary'], '#000000')).toEqual({
            resource_paths: ['?attr/colorPrimary'],
            uniwindColorScheme: ['light'],
        })
        expect(loadPlatformColor('ios', false)(['label'], [], '#000000')).toEqual({ semantic: ['label'] })
    })

    test('takes the fallback without a name for the platform', () => {
        expect(loadPlatformColor('ios', true)([], ['?attr/colorPrimary'], '#000000')).toBe('#000000')
    })
})
