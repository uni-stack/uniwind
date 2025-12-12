import * as React from 'react'
import View from '../../src/components/native/View'
import { renderUniwind } from '../utils'

describe('Colors', () => {
    test('Built in', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="bg-red-500"
                    testID="red"
                />
                <View
                    className="bg-blue-500/50"
                    testID="blue-alpha"
                />
                <View
                    className="bg-black"
                    testID="black"
                />
                <View
                    className="bg-[#00ff00]"
                    testID="custom-hex-green"
                />
                <View
                    className="bg-[#00ff0080]"
                    testID="custom-hex-green-alpha"
                />
                <View
                    className="bg-[rgb(255,0,0)]"
                    testID="custom-rgb-red"
                />
                <View
                    className="bg-[rgba(255,0,0,0.5)]"
                    testID="custom-rgba-red-alpha"
                />
            </React.Fragment>,
        )

        const redStyles = getStylesFromId('red')
        expect(redStyles.backgroundColor).toBe('#fb2c36')

        const blueAlphaStyles = getStylesFromId('blue-alpha')
        expect(blueAlphaStyles.backgroundColor).toBe('#2b7fff80')

        const blackStyles = getStylesFromId('black')
        expect(blackStyles.backgroundColor).toBe('#000000')
    })

    test('Custom', () => {
        const { getStylesFromId } = renderUniwind(
            <React.Fragment>
                <View
                    className="bg-[#00ff00]"
                    testID="custom-hex-green"
                />
                <View
                    className="bg-[#00ff0080]"
                    testID="custom-hex-green-alpha"
                />
                <View
                    className="bg-[rgb(255,0,0)]"
                    testID="custom-rgb-red"
                />
                <View
                    className="bg-[rgba(255,0,0,0.5)]"
                    testID="custom-rgba-red-alpha"
                />
            </React.Fragment>,
        )

        const customHexGreenStyles = getStylesFromId('custom-hex-green')
        expect(customHexGreenStyles.backgroundColor).toBe('#00ff00')

        const customHexGreenAlphaStyles = getStylesFromId('custom-hex-green-alpha')
        expect(customHexGreenAlphaStyles.backgroundColor).toBe('#00ff0080')

        const customRgbRedStyles = getStylesFromId('custom-rgb-red')
        expect(customRgbRedStyles.backgroundColor).toBe('#ff0000')

        const customRgbaRedAlphaStyles = getStylesFromId('custom-rgba-red-alpha')
        expect(customRgbaRedAlphaStyles.backgroundColor).toBe('#ff000080')
    })
})
