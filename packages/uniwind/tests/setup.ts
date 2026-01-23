import { readFileSync } from 'fs'
import { resolve } from 'path'
import { Dimensions } from 'react-native'
import { ControlPoint, StepsModifier } from 'react-native-reanimated/lib/typescript/css/easing'
import { compileVirtual } from '../src/metro/compileVirtual'
import { Platform } from '../src/metro/types'
import { SAFE_AREA_INSET_BOTTOM, SAFE_AREA_INSET_TOP, SCREEN_HEIGHT, SCREEN_WIDTH } from './consts'

// Setup Reanimated for Jest
jest.mock('react-native-reanimated', () => {
    // const reanimated = jest.requireActual('react-native-reanimated/mock')
    return {
        // ...reanimated,
        createAnimatedComponent: jest.fn((value: any) => value),
        cubicBezier: (x1: number, y1: number, x2: number, y2: number) => ({
            toString: jest.fn(() => `cubicBezier(${x1}, ${y1}, ${x2}, ${y2})`),
            normalize: jest.fn(() => ({
                name: 'cubicBezier',
                x1,
                y1,
                x2,
                y2,
            })),
        }),
        steps: (count: number, position: StepsModifier) => ({
            toString: jest.fn(() => `steps(${count}, ${position})`),
            normalize: jest.fn(() => ({
                name: 'steps',
                count,
                position,
            })),
        }),
        linear: (...points: ControlPoint[]) => ({
            toString: jest.fn(() => `linear(${points.join(',')})`),
            normalize: jest.fn(() => ({
                name: 'linear',
                points,
            })),
        }),
    }
})

jest.spyOn(Dimensions, 'get').mockReturnValue({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, scale: 1, fontScale: 1 })

beforeAll(async () => {
    const cssPath = resolve('./tests/test.css')
    const css = readFileSync(cssPath, 'utf-8')
    const virtualCode = await compileVirtual({
        css,
        cssPath,
        debug: true,
        platform: Platform.iOS,
        themes: ['light', 'dark'],
        polyfills: undefined,
    })

    eval(
        `const { Uniwind } = require('../src/core/config/config.native');
        Uniwind.__reinit(rt => ${virtualCode}, ['light', 'dark']);
            Uniwind.updateInsets({
            top: ${SAFE_AREA_INSET_TOP},
            left: 0,
            bottom: ${SAFE_AREA_INSET_BOTTOM},
            right: 0,
        });
    `,
    )
})
